# SDK/CLI 0.2.0: publication status

Updated 2026-10-05. Source repository provided by the owner:
https://github.com/oooafganec-dev/vesremont-sdk.
The repository must contain these SDK-only sources before publishing packages.
An account or an empty repository is not a published SDK release.

## Names and ownership

| Channel | Package / module | Status |
| --- | --- | --- |
| npm | `@vesremont_api/api` | Owner created organization `vesremont_api`; publication not confirmed |
| PyPI | `vesremont-api` | Owner registered; publication not confirmed |
| RubyGems | `vesremont-api` | Owner registered; publication not confirmed |
| Go | `github.com/oooafganec-dev/vesremont-sdk/go` | Sources and tag `go/v0.2.0` still need publishing and verification |

The earlier prepared npm name `@vesremont/api` was not published by this
workflow. Use the owner's actual scope `@vesremont_api` consistently in
imports, installation instructions and registry metadata.
The Node CLI `vesremont` is included in the npm package; no second CLI package
or Homebrew formula is needed. The older `vesremont.com/sdk/go` vanity path
is not promised as a public module.

## Publication procedure

1. Upload only the reviewed SDK-only public archive to the GitHub repository.
   Never upload the shop workspace, server files, runtime data or credentials.
2. Check the four language manifests, README, LICENSE and offline tests.
   The package version is 0.2.0; if that version already exists in a registry,
   stop and prepare a new version instead of overwriting it or unpublishing it.
3. Authenticate through each registry's normal login mechanism from an external
   development computer. Never send passwords/tokens to chat or commit them.
4. Build and inspect the package contents. Publish only the named package after
   its owner and manifest metadata have been checked. Public npm access is
   specified in publishConfig; use the public npm registry, not GitHub Packages.
5. Install the released package by its registry name into a fresh local test
   directory. Verify import and CLI --version. Do not test a real order just to
   verify package installation. A failed registry fetch is not a passed test.
6. Publish the Go submodule tag `go/v0.2.0` only after its tests pass, then verify
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

Owner supplied this Smithery card URL:
https://smithery.ai/servers/oooafganec/Vesremont.
Its public metadata, upstream connection and official-vendor verification
have not yet been independently confirmed by this workflow. The upstream
remains https://vesremont.com/mcp; buyer authorization is not bypassed.
Smithery is separate from the official MCP Registry; one listing does not
prove publication in another directory or a successful buyer OAuth test.

Accounts on PyPI/RubyGems, a repository, source downloads and a registry card
are distinct from verified package releases. Do not claim Ora package/CLI
checks have passed until the releases can actually be installed externally.
