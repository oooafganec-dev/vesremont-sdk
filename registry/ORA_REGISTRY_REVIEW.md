# Draft: request a review of Ora MCP registry detection

Prepared 2026-10-06. **Not sent.** The owner can submit this through Ora's
official support channel; do not post keys, buyer data or private audit logs.

## Suggested message

Subject: vesremont.com — published domain-owned MCP Registry record not detected

The cached scan at 2026-10-06T16:55:46Z scores vesremont.com 95/100 but reports
`mcp-registry-listed` 0/1 with "No bi-directionally verified MCP registry entry".
Its stated alternatives include a publication under the product's own domain
or a homepage/documentation link to the record.

Please review these public facts:

1. Official domain-owned record `com.vesremont/store@1.0.0`:
   https://registry.modelcontextprotocol.io/v0.1/servers/com.vesremont%2Fstore/versions/1.0.0
   HTTP 200, active and latest, published 2026-10-06T16:43:15.471188Z.
   Website https://vesremont.com/developers/;
   Streamable HTTP endpoint https://vesremont.com/mcp.
2. Search https://registry.modelcontextprotocol.io/v0.1/servers?search=vesremont&limit=100
   returns the record. Searching the full slash-containing name previously
   returned zero results despite the exact record being available.
3. Both https://vesremont.com/ and https://vesremont.com/developers/ contain
   direct links to the official Registry and the existing Smithery card.
4. Smithery https://smithery.ai/servers/oooafganec/Vesremont returns HTTP 200.
   Its public payload contains homepage/backlink https://vesremont.com/developers/,
   `hasDomainProof: true`, `hasBacklinkProof: true`, checked
   2026-10-06T16:18:54.641Z. Upstream is https://vesremont.com/mcp.
   Its paid Verified badge is not claimed.

Does the check include the official MCP Registry, or only Smithery/mcp.so?
Is search normalization, crawl timing or an additional official-ownership
mapping responsible for this result? Please clarify the documented acceptance
condition or re-evaluate the evidence. We will not manufacture usage, create
duplicate listings, or close public catalog access merely to satisfy a detector.

## Reproduce without credentials

From the SDK repository on an external development computer:

```sh
node registry/publish-domain.mjs --verify
node test-agent-integrations.mjs --public
node verify-public-discovery.mjs
```

These checks perform public reads only. A cached score is not a new scan and
the support request is not an assertion that Ora has accepted the entry.
