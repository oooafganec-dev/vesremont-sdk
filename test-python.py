import io
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent / "python"))
from vesremont_api import VesremontClient, ApiError


class Response(io.BytesIO):
    code = 200
    headers = {}


class ClientTest(unittest.TestCase):
    def test_contract_offline(self):
        api = VesremontClient(token="test-token")
        with patch.object(api._opener, "open", return_value=Response(b'{"ok":true}')) as send:
            self.assertEqual(api.search("труборез", page=1), {"ok": True})
            req = send.call_args.args[0]
            self.assertTrue(req.full_url.startswith("https://vesremont.com/api/v1/products?"))
            self.assertEqual(req.headers["Authorization"], "Bearer test-token")
        for path in ("//evil.example", "/../oauth", "/products?x=1"):
            with self.assertRaises(ValueError):
                api.request("GET", path)
        with self.assertRaises(ValueError):
            api.request("POST", "/orders/submit", body={})
        response = Response(b'{"code":"rate_limited","request_id":"abc","detail":"secret"}')
        response.code, response.headers = 429, {"Retry-After": "60"}
        with patch.object(api._opener, "open", return_value=response) as send:
            with self.assertRaises(ApiError) as caught:
                api.cart()
            self.assertEqual(send.call_count, 1)
            self.assertEqual(caught.exception.retry_after, "60")
            self.assertNotIn("secret", str(caught.exception))


unittest.main()
