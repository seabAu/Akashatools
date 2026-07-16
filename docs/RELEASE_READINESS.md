# Release readiness

> Status on 2026-07-16: the library-side alpha, beta, and release-candidate
> evidence is complete, including local Node 22/24 and three-engine browser
> matrices. Hosted workflow evidence, real-application migrations, and every
> publication action remain external gates.

## Package snapshot

| Field | Verified value |
| --- | --- |
| Package | `akashatools` |
| Workspace version | `2.0.0-alpha.1` |
| Public npm `latest` | `1.0.2` |
| Module format | ESM-only |
| Node.js engine | `>=22.17` |
| License | ISC (`LICENSE`, 741 bytes) |
| Dry-run files | 85 |
| Dry-run packed size | Approximately 236 kB |
| Dry-run unpacked size | Approximately 889 kB |

`npm pack --dry-run --json` verified the exact 85-file package selection without
creating or publishing an artifact. Sizes are rounded because this shipped
readiness record contributes to its own packed size. The package includes the
runtime sources, generated declarations, retained `lib` compatibility modules,
documentation, benchmarks, changelog, README, license, and package metadata. It
excludes tests, consumer fixtures, development scripts and configuration,
coverage output, and installed dependencies as intended.

The declared repository, issue tracker, and homepage point to the live public
`seabAu/Akashatools` GitHub repository. This local 2026 repository has no Git
remote configured; no remote was added and no push was attempted during the
audit.

## Reproducible evidence

`npm run audit:release` completed successfully on Node.js 22.18.0 and through an
isolated Node.js 24.18.0 runtime on Windows. The command performs the dependency
audit, complete project check, source-only coverage run, and dry-run package
inspection. The six-contract Playwright matrix also passes on Chromium,
Firefox, and WebKit.

| Gate | Result |
| --- | --- |
| Dependency audit | 0 reported vulnerabilities |
| Maintained syntax | 81 JavaScript files pass |
| Public documentation | 134 declarations pass |
| Generated declarations | 17 files current |
| API surface snapshot | 14 surfaces current |
| Node contract tests | 121 passed, 0 failed |
| Installed-package smoke | Fresh JavaScript and TypeScript consumers pass |
| Node 22 source coverage | 97.61% lines / 86.32% branches / 96.19% functions |
| Node 24 source coverage | 97.61% lines / 86.13% branches / 96.19% functions |
| Browser contracts | 6 passed across Chromium, Firefox, and WebKit |
| Focused import budget | 321 raw / 252 gzip bytes |
| Default namespace budget | 54,330 raw / 17,101 gzip bytes |
| Consumer bundle evidence | Focused fixtures save 47,058–50,564 raw and 14,493–15,441 gzip bytes |
| Legacy usage evidence | 1,982 parsed reads; every member dispositioned; 559 reads drove seven new APIs |

The release audit also verifies formatting, linting, JSDoc/TypeScript checking,
editor completions, generated documentation and migration data, export-map
resolution, side-effect elimination, and representative source-consumer
fixtures.

## External gates still open

1. Run the configured hosted Node.js 22 and 24 LTS jobs plus the browser job.
   Both local Node release audits and the Chromium/Firefox/WebKit matrix are
   green, but local execution cannot replace the first hosted workflow result.
2. With explicit authorization, migrate bounded areas of Mindspace, the
   portfolio rebuild, COMPOSR, and SPLICR. The current fixtures validate
   representative contracts; they do not prove whole-application drop-in
   compatibility or reveal every accidental dependency on legacy behavior.
3. Obtain explicit approval for the intended prerelease or stable version,
   exact commit, npm dist-tag, provenance setup, tag, and publication. No tag,
   push, registry write, or consumer-project edit has occurred.
4. After publication, install and verify the registry artifact and its documented
   import examples before calling that release complete.
