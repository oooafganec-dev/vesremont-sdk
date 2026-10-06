# Official MCP Registry and Smithery

## Confirmed publication, checked 2026-10-06

**`com.vesremont/store@1.0.0` is published and active. Do not publish it again.**

- [Exact official record](https://registry.modelcontextprotocol.io/v0.1/servers/com.vesremont%2Fstore/versions/1.0.0)
  returns HTTP 200, `status: active`, `isLatest: true`.
- Published at **2026-10-06T16:43:15.471188Z**, with
  `websiteUrl: https://vesremont.com/developers/` and the direct
  `streamable-http` endpoint `https://vesremont.com/mcp`.
- [Registry search for vesremont](https://registry.modelcontextprotocol.io/v0.1/servers?search=vesremont&limit=100)
  returns this entry. A search for the full slash-containing name previously
  returned an empty list while the exact record existed. Use the exact
  name/version endpoint for publication verification, not that search alone.
- Both the homepage and developer portal already link to the official Registry
  and the existing Smithery card. No extra publication or site edit is needed
  to establish those links.

From the repository root on the owner's external development PC:

```sh
node registry/publish-domain.mjs --verify
```

This command only reads public metadata; it does not read the private key,
log in, change DNS or publish. The helper stops rather than republishing when
the exact active record already exists.

## Smithery evidence

- [Existing card](https://smithery.ai/servers/oooafganec/Vesremont) returns
  HTTP 200 at that case-sensitive URL without a redirect. `og:url` matches;
  no HTML `rel=canonical` was found. Do not create a second card.
- Namespace `oooafganec`, slug `Vesremont`, upstream
  `https://vesremont.com/mcp`, gateway `https://vesremont--oooafganec.run.tools`.
  The homepage and backlink are `https://vesremont.com/developers/`.
- The public payload confirms `hasDomainProof: true` and
  `hasBacklinkProof: true`, checked at **2026-10-06T16:18:54.641Z**.
  `verified: false` and `official: false` are separate flags, not DNS failures.
- The owner's verification page requires a paid developer plan for the
  Verified badge. A paid badge, non-zero usage and successful private buyer
  operations are not claimed. No artificial tool usage was generated.
- `repositoryUrl` is null. This repository contains SDKs, not the implementation
  of the MCP server; do not populate that field with a misleading source link.

Ora's cached scan at **2026-10-06T16:55:46Z** is 95/100 but still reports
`mcp-registry-listed: fail`. It says a domain-owned publication or a homepage/docs
registry link can qualify. Both now exist. The exact detector/caching cause
cannot be proved from the report. A fact-based review request is prepared in
[ORA_REGISTRY_REVIEW.md](ORA_REGISTRY_REVIEW.md); it has not been sent.

## Preserve ownership and future releases

Keep both existing DNS TXT records: the official MCP Ed25519 domain proof and
the separate Smithery verification record. They serve different registries.
Keep the private key in the owner's application-data directory outside Git,
and keep a protected backup. Never place it in DNS, chat, this repository or ZIPs.

For a future deliberate descriptor release, review `server.json`, select a new
version and use the same domain ownership proof. DNS login authorizes
`com.vesremont`; a GitHub login alone does not authorize this domain namespace.
The helper's `--publish` action asks for explicit owner confirmation and never
automatically retries publication after an uncertain result. Its official
publisher is pinned to 1.8.1. Run it only on a trusted workstation: DNS login
passes the private seed to the child process without printing it.

The SDK npm package is a REST client, not an MCP server implementation. Keep
the remote in `remotes`; do not add SDK packages to `packages` to satisfy a scan.
SDK 0.2.0 artifacts, Go tag and plugin 0.1.0 are unchanged.

Official references:
[domain authentication](https://modelcontextprotocol.io/registry/authentication),
[publisher releases](https://github.com/modelcontextprotocol/registry/releases),
[remote servers](https://modelcontextprotocol.io/registry/remote-servers).
