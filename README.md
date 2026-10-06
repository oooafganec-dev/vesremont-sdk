# Vesremont API SDKs and CLI

Official client libraries for [Vesremont](https://vesremont.com/), a real
online store for repair, construction, home and garden products.

[API documentation](https://vesremont.com/developers/) ·
[OpenAPI contract](https://vesremont.com/openapi.json) ·
[Buyer authorization](https://vesremont.com/auth.md)

This repository contains client code only. It does not include the store,
Bitrix, server configuration, customer data, keys or an alternative API server.
Client libraries are MIT licensed; the store is not released under that license.

## Agent integrations

[Instructions for coding agents](AGENTS.md) ·
[Agent Plugin and three official skills](AGENT_INTEGRATIONS.md) ·
[Codex / Claude Code / Cursor / VS Code / Windsurf connections](connections/README.md) ·
[MCP Registry and Smithery status](registry/README.md).

The repository also packages Vesremont's published skills and one remote MCP
connection. This does not alter the SDK packages, grant buyer consent or replace
explicit order confirmation. See the integration guide for installation and checks.

Native project files: [Claude MCP](.mcp.json),
[Claude SDK rules](.claude/rules/vesremont-sdk.md),
[Cursor MCP](.cursor/mcp.json),
[Windsurf SDK rules](.windsurf/rules/vesremont-sdk.md) and
[Cascade MCP example](connections/windsurf.mcp_config.json).
Review and approve connections in your client. Do not overwrite an existing
configuration or enable the same server through both a plugin and a native file.

| Official skill | Use it for |
| --- | --- |
| [Product discovery](skills/vesremont-product-discovery/SKILL.md) | Find and compare current products, prices and stock |
| [Session shopping](skills/vesremont-session-shopping/SKILL.md) | Buyer-authorized cart and checkout assistance |
| [Buyer guidance](skills/vesremont-buyer-guidance/SKILL.md) | Answers grounded in published store policies |

List these skills without installation (Node **22.20.0+** for `skills@1.7.0`):

```sh
npx skills@1.7.0 add oooafganec-dev/vesremont-sdk --list
```

[Installation, provenance and directory status](AGENT_INTEGRATIONS.md).
[Verified public URLs and audit evidence](PUBLIC_DISCOVERY.md).
GitHub publication and CLI discovery are confirmed; skills.sh catalogue
indexing is a separate external result, not implied by this command.

## Clients

| Language | Directory | Package/module |
| --- | --- | --- |
| JavaScript / TypeScript + Node CLI | [javascript](javascript/README.md) | [@vesremont_api/api](https://www.npmjs.com/package/@vesremont_api/api) |
| Python | [python](python/README.md) | [vesremont-api](https://pypi.org/project/vesremont-api/0.2.0/) |
| Go | [go](go/README.md) | [github.com/oooafganec-dev/vesremont-sdk/go](https://pkg.go.dev/github.com/oooafganec-dev/vesremont-sdk/go@v0.2.0) |
| Ruby | [ruby](ruby/README.md) | [vesremont-api](https://rubygems.org/gems/vesremont-api/versions/0.2.0) |

Release 0.2.0 is published in npm, PyPI and RubyGems. The Go module is
published under tag `go/v0.2.0` and its public-proxy download is verified.
Publication checks were completed on 2026-10-05; they do not replace buyer
OAuth, production API acceptance or a fresh Ora scan.
Use the language README for installation. See [publication status](PUBLISHING.md).

## Install the published release

Run on an external development computer in an isolated project/environment.
These commands install libraries and check metadata; they do not call the store API.

| Client | Installation | Offline check |
| --- | --- | --- |
| Node SDK + `vesremont` CLI | `npm install @vesremont_api/api@0.2.0` | `npx --no-install vesremont --version` (0.2.0); `npx --no-install vesremont --help` |
| Python SDK | `python -m pip install vesremont-api==0.2.0` | Import `VesremontClient` from `vesremont_api`; `importlib.metadata.version("vesremont-api")` (0.2.0) |
| Ruby SDK | `gem install vesremont-api -v 0.2.0 --no-document` | `require "vesremont_api"`; `Gem.loaded_specs.fetch("vesremont-api").version.to_s` (0.2.0) |
| Go SDK | `go get github.com/oooafganec-dev/vesremont-sdk/go@v0.2.0` inside your Go module | `go list -m github.com/oooafganec-dev/vesremont-sdk/go` (v0.2.0) |

The CLI is already included in the npm package, not a second unpublished package.
The Go module uses the `go/v0.2.0` subdirectory tag. Existing releases are immutable;
documentation changes on main do not change already published artifacts.

## Safe usage

- Public catalog reads need no buyer token. Personal operations require the
  buyer's OAuth consent, correct resource and minimum scopes.
- SDKs default to the production store, not a mock shop. Writes may change
  a real cart or order; reading documentation does not grant permission to write.
  The separate read-only onboarding example is documented on the developer portal;
  installing an SDK does not switch requests to that example.
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

[Smithery listing](https://smithery.ai/servers/oooafganec/Vesremont).
[Official MCP Registry: com.vesremont/store 1.0.0](https://registry.modelcontextprotocol.io/v0.1/servers/com.vesremont%2Fstore/versions/1.0.0).
The public card links back to the developer portal, which links to that card.
Successful public tool discovery does not grant access to a buyer's private data.
Directory verification badges and Ora recognition are separate from publication.
