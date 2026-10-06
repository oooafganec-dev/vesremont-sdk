# Official MCP Registry and Smithery

## Status checked 2026-10-06

- [Smithery](https://smithery.ai/servers/oooafganec/Vesremont) returns HTTP 200
  at that exact case-sensitive public URL, without a redirect. Its `og:url`
  matches; no `rel=canonical` was found in the returned HTML. Do not invent a
  lowercase canonical or create another card.
- The card's namespace is `oooafganec`, slug `Vesremont`, upstream
  `https://vesremont.com/mcp`, gateway `https://vesremont--oooafganec.run.tools`.
  Its homepage/backlink is `https://vesremont.com/developers/`.
- Smithery exposes `hasDomainProof: true` and `hasBacklinkProof: true`;
  `verified: false` and `official: false` remain separate flags. The proof
  timestamp in its payload is 2026-10-05T19:10:20.591Z, not a fresh verification
  initiated by this SDK change. Both the homepage and developer portal link
  directly to this existing Smithery card. The card's `repositoryUrl` is null;
  its server implementation is not the SDK repository, so do not label the SDK
  as the MCP server source just to populate that field.
- Ora's cached `mcp-registry-listed` still fails. Public backlink evidence
  contradicts the blanket "no bi-directionally verified entry" finding;
  the exact detector/caching cause is not observable from its report. This
  does not justify fake usage, buying verification, or republishing a duplicate.
- [Official Registry search](https://registry.modelcontextprotocol.io/v0.1/servers?search=vesremont)
  returned `servers: []`; `search=com.vesremont` also returned an empty result.
  The prepared `server.json` is schema-valid, but **not published**.
  Smithery registration is not registration in the official MCP Registry.

## Owner action for `com.vesremont/store`

Keep the existing domain-based name. GitHub login alone authorizes a GitHub
namespace, not `com.vesremont`. Use DNS domain authentication; it needs no
Nginx change. Do not add the SDK npm package to `packages`: it is a REST client,
not an executable MCP server. The `remotes` entry is the deployed server.

1. On the owner's trusted development PC, run
   `node registry/prepare-domain-proof.mjs` from this repository. It creates or
   reuses an Ed25519 private key in the user's local application-data directory,
   **outside this repository**, and prints only the public TXT record.
2. In the domain's DNS control panel, add a **new** TXT record at host `@` with
   that complete `v=MCPv1; k=ed25519; p=...` value. Do not replace other TXT
   records. The existing Smithery TXT proof does not replace this MCP proof.
3. After propagation, use the official `mcp-publisher` DNS login on that same
   trusted workstation, then publish this directory's reviewed `server.json`.
   Version 1.8.1 accepts `login dns --domain vesremont.com --private-key <hex>`;
   use the 32-byte Ed25519 seed from the stored key, never print or paste it
   into chat. This option places a secret in the child process arguments;
   do not run it on a shared/untrusted host. Prefer a supported external signer
   if your environment requires that protection. No credentials are included here.
4. Publishing is a separate deliberate action (`mcp-publisher publish` from
   `registry/`). Recheck Registry search and the exact name/version afterward.
   Do not claim publication merely because login or JSON validation succeeded.

Official references:
[domain authentication](https://modelcontextprotocol.io/registry/authentication),
[publisher releases](https://github.com/modelcontextprotocol/registry/releases),
[remote servers](https://modelcontextprotocol.io/registry/remote-servers).
No DNS, registry entry, paid plan or package was changed by these checks.
