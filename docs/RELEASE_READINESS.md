# Release readiness

> Status on 2026-10-26: the exact `6a58b42` candidate passed the hosted Node 22,
> Node 24, and three-browser matrix. A bounded portfolio auth migration now
> consumes the local v2 package alongside its retained 1.x dependency. Broader
> real-app evidence, tagging, automation, and publication remain gated.

## Current local candidate snapshot

| Field | Verified value |
| --- | --- |
| Package | `akashatools` |
| Workspace version | `2.0.0-alpha.1` |
| Module format | ESM-only |
| Node.js engine | `>=22.17` |
| Universal categories | 17 |
| Public methods | 195 |
| Generated declaration files | 237 |
| Reviewed API surfaces | 19 |
| License | ISC (`LICENSE`, 741 bytes) |
| Dry-run files | 536 |
| Dry-run packed size | Approximately 394 KB |
| Dry-run unpacked size | Approximately 1.46 MB |

`npm pack --dry-run --json` verifies the selected package content without
creating or publishing an artifact. The package includes runtime sources,
generated declarations, retained `lib` compatibility modules, documentation,
benchmarks, changelog, README, license, and package metadata. Tests, consumer
fixtures, development scripts/configuration, coverage, installed dependencies,
and credentials are excluded. Exact byte counts belong to the final immutable
release candidate: embedding a compressed byte count inside a packaged document
changes that count and can create a non-converging self-reference.

The repository, issue tracker, and homepage metadata target the existing public
`seabAu/Akashatools` project. The v2 branch is remote-backed while legacy `main`
remains the preserved 1.0.2 baseline; no tag, registry write, or release
automation change has occurred.

Read-only checks on 2026-07-19 reconfirmed public GitHub `main` at
`c52129b78e20b3d61f0c9765213264ffcda5180d`, and npm still exposes only 1.0.0,
1.0.1, and 1.0.2 with `latest` at 1.0.2. Version 2.0.0-alpha.1 is therefore not
occupied, but selecting that version and a dist-tag still requires explicit
approval immediately before candidate freeze.

## Reproducible local evidence

The complete project check and source coverage gate completed successfully on
the installed Node.js 22.18.0 runtime and an isolated Node.js 24.18.0 runtime on
Windows. Dependency audit and dry-run package inspection also pass. Playwright
separately passed all six browser behaviors in Chromium, Firefox, and WebKit.

| Gate | Current result |
| --- | --- |
| Dependency audit | 0 reported vulnerabilities |
| Maintained syntax | 314 JavaScript files pass |
| Release hygiene | 237 source and 28 test files clean; publish/lock metadata consistent |
| Packaged documentation | 42 strict UTF-8 Markdown files; 46 local links and 4 heading fragments resolve |
| README imports | 19 JavaScript examples parse; 31 package imports and 69 bindings resolve |
| Public documentation | 195 declarations pass |
| Generated declarations | 237 files current |
| API surface snapshot | 19 surfaces current |
| CI action identities | Exact reviewed checkout/setup-node SHA pairs enforced; arbitrary immutable-looking replacements fail |
| Node contract tests | 221 passed, 0 failed on Node 22 and Node 24 |
| Exact package artifact | 536 safe selected files; packed/unpacked output remains below 400,000 / 1,500,000-byte budgets |
| Installed-package smoke | The exact reviewed tarball passes fresh JavaScript and TypeScript consumers |
| Node 22 source coverage | 98.25% lines / 89.82% branches / 97.26% functions |
| Node 24 source coverage | 98.25% lines / 89.77% branches / 97.26% functions |
| Browser tests | 18 passed across Chromium, Firefox, and WebKit |
| Hosted CI | [Run 40282730456](https://github.com/seabAu/Akashatools/actions/runs/40282730456) passed on exact candidate `6a58b42`: Node 22, Node 24, and Chromium/Firefox/WebKit |
| 2026-10-23 lockfile refresh | Commit `f7707af` passed npm audit (0 vulnerabilities), all Node 22 local contract/coverage/package gates, and all 18 browser tests; source files are unchanged |
| Focused import measurement | 321 raw / 252 gzip bytes; budget 400 / 300 |
| Default namespace maximum | 117,720 raw / 35,428 gzip; budget 119,000 / 36,000 |
| Side-effect-only import | 0 raw bytes / 20-byte empty gzip envelope |
| Consumer bundle evidence | Focused fixtures save 109,035-113,942 raw and 32,355-33,748 gzip bytes |
| Legacy usage evidence | 1,981 parsed root reads (1,980 calls + 1 proven non-call defect), 8 direct-subpath calls, 0 dynamic reads; every member dispositioned |
| Modern import inertness | Root, all 18 category surfaces, and all 195 granular methods preserve complete Array/Object/Date descriptors |

The unified gate also verifies formatting, linting, JSDoc/TypeScript checking,
editor completions, generated documentation and migration data, export-map
resolution, packaged Markdown links and encoding, canonical function identity,
side-effect elimination, focused bundle equivalence, and representative
source-consumer fixtures.

## Scope conclusions

The 2026-07-18 read-only reviews cover the changed Mindspace, portfolio,
COMPOSR, and SPLICR utility sources plus every file in `(excepted modules)`; the
2026-07-19 post-audit refresh covers newer Mindspace production changes and
reconfirms that the other three source sets have no newer screened source.
They promoted independently reusable data, input, geo/GeoJSON, deep-query,
concurrency, JSON Pointer, Retry-After, hashing, path, function-control,
binary-search/indexing, Jaccard-similarity, browser control/media, and strict JSON
Storage atoms. The latest pass additionally centralizes Date-compatible,
Firestore, and Protobuf-message structured timestamps without importing
notification/task policy. Archive, audio, provider, template, product persistence, React/UI,
profiling, application schema, retry-execution, and application-record behaviors
remain with their owning domains.

Meaningfully distinct variants remain only where their documented return shape
or policy differs. Adversarial follow-up verifies exact text/JSON/GeoJSON work
bounds, strict zoned calendars, Float32 range, explicit repeated-local-time
selection, finite-range arithmetic, comparator laws, one-time sort snapshots,
exact JSON media recognition, and response-length grammar. The atomic
type/default/input, structured-timestamp, and deep-query functions
compose broader behavior without truthiness loss, hidden mutation, accessor
invocation, prototype pollution, or unbounded recursion. Dot-style discovery is
available through frozen namespaces and `deepQuery(value)`, while no normal or
opt-in package entry patches built-in constructors or prototypes.

## External gates still open

1. Extend bounded real-app evidence where it is safe. The portfolio legacy auth
   hook now uses v2 `findDeepValue` through a local alias and builds successfully;
   Mindspace has no current package imports, SPLICR is not a JavaScript package
   consumer, and COMPOSR's heavily dirty working tree must be isolated first.
   This does not establish whole-application drop-in compatibility.
2. Obtain explicit approval for the intended version, exact commit, npm
   dist-tag, npm account-side trusted-publisher setup, tag, push, and publication.
3. After publication, install the registry artifact and verify its integrity,
   provenance, file list, declarations, and documented imports before calling
   the release complete.

The exact approval boundaries, candidate checks, trusted-publishing design,
registry verification, and recovery procedure are defined in
[`RELEASE_RUNBOOK.md`](./RELEASE_RUNBOOK.md). That runbook is preparation, not
authorization to perform any external write.
