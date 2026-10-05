package vesremont

import (
	"context"
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"
)

type fakeTransport func(*http.Request) (*http.Response, error)

func (f fakeTransport) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func TestClientOffline(t *testing.T) {
	c, err := New("test-token", 15*time.Second)
	if err != nil {
		t.Fatal(err)
	}
	calls := 0
	c.http.Transport = fakeTransport(func(r *http.Request) (*http.Response, error) {
		calls++
		if r.URL.Host != "vesremont.com" || r.URL.Scheme != "https" || r.Header.Get("Authorization") != "Bearer test-token" {
			t.Fatal("unsafe origin/token")
		}
		if r.URL.Path != "/api/v1/products" || r.URL.Query().Get("q") != "труборез" {
			t.Fatal("invalid route")
		}
		return &http.Response{StatusCode: 200, Header: http.Header{}, Body: io.NopCloser(strings.NewReader(`{"ok":true}`))}, nil
	})
	if _, err = c.Search(context.Background(), "труборез", nil); err != nil {
		t.Fatal(err)
	}
	for _, path := range []string{"//evil.example", "/../oauth", "/products?x=1"} {
		if _, err = c.Request(context.Background(), "GET", path, Options{}); err == nil {
			t.Fatal("accepted bad path")
		}
	}
	if _, err = c.Request(context.Background(), "POST", "/orders/submit", Options{Body: map[string]any{}}); err == nil {
		t.Fatal("missing idempotency check")
	}
	if calls != 1 {
		t.Fatal("invalid input reached network")
	}
	c.http.Transport = fakeTransport(func(r *http.Request) (*http.Response, error) {
		calls++
		if r.URL.Path != "/api/v1/cart-drafts/" {
			t.Fatal("wrong draft URL")
		}
		return &http.Response{StatusCode: 429, Header: http.Header{"Retry-After": {"60"}}, Body: io.NopCloser(strings.NewReader(`{"code":"rate_limited","request_id":"abc","detail":"secret"}`))}, nil
	})
	_, err = c.CartDraft(context.Background(), 375094, 1, "")
	var apiError *ApiError
	if !errors.As(err, &apiError) || apiError.Status != 429 || apiError.RetryAfter != "60" || apiError.RequestID != "abc" || strings.Contains(err.Error(), "secret") {
		t.Fatal("unsafe error")
	}
	if calls != 2 {
		t.Fatal("unexpected retry")
	}
}

func TestLimits(t *testing.T) {
	if _, err := New(strings.Repeat("a", 8193), time.Second); err == nil {
		t.Fatal("token limit")
	}
	c, _ := New("", time.Second)
	c.http.Transport = fakeTransport(func(*http.Request) (*http.Response, error) {
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(strings.Repeat("x", maxReply+1)))}, nil
	})
	_, err := c.Status(context.Background())
	var apiError *ApiError
	if !errors.As(err, &apiError) || apiError.Code != "response_too_large" {
		t.Fatal("response limit")
	}
}

func TestRedirectDenied(t *testing.T) {
	c, _ := New("secret-token", time.Second)
	calls := 0
	c.http.Transport = fakeTransport(func(r *http.Request) (*http.Response, error) {
		calls++
		if r.URL.Host != "vesremont.com" {
			t.Fatal("token redirected off origin")
		}
		return &http.Response{StatusCode: 302, Header: http.Header{"Location": {"https://evil.example"}}, Body: io.NopCloser(strings.NewReader(`{}`))}, nil
	})
	_, err := c.Status(context.Background())
	var apiError *ApiError
	if !errors.As(err, &apiError) || apiError.Status != 302 || calls != 1 {
		t.Fatal("redirect was followed")
	}
}
