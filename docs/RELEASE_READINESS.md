# Release readiness

> Status on 2026-07-18: the `(excepted modules)` redesign and complete local
> release-candidate evidence are finished. All local gates pass on both supported
> Node runtimes and all three browser engines. Hosted workflow evidence, bounded
> real-app migrations, and every push, tag, automation, and publication action
> remain external approval gates.

## Current local candidate snapshot

| Field | Verified value |
| --- | --- |
| Package | `akashatools` |
| Workspace version | `2.0.0-alpha.1` |
| Module format | ESM-only |
| Node.js engine | `>=22.17` |
| Universal categories | 17 |
| Public methods | 191 |
| Generated declaration files | 232 |
| Reviewed API surfaces | 19 |
| License | ISC (`LICENSE`, 741 bytes) |
| Dry-run files | 523 |
| Dry-run packed size | 370,795 bytes |
| Dry-run unpacked size | 1,389,292 bytes |

`npm pack --dry-run --json` verifies the selected package content without
creating or publishing an artifact. The package includes runtime sources,
generated declarations, retained `lib` compatibility modules, documentation,
benchmarks, changelog, README, license, and package metadata. Tests, consumer
fixtures, development scripts/configuration, coverage, installed dependencies,
and credentials are excluded.

The repository, issue tracker, and homepage metadata still target the existing
public `seabAu/Akashatools` project. This local 2.0 repository has no Git remote
configured, and no push, tag, registry write, consumer-project edit, or release
automation change occurred during this work.

## Reproducible local evidence

The complete project check and source coverage gate completed successfully on
the installed Node.js 22.18.0 runtime and an isolated Node.js 24.18.0 runtime on
Windows. Dependency audit and dry-run package inspection also pass. Playwright
separately passed all six browser behaviors in Chromium, Firefox, and WebKit.

| Gate | Current result |
| --- | --- |
| Dependency audit | 0 reported vulnerabilities |
| Maintained syntax | 305 JavaScript files pass |
| Public documentation | 191 declarations pass |
| Generated declarations | 232 files current |
| API surface snapshot | 19 surfaces current |
| Node contract tests | 215 passed, 0 failed on Node 22 and Node 24 |
| Installed-package smoke | Fresh JavaScript and TypeScript consumers pass |
| Node 22 source coverage | 98.21% lines / 89.56% branches / 97.23% functions |
| Node 24 source coverage | 98.21% lines / 89.51% branches / 97.23% functions |
| Browser tests | 18 passed across Chromium, Firefox, and WebKit |
| Focused import measurement | 321 raw / 252 gzip bytes; budget 400 / 300 |
| Default namespace maximum | 113,294 raw / 33,705 gzip; budget 114,000 / 34,000 |
| Side-effect-only import | 0 raw bytes / 20-byte empty gzip envelope |
| Consumer bundle evidence | Focused fixtures save 106,018-109,518 raw and 31,050-32,026 gzip bytes |
| Legacy usage evidence | 1,982 parsed reads; every member dispositioned; 559 reads drove seven strict APIs |
| Modern import inertness | Root, all 18 category surfaces, and all 191 granular methods preserve complete Array/Object/Date descriptors |

The unified gate also verifies formatting, linting, JSDoc/TypeScript checking,
editor completions, generated documentation and migration data, export-map
resolution, canonical function identity, side-effect elimination, focused
bundle equivalence, and representative source-consumer fixtures.

## Scope conclusions

The 2026-07-18 read-only reviews cover the changed Mindspace, portfolio,
COMPOSR, and SPLICR utility sources plus every file in `(excepted modules)`.
They promoted independently reusable data, input, geo/GeoJSON, deep-query,
concurrency, JSON Pointer, Retry-After, hashing, path, function-control,
binary-search/indexing, Jaccard-similarity, browser control/media, and strict JSON
Storage atoms. Archive, audio, provider, template, product persistence, React/UI,
profiling, application schema, retry-execution, and application-record behavior
remains with its owning domain.

Meaningfully distinct variants remain only where their documented return shape
or policy differs. Adversarial follow-up verifies exact text/JSON/GeoJSON work
bounds, strict zoned calendars, Float32 range, explicit repeated-local-time
selection, finite-range arithmetic, comparator laws, one-time sort snapshots,
exact JSON media recognition, and response-length grammar. The atomic
type/default/input and deep-query functions
compose broader behavior without truthiness loss, hidden mutation, accessor
invocation, prototype pollution, or unbounded recursion. Dot-style discovery is
available through frozen namespaces and `deepQuery(value)`, while no normal or
opt-in package entry patches built-in constructors or prototypes.

## External gates still open

1. Push the exact reviewed candidate only with explicit authorization, then
   capture the configured hosted Node 22, Node 24, and browser workflow result
   from a clean checkout. Local execution cannot prove hosted runner setup.
2. With explicit authorization, migrate bounded areas of Mindspace, the
   portfolio rebuild, COMPOSR, and SPLICR. Representative fixtures and static
   call-site evidence do not prove whole-application drop-in compatibility or
   every accidental dependency on legacy coercion, mutation, swallowed errors,
   or environment globals.
3. Obtain explicit approval for the intended version, exact commit, npm
   dist-tag, provenance/trusted-publishing setup, tag, push, and publication.
4. After publication, install the registry artifact and verify its integrity,
   provenance, file list, declarations, and documented imports before calling
   the release complete.

The exact approval boundaries, candidate checks, trusted-publishing design,
registry verification, and recovery procedure are defined in
[`RELEASE_RUNBOOK.md`](./RELEASE_RUNBOOK.md). That runbook is preparation, not
authorization to perform any external write.
