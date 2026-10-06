# Vesremont Agent Plugin and skills

The root `plugin.json`, `mcp.json` and `skills/` form an
[Agent Plugins 1.0.0](https://agent-plugins.org/specification) package.
Plugin version **0.1.0** is independent of the unchanged SDK releases **0.2.0**.
It combines three skills with one direct remote MCP connection. It contains
no executable hooks, local MCP process, embedded credentials or automatic
order submission. Loading the plugin does not authorize purchases.

## Skills and their source of truth

| Skill | Purpose |
| --- | --- |
| `vesremont-product-discovery` | Find and compare current products, price and stock |
| `vesremont-session-shopping` | Assist with cart/checkout, keeping buyer consent and order confirmation |
| `vesremont-buyer-guidance` | Read published store policies for factual buyer questions |

These SKILL.md files are byte-for-byte snapshots of the
[published Vesremont skills](https://vesremont.com/.well-known/agent-skills/index.json).
`skills/sources.json` records each URL and SHA-256. Update the store's canonical
source first, then review and synchronize these snapshots; do not independently
rewrite shopping rules here. Relative protocol documentation remains on the site.
Installed snapshots are not live policy feeds: the skills instruct agents to
read current prices, availability and canonical policy pages before answering.

## Install skills through the official CLI

After these files are committed to the public repository, list available skills:

```sh
npx skills@1.7.0 add oooafganec-dev/vesremont-sdk --list
```

For an actual Codex project installation, run from the target project directory:

```sh
npx skills@1.7.0 add oooafganec-dev/vesremont-sdk --agent codex --skill vesremont-product-discovery vesremont-session-shopping vesremont-buyer-guidance
```

Choose the intended agent when using another supported client. Read the files
and approve installation yourself. No `--global` is required. Installing skills
does not install the MCP connection: use the portable plugin or one of the
[manual client configurations](connections/README.md), not duplicate connections.

The directory uses real installation telemetry, not a separate publication
command. A successful local install or a GitHub commit does not guarantee
immediate skills.sh indexing. Do not manufacture installs. Tests use
`DISABLE_TELEMETRY=1` and `DO_NOT_TRACK=1` and do not count as adoption.
On 2026-10-06 the prospective skills.sh product-discovery URL returned a
soft-404 page (HTTP 200 but "isn't available" and `noindex`); it is **not** a
confirmed listing. Verify the page content, not only HTTP status, after publication.

Official references: [skills CLI](https://github.com/vercel-labs/skills),
[skills.sh documentation](https://www.skills.sh/docs).

## Plugin installation and discovery

Use a client that supports the portable Agent Plugins format and its documented
local ZIP/directory import. Put `plugin.json` directly at the package root,
not under `clients/`. The SDK repository can also contain this package without
changing the npm/PyPI/Ruby/Go artifacts. Older clients can install the skills
and use their native MCP configuration separately.

For ChatGPT/OpenAI directory distribution, a valid manifest is only the package
format check: upload, review materials, testing and owner publication are separate
steps in the [official submission flow](https://developers.openai.com/plugins/deploy/submission).
This delivery does not claim store approval, an installed ChatGPT plugin, or
client-specific buyer OAuth acceptance. No Codex-only compatibility overlay is
needed by portable-format clients.

## Verification

From the repository root, Node 22+:

```sh
node test-agent-integrations.mjs
node test-agent-integrations.mjs --public
```

The first command verifies configuration semantics, exact skill digests and the
prepared Registry descriptor. The second performs only bounded GET requests to
the public skills index and SKILL.md files; it fails if the live source differs.
It never calls a store tool or writes a cart/order. Official JSON Schema
validation, YAML/TOML parsing and a real isolated skills CLI 1.7.0 installation
were also run on 2026-10-06. The installed SKILL.md bytes matched their sources.

Public GitHub baseline at inspection:
`d644961a5ef3f106de3536ab20f09b4372215ebc` (main).
Published Go tag `go/v0.2.0` is not moved. This package has no new public commit
until its owner uploads/commits it; confirm that commit before announcing remote
installation or Ora acceptance. See [registry evidence and owner steps](registry/README.md).
