"""Vesremont REST client. Verified TLS, fixed origin, no redirects or retries."""
import json
import re
import ssl
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import HTTPSHandler, HTTPRedirectHandler, Request, build_opener


class ApiError(Exception):
    def __init__(self, status, code, request_id=None, retry_after=None):
        super().__init__(f"Vesremont: {code} (HTTP {status})")
        self.status, self.code = status, code
        self.request_id, self.retry_after = request_id, retry_after


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def _safe(value):
    return value if isinstance(value, str) and re.fullmatch(r"[A-Za-z0-9_.:-]{1,128}", value) else None


def _id(value):
    if type(value) is not int or not 1 <= value <= 2147483647:
        raise ValueError("Positive product ID required")
    return value


class VesremontClient:
    def __init__(self, token="", timeout=15):
        if not isinstance(token, str) or (token and not re.fullmatch(r"[A-Za-z0-9_.~-]{1,8192}", token)):
            raise ValueError("Invalid access token")
        if type(timeout) not in (int, float) or not 0 < timeout <= 60:
            raise ValueError("Timeout must be 0..60 seconds")
        self._token, self._timeout = token, timeout
        self._opener = build_opener(_NoRedirect(), HTTPSHandler(context=ssl.create_default_context()))

    def request(self, method, path, *, query=None, body=None, idempotency_key=None):
        if method not in ("GET", "POST", "PATCH", "DELETE") or not re.fullmatch(r"/[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)*/?", path):
            raise ValueError("Invalid API method/path")
        if body is not None and (method == "GET" or not isinstance(body, dict)):
            raise ValueError("JSON object required; GET body is not supported")
        if method == "POST" and path.rstrip("/") == "/orders/submit" and not idempotency_key:
            raise ValueError("Idempotency-Key is required")
        params = {}
        for name, value in (query or {}).items():
            if not re.fullmatch(r"[a-z_]{1,40}", name) or type(value) not in (str, int, float, bool):
                raise ValueError("Query values must be scalar")
            params[name] = str(value).lower() if type(value) is bool else str(value)
        encoded = urlencode(params)
        if len(encoded) > 8192:
            raise ValueError("Query exceeds 8192 characters")
        url = "https://vesremont.com/api/v1" + path + ("?" + encoded if encoded else "")
        headers = {"Accept": "application/json", "User-Agent": "Vesremont-Python/0.2.0"}
        if self._token:
            headers["Authorization"] = "Bearer " + self._token
        if idempotency_key is not None:
            if not isinstance(idempotency_key, str) or not re.fullmatch(r"[A-Za-z0-9._:-]{16,128}", idempotency_key):
                raise ValueError("Invalid idempotency key")
            headers["Idempotency-Key"] = idempotency_key
        payload = None if body is None else json.dumps(body, ensure_ascii=False, allow_nan=False).encode("utf-8")
        if payload is not None:
            if len(payload) > 65536:
                raise ValueError("Request body exceeds 64 KiB")
            headers["Content-Type"] = "application/json"
        try:
            try:
                response = self._opener.open(Request(url, data=payload, headers=headers, method=method), timeout=self._timeout)
            except HTTPError as error:
                response = error
            with response:
                raw = response.read(2 * 1024 * 1024 + 1)
                if len(raw) > 2 * 1024 * 1024:
                    raise ApiError(response.code, "response_too_large")
                try:
                    data = json.loads(raw.decode("utf-8")) if raw else None
                except (ValueError, UnicodeError):
                    raise ApiError(response.code, "invalid_json") from None
                if not 200 <= response.code < 300:
                    problem = data if isinstance(data, dict) else {}
                    raise ApiError(response.code, _safe(problem.get("code")) or "http_error",
                                   _safe(problem.get("request_id")), _safe(response.headers.get("Retry-After")))
                return data
        except (URLError, OSError):
            raise ApiError(0, "transport_error") from None

    def status(self):
        return self.request("GET", "/status")

    def search(self, q, **query):
        return self.request("GET", "/products", query={**query, "q": q})

    def product(self, product_id):
        return self.request("GET", f"/products/{_id(product_id)}")

    def cart(self):
        return self.request("GET", "/cart")

    def cart_draft(self, product_id, quantity=1, draft=None):
        if type(quantity) is not int or not 1 <= quantity <= 99:
            raise ValueError("Quantity must be 1..99")
        query = {"product_id": _id(product_id), "quantity": quantity}
        if draft is not None:
            query["draft"] = draft
        return self.request("GET", "/cart-drafts/", query=query)
