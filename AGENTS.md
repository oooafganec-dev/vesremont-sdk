# Working with the Vesremont SDK

This public repository contains JavaScript/TypeScript, Python, Go and Ruby
clients, the `vesremont` CLI, agent connection examples and three official
skill snapshots. The store and MCP server are operated at vesremont.com;
their implementation is not in this repository.

## Choose the task

- SDK development: read the README in `javascript/`, `python/`, `go/` or
  `ruby/`, preserve its API and style, and run the corresponding offline test.
- Connect an agent: follow [connections/README.md](connections/README.md).
  Claude Code uses `.mcp.json`; Cursor uses `.cursor/mcp.json`; Windsurf/Cascade
  uses the user configuration described in that guide. Configure one connection
  to `https://vesremont.com/mcp` and retain the client's tool approval prompts.
- Product search and comparison: read
  [product discovery](skills/vesremont-product-discovery/SKILL.md).
- Buyer-session assistance: read
  [session shopping](skills/vesremont-session-shopping/SKILL.md).
- Store policies and buyer questions: read
  [buyer guidance](skills/vesremont-buyer-guidance/SKILL.md).

The [developer portal](https://vesremont.com/developers/),
[OpenAPI](https://vesremont.com/openapi.json) and
[authorization guide](https://vesremont.com/auth.md) own the current contract.
Public catalog reads require no buyer token. Personal operations require buyer
consent and the appropriate permissions; an order requires its own confirmation.
Use current product data and published policies rather than inventing prices,
availability, identifiers or delivery promises.

## Development checks

Run only the checks relevant to the change, from the SDK repository root:

- JavaScript: `node --test test-js.mjs` (Node 22+).
- Python: `python test-python.py` (Python 3.10+).
- Go: `go -C go test ./...` (Go 1.22+).
- Ruby: `ruby ruby/test_client.rb` (Ruby 3.3+).
- Agent configurations and snapshots: `node test-agent-integrations.mjs`.

These tests use local data or mocked transports. A real cart or order is not a
test fixture. Public discovery checks are documented in `PUBLIC_DISCOVERY.md`.
The optional `skills@1.7.0` installer requires Node **22.20.0 or newer**.

## Source and release integrity

`skills/sources.json` identifies canonical skill URLs and SHA-256 digests.
Review changes in the store's canonical sources before synchronizing snapshots;
preserve LF bytes and do not maintain separate buyer policies here.
Keep credentials, cookies, private keys and customer data out of source and logs.
Published SDK **0.2.0**, tag **go/v0.2.0** and plugin **0.1.0** are separate
releases. Read `PUBLISHING.md` before preparing a new release; documentation
changes do not require republishing packages or moving existing tags.
