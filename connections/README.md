# Connect to Vesremont

The direct production MCP endpoint is **https://vesremont.com/mcp**.
These are public examples, not production configuration files. Choose one
connection method; do not install a plugin and a manual connection to the same
server at the same time. Merge the `vesremont` entry, never overwrite an existing
client configuration. No SDK, API key or local MCP proxy is needed for public reads.

| Client | Example | Destination |
| --- | --- | --- |
| Codex | [codex.toml](codex.toml) | `~/.codex/config.toml`, or a trusted project's `.codex/config.toml` |
| Claude Code | [claude-code.mcp.json](claude-code.mcp.json) | Project `.mcp.json`; approve this server in Claude Code |
| Cursor | [cursor.mcp.json](cursor.mcp.json) | Project `.cursor/mcp.json` or the user's Cursor MCP settings |
| VS Code | [vscode.mcp.json](vscode.mcp.json) | Project `.vscode/mcp.json`; use **MCP: List Servers** to start it |

CLI alternatives (each adds client configuration; run only when you want that):

```sh
codex mcp add vesremont --url https://vesremont.com/mcp
claude mcp add --transport http --scope project vesremont https://vesremont.com/mcp
```

Keep client trust and tool approval prompts enabled. First verify `initialize`
and `tools/list`; then ask for a public product search. Do not create an order
as a connectivity test. Private buyer operations require the supported OAuth
flow, correct resource/scopes and buyer consent. Compatibility of the file
format does **not** prove a client's buyer OAuth integration. If that flow is
unsupported, use public reads or the store's browser workflow; never copy store
cookies, bypass authorization or put tokens in these files.

Native Agent Plugins clients can instead load the repository's root
`plugin.json`, `mcp.json` and `skills/`. The portable MCP transport is named
`streamable-http`; Claude Code/VS Code use `http` in their own config formats.
Do not substitute these configuration files for one another.

Official format references, checked 2026-10-06:
[Codex](https://developers.openai.com/codex/mcp),
[Claude Code](https://code.claude.com/docs/en/mcp),
[Cursor](https://cursor.com/docs/mcp),
[VS Code](https://code.visualstudio.com/docs/agent-customization/mcp-servers),
[Agent Plugins](https://agent-plugins.org/specification).
