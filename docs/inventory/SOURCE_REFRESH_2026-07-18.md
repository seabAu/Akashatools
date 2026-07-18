# Active-source regression refresh — 2026-07-18

This ledger is the second read-only delta review of the current Mindspace,
portfolio rebuild, COMPOSR, and SPLICR working copies. It follows the
2026-07-16 refresh and deliberately includes dirty and untracked source. No
consumer project was modified.

The review combined Git status/history where available, source timestamps after
the previous refresh, complete utility-root enumeration, export scans, focused
source inspection, and existing Akashatools disposition records. Dependencies,
generated output, histories, backups, build output, coverage, virtual
environments, caches, and temporary document-import directories were excluded.

## Delta boundary

| Source | Current delta evidence | Result |
| --- | --- | --- |
| Mindspace `app/client` and `app/server` | Mindspace is not a Git working tree. Of 1,509 screened JavaScript/TypeScript source files, 23 have post-2026-07-16 timestamps. The utility-like changes are `features/Dashboard/lib/backlogResume.js`, `features/Dashboard/lib/dashboardAgenda.js`, `lib/utilities/actionSwitchboard.js`, and navigation hooks. | No new generic implementation gap. Dashboard timelines, action capabilities, routes, handlers, and registries are product policy. Day keys/windowing compose the existing local-date and sorting primitives. The earlier `data`/`input` regression pass separately adopted the type, default, initialization, and field-inference atoms previously hidden in Mindspace form/schema helpers. |
| Portfolio rebuild `sgb-portfolio-rebuild2026` | The tree is clean. Commits `ee12bf6` and `c03e86e` were made on 2026-07-17; the latter is production-container/CI work. Only `web/next.config.ts` and a structural-boundary test have post-2026-07-16 source timestamps. Current client/server/shared/web utility roots were re-enumerated. | No post-refresh generic utility delta. The current single-flight, byte-formatting, content-disposition, field-path, containment, stable-order, validation, data/input, and JSON behaviors remain covered by existing canonical APIs or explicit app-owned dispositions. |
| COMPOSR `app` | The working tree contains 90 modified or untracked paths. Of 327 screened source files, 209 have timestamps on or after 2026-07-16. The post-refresh concentration is the new thread-archive and web-archive packages, semantic synthesis, ongoing-worker concurrency, UI virtualization, and their application adapters. | Several atomic candidates are reusable; archive formats, thread records, UI rendering, source policy, persistence, transport pinning, and synthesis policy remain package/application owned. |
| SPLICR `app` | The working tree contains 31 modified or untracked paths. Of 53 screened source files, 26 have post-2026-07-16 timestamps. The delta is a versioned API-resource catalog, generic REST TTS adapter, profiles, provider registry, credential vault, and supporting API/UI/tests. | JSON Pointer lookup and `Retry-After` interpretation are generic atoms. Provider templates, PCM/WAV conversion, resampling, credentials, SQLite stores, TTS controls, retry policy, and adapter registries remain SPLICR-owned or belong in dedicated media/transport packages. |

Counts describe the inspected working copies, not a release claim. Files may be
edited again after this dated review.

## Portable candidate dispositions

| Source behavior | Atomic finding | Disposition |
| --- | --- | --- |
| COMPOSR `OriginConcurrencyGovernor` | Bounds global work and per-origin work, queues callers, and makes release idempotent. The source class has no queue bound, cancellation, close behavior, or safe `run` wrapper, so a forgotten release can deadlock it. | Adopt rewritten global and keyed concurrency limiters under `async`. Share one scheduler core; bound queued work; support aborting waiters; always release around synchronous or asynchronous callbacks; expose read-only counts. Keep URL-origin extraction in COMPOSR. |
| SPLICR `_json_pointer` | Resolves RFC 6901-style escaped object/array tokens for response extraction. The source assumes a leading slash, accepts loose numeric array forms, and maps failure directly to provider retry policy. | Adopt strict `parseJsonPointer`, `getAtJsonPointer`, and `hasAtJsonPointer` object utilities. Keep transport retry/error policy in SPLICR. Consider immutable setting only after array append/index and unsafe-property contracts are explicit. |
| SPLICR `_parse_retry_after` | Interprets either delay text or an HTTP date. The source accepts fractional delays and ambient time and collapses malformed input to `None`. | Adopt an HTTP helper with RFC-aligned integer delta-seconds, injectable current time, an explicit invalid result, and a caller-selected cap. Do not silently add retries to `http.request`. |
| COMPOSR `canonicalJson`, `sha256`, `digestRecord`, and `stableId` | Deterministic identity composes stable JSON with SHA-256. Akashatools `stableJson` already supplies the stricter canonical-data layer; the COMPOSR normalizer invokes accessors, accepts non-plain objects, and lacks work limits. | Retain `stableJson`; add a native Web Crypto SHA-256 helper and a composed deterministic JSON digest/identifier only with explicit byte and output contracts. Do not copy the hand-written SHA-256 implementation. |
| COMPOSR `crc32`, checksum manifests, and stream measurement | CRC-32 is a small portable integrity primitive. SHA-256 manifests and replayable stream measurement are useful but the current implementation is Node/archive-specific. | Candidate for a focused checksum/hash surface. Keep ZIP streaming and archive manifests in COMPOSR unless an independent archive API is designed. |
| COMPOSR `safeArchivePath` / `validateArchivePaths` | Rejects absolute, traversal, platform-reserved, control-character, duplicate, and case-colliding archive member paths. This is a strong zip-slip prevention boundary independent of WARC/WACZ policy. | Adopt a bounded portable-relative-path validator only with literal option validation, Unicode normalization policy, deterministic collision rules, and tests. It must not imply that validating a name authorizes a filesystem write. |
| COMPOSR `lineAt` and registry/index construction | Uses binary search over sorted line offsets; several changed registries repeatedly convert arrays to keyed maps. Mindspace/portfolio also retain `arrayToEnum`/descriptor-registry variants. | Add general `lowerBound`/`upperBound`/`binarySearch` and identity-preserving `keyBy` primitives rather than application-specific registries or unsafe value-to-object enums. |
| COMPOSR lexical token overlap | Internal synthesis code computes Jaccard-style set similarity for bounded token sets. | A generic set-similarity helper is plausible, but defer until naming, iterable materialization bounds, and weighted/multiset distinctions are designed. It is not required to preserve COMPOSR behavior. |
| COMPOSR `sourceHtmlToText` | Regexes a source-specific, already-sanitized HTML fragment into text and decodes a small entity subset. | Reject as a generic HTML utility. Correct browser/server HTML-to-text behavior requires a parser, sanitization boundary, entity completeness, and block/whitespace policy. |
| COMPOSR ZIP/WARC/WACZ readers/writers | Implements bounded archive and web-preservation formats with Node compression/crypto dependencies. | Keep in COMPOSR's dedicated `web-archive` package. A general utility package should not expose partial archive-format support incidentally. |
| COMPOSR virtual list and record cards | Framework-free browser components with focus, ARIA, measurement, and rendering policy. | Keep in COMPOSR UI. They are components, not atomic data/browser utilities. |
| SPLICR REST JSON templates | Recursively freezes/thaws JSON templates and resolves placeholders from nested context. | Keep provider-owned. Missing-variable behavior, coercion, key templating, secret placement, and request serialization are security-sensitive template policy. Existing Akashatools path/JSON atoms can support a future independent design. |
| SPLICR PCM/WAV conversion and linear resampling | Portable algorithms exist, but format widths, canonical sample rate, clipping, mixing, quality, and memory policy are media-domain contracts. | Defer to a dedicated audio/media package rather than a universal utility surface. |
| SPLICR profiles, API resources, registries, stores, and vaults | Reusable architectural patterns, but their fields, revisions, adapters, database schema, OS-keyring policy, and lifecycle are product infrastructure. | Keep app-owned. Extract only independently specified primitives such as concurrency, immutable JSON, validation, and paths. |

## Existing canonical coverage reconfirmed

- Mindspace and portfolio data/form helpers now map to the atomic `data` and
  `input` categories: type normalization, complete-array profiling, fresh
  defaults, recursive initialization, HTML input inference, control inference,
  descriptors, and ordered field construction.
- Mindspace dashboard dates compose `localDateKey`, `startOfLocalDay`,
  `isSameLocalDay`, `normalizeInstantRange`, and stable sorting rather than
  justifying dashboard-specific utilities.
- COMPOSR/SPLICR byte measurement maps to `utf8ByteLength`; strict JSON cloning
  and canonical serialization map to `cloneJson` and `stableJson`.
- Existing path traversal, deep querying, field paths, collection upserts,
  single-flight loaders, browser downloads, secure UUIDs, formatting, and
  validation retain their prior dispositions.
- SPLICR's provider retry loop does not change the deliberate one-attempt
  contract of `http.request`; parsing retry advice and executing retry policy are
  separate concerns.

## Implementation queue

- [x] Add global and keyed bounded concurrency limiters with cancellation and
  release-on-settlement regression tests.
- [x] Add strict RFC 6901 JSON Pointer parsing, reading, and presence checks.
- [ ] Add identity-preserving `keyBy` and comparator-based binary-search bounds.
- [ ] Add strict `Retry-After` parsing without adding implicit HTTP retries.
- [ ] Design and add native hashing/checksum atoms plus stable JSON composition;
  keep cryptographic and non-cryptographic names visibly distinct.
- [ ] Add portable relative/archive path validation if its write-authorization
  boundary can remain unambiguous.
- [ ] Reopen the reserved `function` category for independently useful
  once/memoize/debounce/throttle contracts after receiver, async result,
  cancellation, cache, and timer semantics are written down.
- [ ] Resolve the explicit opt-in `Array.prototype` augmentation decision. Never
  augment `Object.prototype`; normal and granular imports must remain inert.

Each adopted batch must update this ledger and the living checklist in the same
commit, add strict JSDoc/types/package endpoints automatically, and pass the full
regression, coverage, bundle, editor, and installed-package gates before the
release-readiness snapshot is replaced.
