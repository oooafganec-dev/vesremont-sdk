# skills.sh publication and official-source review

Prepared 2026-10-06. This is evidence and a draft owner request, **not** a
claim that a catalogue listing exists. No request has been sent.

## Reproducible state

The public repository https://github.com/oooafganec-dev/vesremont-sdk at
`d396ba0ddbf8455ed932ecb8cf680d6edfd11be4` contains three distinct skills:

- https://github.com/oooafganec-dev/vesremont-sdk/blob/main/skills/vesremont-product-discovery/SKILL.md
- https://github.com/oooafganec-dev/vesremont-sdk/blob/main/skills/vesremont-session-shopping/SKILL.md
- https://github.com/oooafganec-dev/vesremont-sdk/blob/main/skills/vesremont-buyer-guidance/SKILL.md

The official CLI 1.7.0 lists all three and can install them from this remote
repository. Windows Git converted checkout LF to CRLF; the installed content
was unchanged. This follow-up's `.gitattributes` preserves exact SKILL.md bytes
even with `core.autocrlf=true`; recheck the remote install after its publication.
Test installations use disabled telemetry and do not represent adoption.
`sources.json` records hashes matching the byte-identical canonical
artifacts at https://vesremont.com/.well-known/agent-skills/index.json.
The store links to this SDK repository. Its domain-owned MCP Registry entry
and four published SDK packages provide additional ownership context, not
automatic skills.sh official classification.

All three prospective detail paths under
`https://www.skills.sh/oooafganec-dev/vesremont-sdk/` returned an unavailable
skill page (HTTP 200). Checking only the response status or title is insufficient.
The authenticated directory API cannot be assumed publicly readable without
the Vercel OIDC token described in its documentation.

## Legitimate installation, not test telemetry

The [official FAQ](https://www.skills.sh/docs/faq) states that actual CLI
installations drive listing and ranking. There is no documented standalone
`publish` command for a GitHub skill. To use these skills, install them once
in the real target project, review them, and use normal client consent:

```sh
npx skills@1.7.0 add oooafganec-dev/vesremont-sdk --agent codex --skill vesremont-product-discovery vesremont-session-shopping vesremont-buyer-guidance
```

Do not install repeatedly or change disabled test telemetry just to increase
counts. Existing skills can be updated through the official CLI. Installation
does not authorize store tools, install MCP connections, or guarantee immediate
catalogue indexing. Agent selection is a real client choice, not an audit trick.

## Draft owner request if indexing/ownership remains unresolved

Subject: indexing and official ownership of oooafganec-dev/vesremont-sdk skills

We operate vesremont.com and publish the three skills linked above. Their raw
bytes match our canonical first-party index and artifacts. The remote skills
CLI discovers and installs them, but the three directory detail paths currently
show an unavailable page. Please clarify the indexing/official-source
verification steps for this repository. We do not want to manufacture installs
or claim community skills belong to the store. Canonical source, GitHub and
domain-owned MCP Registry evidence are publicly readable; no secrets are needed.

Please tell us whether the repository can be indexed/reviewed directly and how
first-party ownership is established. A pack import is not presented as a
leaderboard listing or an official badge.
