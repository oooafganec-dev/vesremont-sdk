# Vesremont API SDKs and CLI

Official client libraries for [Vesremont](https://vesremont.com/), a real
online store for repair, construction, home and garden products.

[API documentation](https://vesremont.com/developers/) ·
[OpenAPI contract](https://vesremont.com/openapi.json) ·
[Buyer authorization](https://vesremont.com/auth.md)

This repository contains client code only. It does not include the store,
Bitrix, server configuration, customer data, keys or an alternative API server.
Client libraries are MIT licensed; the store is not released under that license.

## Clients

| Language | Directory | Package/module |
| --- | --- | --- |
| JavaScript / TypeScript + Node CLI | [javascript](javascript/README.md) | `@vesremont_api/api` |
| Python | [python](python/README.md) | `vesremont-api` |
| Go | [go](go/README.md) | `github.com/oooafganec-dev/vesremont-sdk/go` |
| Ruby | [ruby](ruby/README.md) | `vesremont-api` |

Source version: 0.2.0. Registry publication is not yet confirmed. Use the
language README for direct-download installation; do not assume a package
can already be installed by registry name. See [publication status](PUBLISHING.md).

## Safe usage

- Public catalog reads need no buyer token. Personal operations require the
  buyer's OAuth consent, correct resource and minimum scopes.
- This is the production store, not a mock shop or sandbox. Writes may change
  a real cart or order; reading documentation does not grant permission to write.
- Order preparation and explicit confirmation on Vesremont remain mandatory.
- Never put access tokens, customer responses, confirmation tokens or signed
  cart links in issues, commits or public logs.
- SDKs do not disable TLS checks, follow redirects to a new host or retry writes
  in an application loop. After an uncertain write, read the actual state.

## Offline tests

Run from the repository root:

```sh
node --test test-js.mjs
python test-python.py
cd go && go test ./...
cd ../ruby && ruby test_client.rb
```

Tests use mocked transports; they do not create real orders or request buyer
consent. Node requires 22+, Python 3.10+, Go 1.22+, Ruby 3.3+.

Remote MCP endpoint: `https://vesremont.com/mcp`. It is operated by Vesremont;
this SDK repository is not the implementation of that MCP server.
