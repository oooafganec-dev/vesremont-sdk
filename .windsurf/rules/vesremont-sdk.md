---
trigger: model_decision
description: Use when developing Vesremont SDK clients or connecting to Vesremont MCP; distinguishes offline SDK tests from real store operations.
---

# Vesremont SDK and MCP

Read `connections/README.md` for the MCP setup for your client. Cascade uses
its user-level `mcp_config.json`, not a project `.windsurf/mcp.json`. Merge the
`vesremont` entry from `connections/windsurf.mcp_config.json`; do not replace
other servers, add embedded tokens or disable trust/tool approval prompts.

This repository is an SDK, not an alternative store server. Test client changes
with mocked transports. Do not use a real cart or order as a connectivity test.
Read `PUBLISHING.md` before a release; published SDK 0.2.0 and `go/v0.2.0` must
not be overwritten.

For shopping assistance, use the matching skill under `skills/` and consult its
canonical live source listed in `skills/sources.json`. Do not invent different
buyer permissions or confirmations here. Public catalog reads do not authorize
private buyer operations. Keep tokens, cookies, keys and buyer data out of Git.
