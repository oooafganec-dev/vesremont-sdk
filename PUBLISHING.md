# SDK/CLI 0.2.0: publication status

Agent integration follow-up (2026-10-06): portable plugin 0.1.0, three canonical
skill snapshots and four client config examples are prepared and locally tested;
see [AGENT_INTEGRATIONS.md](AGENT_INTEGRATIONS.md). This is not a re-release of
any SDK. Official MCP Registry publication and skills.sh indexing remain separate
unconfirmed steps; see [current registry evidence](registry/README.md).

Updated 2026-10-05. Public SDK-only source repository:
https://github.com/oooafganec-dev/vesremont-sdk.
The owner published all four SDK releases. The registry and public Go-proxy
checks below were run on an external Windows computer, not the store server.

## Names and ownership

| Channel | Package / module | Status |
| --- | --- | --- |
| npm | [@vesremont_api/api](https://www.npmjs.com/package/@vesremont_api/api) | Published 0.2.0; registry metadata and tarball integrity verified |
| PyPI | [vesremont-api](https://pypi.org/project/vesremont-api/0.2.0/) | Published 0.2.0; wheel and sdist SHA256 verified |
| RubyGems | [vesremont-api](https://rubygems.org/gems/vesremont-api/versions/0.2.0) | Published 0.2.0; registry version and gem SHA256 verified |
| Go | [github.com/oooafganec-dev/vesremont-sdk/go](https://github.com/oooafganec-dev/vesremont-sdk/releases/tag/go%2Fv0.2.0) | Published tag go/v0.2.0; public proxy, checksum database, commit, offline tests and go vet verified |

The Go tag points to commit `fe04b05e602d8a9f2d486a431bb6c54aa689015f`.
Do not republish 0.2.0, overwrite released artifacts or move the Go tag.
Documentation corrections on the repository's main branch do not change
the already published package bytes; future package changes need a new version.

Additional external checks on 2026-10-05: fresh isolated npm installation,
actual `vesremont` bin `--version` (0.2.0) and `--help`; PyPI wheel installation
and `VesremontClient` import; Go proxy download with checksum database and
the commit above, offline tests and `go vet`. Go documentation is available at
https://pkg.go.dev/github.com/oooafganec-dev/vesremont-sdk/go@v0.2.0.
RubyGems metadata, official-site links and gem SHA256 are confirmed. A fresh
registry installation and import passed using an official portable Ruby 4.0.7
runtime in the disposable test directory, without installing Ruby system-wide.
These checks do not imply buyer OAuth acceptance, production writes or Ora acceptance.

The earlier prepared npm name `@vesremont/api` was not published by this
workflow. Use the owner's actual scope `@vesremont_api` consistently in
imports, installation instructions and registry metadata.
The Node CLI `vesremont` is included in the npm package; no second CLI package
or Homebrew formula is needed. The older `vesremont.com/sdk/go` vanity path
is not promised as a public module.

## Procedure for future releases

1. Upload only the reviewed SDK-only public archive to the GitHub repository.
   Never upload the shop workspace, server files, runtime data or credentials.
2. Check the four language manifests, README, LICENSE and offline tests.
   Version 0.2.0 is already published; choose a new version. If it exists in a registry,
   stop and prepare a new version instead of overwriting it or unpublishing it.
3. Authenticate through each registry's normal login mechanism from an external
   development computer. Never send passwords/tokens to chat or commit them.
4. Build and inspect the package contents. Publish only the named package after
   its owner and manifest metadata have been checked. Public npm access is
   specified in publishConfig; use the public npm registry, not GitHub Packages.
5. Install the released package by its registry name into a fresh local test
   directory. Verify import and CLI --version. Do not test a real order just to
   verify package installation. A failed registry fetch is not a passed test.
6. Publish a new Go submodule tag `go/v<version>` only after its tests pass, then verify
   module download from outside the repository through the public Go proxy.
   Published tags and releases must not be moved to different source bytes.
7. Give the documentation owner verified package URLs, versions and commands.
   Only then announce registry installation in machine-generated documents.

Official instructions:
[npm](https://docs.npmjs.com/cli/v11/commands/npm-publish/),
[PyPI](https://packaging.python.org/en/latest/tutorials/packaging-projects/),
[RubyGems](https://guides.rubygems.org/publishing/),
[Go](https://go.dev/doc/modules/publishing).

## MCP directory

Owner's public Smithery card, verified on 2026-10-05:
https://smithery.ai/servers/oooafganec/Vesremont.
The page displays Vesremont and publisher oooafganec/Vesremont. Its public
page now contains the MCP tool catalog and a homepage backlink to
https://vesremont.com/developers/. The owner supplied a successful renewed
Smithery report with 21 tools and 4 resources; parameter-description work is
handled separately by the runtime owner. The upstream remains
https://vesremont.com/mcp; buyer authorization is not bypassed.
The site already links back from the developer portal; this delivery adds a
direct visible homepage backlink. This does not claim a paid verified badge,
non-zero registry usage or successful private buyer operations.
Smithery is separate from the official MCP Registry; one listing does not
prove publication in another directory or a successful buyer OAuth test.

SDK publication and public MCP discovery are confirmed. The cached Ora scan
at 2026-10-05 22:11 +03:00 still reports registry 0/1, CLI 2/3 and multi-language
SDK 1/3. Do not claim those detector checks passed until a fresh scan confirms
them. No automatic republishing or usage-generating tool calls are necessary.
