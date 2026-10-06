---
paths:
  - "javascript/**"
  - "python/**"
  - "go/**"
  - "ruby/**"
  - "test-*"
---

# Vesremont SDK development

This repository contains clients, not the implementation of the store or MCP
server. Run mocked/offline tests when changing a client; never call production
write tools to test an SDK. Published SDK 0.2.0 artifacts and `go/v0.2.0` are
immutable. See `PUBLISHING.md` before preparing a different release.

For an actual Vesremont shopping task, read the appropriate canonical snapshot
under `skills/` and its live source in `skills/sources.json`. Do not duplicate or
rewrite buyer authorization rules in SDK code. The project `.mcp.json` provides
one direct HTTP connection; approve it in the client only when needed. Keep
tool approval prompts enabled; loading a connection does not grant buyer consent.

Never commit tokens, store cookies, private keys or customer data. Instructions,
examples and mocked fixtures must not contain real buyer credentials.
