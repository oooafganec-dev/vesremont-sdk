// Package vesremont provides a bounded REST client, not a second API implementation.
package vesremont

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"
)

const origin = "https://vesremont.com/api/v1"
const maxReply = 2 * 1024 * 1024

var pathPattern = regexp.MustCompile(`^/[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*/?$`)
var tokenPattern = regexp.MustCompile(`^[A-Za-z0-9_.~-]+$`)
var keyPattern = regexp.MustCompile(`^[A-Za-z0-9._:-]{16,128}$`)
var fieldPattern = regexp.MustCompile(`^[a-z_]{1,40}$`)
var safePattern = regexp.MustCompile(`^[A-Za-z0-9_.:-]{1,128}$`)

// ApiError deliberately omits response bodies, tokens and request URLs.
type ApiError struct {
	Status                      int
	Code, RequestID, RetryAfter string
}

func (e *ApiError) Error() string { return fmt.Sprintf("Vesremont: %s (HTTP %d)", e.Code, e.Status) }

type Options struct {
	Query          map[string]string
	Body           map[string]any
	IdempotencyKey string
}

type Client struct {
	token string
	http  *http.Client
}

// New uses verified TLS, a fixed origin and no redirects or application retries.
func New(token string, timeout time.Duration) (*Client, error) {
	if token != "" && (len(token) > 8192 || !tokenPattern.MatchString(token)) {
		return nil, fmt.Errorf("invalid access token")
	}
	if timeout <= 0 || timeout > 60*time.Second {
		return nil, fmt.Errorf("timeout must be 0..60 seconds")
	}
	return &Client{token: token, http: &http.Client{Timeout: timeout,
		CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}}, nil
}

func safe(value string) string {
	if safePattern.MatchString(value) {
		return value
	}
	return ""
}

// Request returns the original JSON. Schemas and scopes remain in the server OpenAPI.
func (c *Client) Request(ctx context.Context, method, path string, options Options) (json.RawMessage, error) {
	if (method != "GET" && method != "POST" && method != "PATCH" && method != "DELETE") || !pathPattern.MatchString(path) {
		return nil, fmt.Errorf("invalid API method/path")
	}
	if method == "GET" && options.Body != nil {
		return nil, fmt.Errorf("GET body is not supported")
	}
	if options.IdempotencyKey != "" && !keyPattern.MatchString(options.IdempotencyKey) {
		return nil, fmt.Errorf("invalid idempotency key")
	}
	if method == "POST" && strings.TrimSuffix(path, "/") == "/orders/submit" && options.IdempotencyKey == "" {
		return nil, fmt.Errorf("Idempotency-Key is required")
	}
	query := url.Values{}
	for key, value := range options.Query {
		if !fieldPattern.MatchString(key) {
			return nil, fmt.Errorf("invalid query name")
		}
		query.Set(key, value)
	}
	encoded := query.Encode()
	if len(encoded) > 8192 {
		return nil, fmt.Errorf("query exceeds 8192 characters")
	}
	endpoint := origin + path
	if encoded != "" {
		endpoint += "?" + encoded
	}
	var payload []byte
	if options.Body != nil {
		var err error
		payload, err = json.Marshal(options.Body)
		if err != nil {
			return nil, fmt.Errorf("invalid JSON body")
		}
		if len(payload) > 65536 {
			return nil, fmt.Errorf("request body exceeds 64 KiB")
		}
	}
	req, err := http.NewRequestWithContext(ctx, method, endpoint, bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("invalid request context")
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "Vesremont-Go/0.2.0")
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}
	if options.IdempotencyKey != "" {
		req.Header.Set("Idempotency-Key", options.IdempotencyKey)
	}
	if options.Body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	response, err := c.http.Do(req)
	if err != nil {
		return nil, &ApiError{Code: "transport_error"}
	}
	defer response.Body.Close()
	raw, err := io.ReadAll(io.LimitReader(response.Body, maxReply+1))
	if err != nil {
		return nil, &ApiError{Status: response.StatusCode, Code: "transport_error"}
	}
	if len(raw) > maxReply {
		return nil, &ApiError{Status: response.StatusCode, Code: "response_too_large"}
	}
	if len(raw) != 0 && !json.Valid(raw) {
		return nil, &ApiError{Status: response.StatusCode, Code: "invalid_json"}
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		var problem struct {
			Code      string `json:"code"`
			RequestID string `json:"request_id"`
		}
		_ = json.Unmarshal(raw, &problem)
		code := safe(problem.Code)
		if code == "" {
			code = "http_error"
		}
		return nil, &ApiError{Status: response.StatusCode, Code: code, RequestID: safe(problem.RequestID), RetryAfter: safe(response.Header.Get("Retry-After"))}
	}
	return json.RawMessage(raw), nil
}

func (c *Client) Status(ctx context.Context) (json.RawMessage, error) {
	return c.Request(ctx, "GET", "/status", Options{})
}
func (c *Client) Cart(ctx context.Context) (json.RawMessage, error) {
	return c.Request(ctx, "GET", "/cart", Options{})
}
func (c *Client) Search(ctx context.Context, q string, query map[string]string) (json.RawMessage, error) {
	params := map[string]string{"q": q}
	for key, value := range query {
		if key != "q" {
			params[key] = value
		}
	}
	return c.Request(ctx, "GET", "/products", Options{Query: params})
}
func (c *Client) Product(ctx context.Context, id int64) (json.RawMessage, error) {
	if id < 1 || id > 2147483647 {
		return nil, fmt.Errorf("positive product ID required")
	}
	return c.Request(ctx, "GET", "/products/"+strconv.FormatInt(id, 10), Options{})
}
func (c *Client) CartDraft(ctx context.Context, id int64, quantity int, draft string) (json.RawMessage, error) {
	if id < 1 || id > 2147483647 || quantity < 1 || quantity > 99 {
		return nil, fmt.Errorf("invalid product ID/quantity")
	}
	query := map[string]string{"product_id": strconv.FormatInt(id, 10), "quantity": strconv.Itoa(quantity)}
	if draft != "" {
		query["draft"] = draft
	}
	return c.Request(ctx, "GET", "/cart-drafts/", Options{Query: query})
}
