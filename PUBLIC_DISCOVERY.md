# Public discovery follow-up — 2026-10-06

Scope: this SDK repository only. No changes to the store, Nginx, OAuth,
generated documentation or buyer operations. SDK 0.2.0, `go/v0.2.0` and
Agent Plugin 0.1.0 remain unchanged. No secrets or private DNS signing key
are part of this delivery.

## Result and external boundary

| Item | Verified fact | Remaining boundary |
| --- | --- | --- |
| Official Registry | `com.vesremont/store@1.0.0` active; exact endpoint and brand search pass | Ora still reports registry 0/1; no republish needed |
| Smithery | Existing card, direct upstream, public domain and backlink proof | Paid Verified badge is separate; no purchase or artificial usage |
| Configurations | Four examples already public at the commit below; native Claude/Cursor files and real Cascade rule/example added locally | Owner upload and exact public-byte verification of this follow-up |
| Skills | Three remote GitHub skills discovered/installed; raw GitHub/canonical SHA-256 match | Three skills.sh pages unavailable; no confirmed catalogue listing or adoption |
| Instructions | Stale "not published" statements corrected | Follow-up corrections need GitHub upload |

The inspected main commit is
**`d396ba0ddbf8455ed932ecb8cf680d6edfd11be4`**, dated
**2026-10-06T16:21:43Z**. It already includes `plugin.json`, `mcp.json`,
three skill snapshots and four configuration examples. Native-path additions
are not asserted to be in that older commit.

The Windows remote-install test passed after one network retry. That checkout
converted LF to CRLF; installed content matched after newline normalization,
but raw installed hashes differed. This follow-up adds `.gitattributes` with
`skills/**/SKILL.md text eol=lf`, without changing SKILL.md bytes. A controlled
Git checkout with `core.autocrlf=true` verifies exact hash preservation. Remote
byte preservation by the CLI must be rechecked after the owner commits that
attribute file; do not present the older remote checkout as byte-identical.

## URLs for the site/documentation owner

Already confirmed public:

- [Official Registry exact record](https://registry.modelcontextprotocol.io/v0.1/servers/com.vesremont%2Fstore/versions/1.0.0)
- [Official Registry brand search](https://registry.modelcontextprotocol.io/v0.1/servers?search=vesremont&limit=100)
- [Existing Smithery card](https://smithery.ai/servers/oooafganec/Vesremont)
- [Integration guide](https://github.com/oooafganec-dev/vesremont-sdk/blob/main/AGENT_INTEGRATIONS.md)
- [Connection guide](https://github.com/oooafganec-dev/vesremont-sdk/blob/main/connections/README.md)
- [Three skill sources](https://github.com/oooafganec-dev/vesremont-sdk/tree/main/skills)

After uploading this follow-up and verifying the new public commit:

- https://github.com/oooafganec-dev/vesremont-sdk/blob/main/.mcp.json
- https://github.com/oooafganec-dev/vesremont-sdk/blob/main/.cursor/mcp.json
- https://github.com/oooafganec-dev/vesremont-sdk/blob/main/.claude/rules/vesremont-sdk.md
- https://github.com/oooafganec-dev/vesremont-sdk/blob/main/.windsurf/rules/vesremont-sdk.md
- https://github.com/oooafganec-dev/vesremont-sdk/blob/main/connections/windsurf.mcp_config.json

Claude Code reads `.mcp.json`; its `.claude/` rule is scoped to SDK files.
Cursor reads `.cursor/mcp.json`. Cascade's user-level MCP file is not a
project `.windsurf/mcp.json`; `.windsurf/rules/` is a documented rules fallback.
These rules point to canonical skills and do not introduce another shopping
policy, auto-approve tools or embed credentials. See `connections/README.md`
for current client-format references and version-specific locations.

## Checks

From the SDK repository root on an external development PC, Node 22+:

```sh
node test-agent-integrations.mjs
node test-agent-integrations.mjs --public
node registry/publish-domain.mjs --verify
node verify-public-discovery.mjs
```

The last check pins reads to the current public main commit and compares exact
file hashes, checks Registry search, Smithery proof, backlinks and actual
skills.sh page content. Exit 0 means no publication/indexing pending, 2 means
reported external pending state, 1 means a failed diagnostic. Even exit 0 does
not prove Ora acceptance, an official skills.sh badge, client UI trust or buyer
OAuth. These checks do not invoke MCP tools, publish, or emit install telemetry.

[Draft Ora request](registry/ORA_REGISTRY_REVIEW.md) and
[skills.sh evidence/owner request](skills/DIRECTORY_REVIEW.md) are ready but
not sent. GitHub upload requires the owner's authenticated account; the current
workstation has no GitHub credential-manager login. Do not upload an archive
into the repository as a substitute for committing its extracted files.
