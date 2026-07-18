# Changelog

## 2.0.0-alpha.1

- Reopened the local release-candidate evidence for a 2026-07-18 regression and
  utility-surface expansion; prior package, bundle, test, coverage, and runtime
  totals remain historical until the expanded surface is fully reverified.
- Added the universal `data` category with atomic type-descriptor normalization,
  complete array type analysis, fresh type/value defaults, and bounded recursive
  shape initialization.
- Added the universal `input` category with separate scalar input inference,
  composite control classification, and frozen framework-neutral field
  descriptors for plain objects and arrays.
- Expanded bounded object traversal with predicate/all-match collection and
  explicit exact-needle boolean, entry, value, parent, and all projections.
- Added frozen `deepQuery(data).has(...)` dot-style syntax without modifying
  `Object.prototype`, `Array.prototype`, constructors, or import-time globals.
- Added generated category indexes and named/default granular method subpaths
  such as `akashatools/array/chunk`, with canonical function identity, types,
  package-smoke coverage, and bundle equivalence checks.
- Reclassified the Mindspace/portfolio data and input families so generic
  introspection/default/control primitives can compose beneath application-owned
  Mongoose, React, layout, custom-ID, and product-schema adapters.
- Reopened generated category/method subpaths and safe fluent deep-query syntax
  as explicit ergonomics work while retaining side-effect-free normal imports.
- Kept focused imports at 321 raw/252 gzip bytes after the first data batch and
  temporarily widened the full default-namespace guardrail for the explicitly
  approved input/query expansion; final limits will be recalibrated before RC.
- Added strict `isArray`, `isString`, `isNumber`, `isBoolean`,
  `isNonArrayObject`, and `isFiniteNonInteger` validation guards plus
  `defaultIfBlank`, based on 559 current legacy consumer reads.
- Added a reproducible error-tolerant AST audit of the complete current
  Mindspace and portfolio Akashatools 1.0.2 import footprint, with every parsed
  member correlated to the migration manifest.
- Added an approval-gated release runbook for exact candidate verification,
  trusted publishing and provenance, explicit dist-tags, registry smoke tests,
  and fix-forward recovery.
- Pinned GitHub Actions to verified commit identities and added a workflow
  contract test covering permissions, supported Node lines, package checks, and
  the three-engine browser gate.
- Added a frozen default `akasha` namespace with both flat utility access and
  frozen categorized namespaces.
- Added build-time collision detection, namespace completeness tests, and a
  strict editor-completion fixture.
- Documented canonical API naming, arguments, errors, mutation, and compatibility
  conventions.
- Added a disposition ledger covering all 119 named Akashatools 1.0.2 exports,
  including defects, native replacements, adopted APIs, and deferred redesigns.
- Recorded all 9 runtime and 2 type exports from COMPOSR's utility package,
  separating adopted primitives from profiler-contract behavior.
- Classified all 136 active Mindspace client/server utility modules by generic,
  environment/framework, or application-owned scope.
- Added export-level dispositions for 66 Mindspace core array, object, string,
  math, sort, and client/server validation exports.
- Added export-level dispositions for 58 Mindspace data, schema, random-fixture,
  and validation-error parsing exports.
- Added export-level dispositions for 29 Mindspace date-selection and timestamp
  adapter exports.
- Added export-level dispositions for 24 Mindspace color, local-text insight, and
  speech-cleanup exports.
- Added strict immutable `array.flatten` with native depth and sparse-slot
  semantics.
- Enforced the `[0, 1)` contract for injected random sources and added
  deterministic float/date coverage.
- Added `number.summarizeNumbers` with finite-input validation, interpolated
  percentiles, population deviation, scaled extreme-value calculations, and
  null empty-sample statistics.
- Added named, tree-shakeable root exports and explicit category subpaths.
- Added modern array, async, browser, collection, date, number, object, random,
  sort, string, and validation modules.
- Unified immutable array removal behind `removeFromArray`.
- Defined dense sparse-array behavior for move/insert/remove operations and
  validated the `all` removal option.
- Standardized sparse-array behavior across the complete array surface: sparse
  slots are `undefined` sequence items by default, with documented native-flat
  and identity-preserving normalization exceptions.
- Added strict standalone `countBy` and `partition` array helpers with dense
  sparse-slot behavior, identity-safe keys, and fail-fast callbacks.
- Verified `upsertBy` and `excludeBy` as the canonical immutable key-based
  replacement/removal pair, including numeric-key and sparse-slot semantics.
- Centralized and enforced the finite `[0, 1)` injected-random contract for
  array shuffling and primitive random helpers.
- Added a reproducible repeated-membership benchmark documenting when Set/Map
  construction outperforms nested linear membership checks.
- Adopted native `structuredClone`, `Object.hasOwn`, `Intl.DateTimeFormat`,
  `Map`, `Set`, `String.prototype.replaceAll`, and `Math.hypot` where appropriate.
- Added prototype-pollution protection to nested paths and deep object merging.
- Locked `setAtPath` structural sharing/no-op identity guarantees and expanded
  string/array path prototype-pollution regression coverage.
- Added bounded, cycle-safe `traverseObject` and `findDeep` with path/parent
  results and side-effect-safe own-data-property traversal.
- Defined deep-merge handling for non-plain values, symbols, accessors, unsafe
  names, and null-prototype base objects without invoking getters.
- Added bounded concurrency mapping from COMPOSR's utility package.
- Added safe nested path and JSON contract helpers from the portfolio rebuild.
- Added a separate `akashatools/node` entry point with lexical and existing-realpath
  containment checks, including cross-platform and symlink-escape tests.
- Retained the 1.x `akashatools/lib` entry points as compatibility exports.
- Added a dependency-free Node test suite and JSDoc for public functions.
- Added literal finite-number, safe-integer, Map, Set, typed-array, plain-object
  array, Blob, and File guards with cross-realm or safe-global behavior.
- Made the JSON-contract subset reject unknown keywords/malformed schemas and
  enforce finite JSON numbers, plain records, sparse items, and own-only refs.
- Reworked email/NANP checks as bounded syntax and normalization helpers, and
  documented the public regular-expression complexity review.
- Added portfolio-derived `slugify`, an explicit cloned-RegExp replacement API,
  locale-neutral identifier casing, and cross-platform filename hardening.
- Added Web Crypto `secureRandomUuid`/`secureRandomString`, corrected scientific
  decimal rounding and wrap overflow, and bounded range/string allocations.
- Added stable multi-key sorting, explicit null placement, reusable collator
  comparators, and a reproducible collator benchmark.
- Added explicit instant-range normalization/predicates, Unix-second range
  validation, and DST gap/overlap local-calendar tests.
- Hardened bounded all-settled mapping and cancellable delay edge cases, timer
  limits, and abort-listener cleanup; recorded function-control deferrals.
- Hardened browser downloads with temporary-anchor cleanup, deferred URL
  revocation, single JSON extensions, injected tests, and a real-browser fixture.
- Added bounded `http.request` with composed cancellation/timeouts, explicit
  response modes, typed and redacted errors, local-server tests, and a documented
  no-retry/application-policy boundary.
- Closed the optional category review: schema/model adapters and diagnostics stay
  app-owned, while generic JSON contract checks remain under `validation`.
- Added consistent `@since 2.0.0` metadata to every public declaration and a
  reproducible API-documentation check for summaries, types, and deprecations.
- Added a source-generated API reference grouped by category and a drift check
  integrated into the normal project verification command.
- Added a deterministic JSON manifest for all 119 legacy exports and a searchable
  canonical/legacy function index with runtime, mutation, and import metadata.
- Added workflow recipes, namespace migration examples, and explicit guidance on
  default, named, category, and wildcard import bundle tradeoffs.
- Added generated declarations with conditional type exports, strict JavaScript
  and TypeScript consumer fixtures, language-service completion tests, export
  resolution coverage, and a reviewed API-surface snapshot.
- Added a clean-room package smoke test that packs, installs, executes JavaScript,
  and compiles TypeScript against the exact installed tarball.
- Added executable representative 1.x compatibility coverage and documented the
  behavioral migration, no-new-legacy-namespace, and 3.0-earliest removal policy.
- Bounded nested path and deep-merge complexity, rejected mutually circular merge
  pairs, and consolidated object/filesystem/regex/random/HTML threat models with
  a reproducible prerelease dependency and package audit.
- Added reusable mutation/invalid-contract test helpers and seeded randomized
  invariant coverage across paths, ranges, sorting, deduplication, and dates.
- Added source-only Node coverage reporting with enforced 95% line, 80% branch,
  and 90% function floors, plus focused browser, collection-compatibility, and
  date contract tests.
- Reorganized all runtime contracts by canonical public category, removing the
  historical mixed core/object-validation test files while retaining explicit
  namespace, package, compatibility, and cross-category invariant suites.
- Extended the real-browser fixture with native Blob/File and iframe-realm
  Map/Set/typed-array guard checks, verified without browser console errors.
- Added Playwright automation for six Chromium, Firefox, and WebKit contracts,
  a Node 22/24 LTS GitHub Actions matrix, browser CI, and a package-wide
  JavaScript syntax scanner.
- Added exactly pinned esbuild bundle fixtures and budgets, verified focused
  import equivalence and zero-byte side-effect elimination, then used the
  byte-identical result to support generated category/method subpaths without
  duplicating implementations.
- Completed and enforced IDE-visible parameter/return descriptions, thrown-error
  contracts, examples, and edge-case prose for async, browser, collection, and
  Node public APIs; regenerated the API reference and declarations.
- Extended the enforced complete-JSDoc schema to the full number API, including
  finite-input, overflow, precision, empty-sample, and representability edges.
- Completed and enforced random API documentation, and fixed `randomInt` to
  reject non-boolean `inclusiveMaximum` options instead of coercing truthiness.
- Completed and enforced sort API documentation, and normalized numeric/Date
  comparisons so invalid Dates and extreme numbers always yield finite ordering signals.
- Completed and enforced HTTP API documentation, distinguishing typed transport
  failures from native argument/setup errors and documenting redaction boundaries.
- Completed and enforced string API documentation; `includesText` now rejects
  non-boolean case policy and `replaceMany` rejects coercive containers/pairs.
- Completed and enforced date API documentation across local-calendar, absolute
  instant, Unix-second, clock-string, DST, range, and Intl formatting semantics.
- Completed and enforced object API documentation; `pickAllowed` now requires
  string allow-list entries and a literal boolean unknown-property policy.
- Completed and enforced validation API documentation; `isEmpty` now uses
  literal plain-object and cross-realm Map/Set guards instead of key-counting any object.
- Completed and enforced array API documentation; array fallbacks and removal
  options now reject invalid container types instead of coercing or ignoring them.
- Began the 2026-07-16 active-source refresh across Mindspace, the portfolio
  rebuild, COMPOSR, and SPLICR with a dated delta ledger and implementation queue.
- Repeated the read-only source regression scan on 2026-07-18, including current
  dirty and untracked consumer code, and separated new atomic concurrency,
  JSON-Pointer, retry-advice, hashing, indexing, and portable-path candidates
  from application/archive/media/UI policy.
- Added bounded `createSingleFlight` and `createKeyedSingleFlight` async helpers
  from live portfolio request-coalescing evidence, with generational invalidation
  and least-recently accessed key eviction.
- Added strict bounded `stableJson` serialization from COMPOSR checkpoint
  comparison evidence, with deterministic keys and no accessor/cycle coercion.
- Added strict `formatBytes` decimal/IEC formatting from live portfolio media
  presentation evidence.
- Added allocation-free `utf8ByteLength` and explicit whitespace-delimited
  `countWords` primitives from SPLICR's live chunk-planning requirements.
- Added bounded `splitTextByLimits` semantic chunking with exact source
  preservation, Unicode-safe fallback, and an optional custom cost estimator.
- Raised only the complete discoverable-namespace bundle guardrail after the
  measured source expansion; focused import and side-effect budgets are unchanged.
- Added descriptor-safe bounded `cloneJson` from Mindspace payload-boundary
  evidence, without inheriting Mongo, HTTP, or application error policies.
- Added bounded `parseContentDispositionFilename` from portfolio download
  evidence, with standards-aware extended decoding and path/control hardening.
- Added strict compact `formatDuration` and Intl-backed `formatRelativeTime`
  from repeated Mindspace time-display evidence.
- Added pinned ESLint 10 and Prettier 3 checks for maintained source, tests,
  fixtures, scripts, and root configuration files.
- Added executable focused-import compatibility fixtures for current Mindspace
  client/server, portfolio, COMPOSR, and SPLICR utility contracts.
- Confirmed the 2.0 package remains ESM-only from current consumer manifests and
  compiler settings; no active CommonJS requirement was found.
- Added shared source-shaped small/medium/large benchmark fixtures, fixed
  warmups, runtime metadata, range/variance reporting, and UTF-8 allocation
  tradeoff measurements.
- Added a named source-origin regression suite and ledger covering portable bug
  families while keeping rejected application/framework defects out of scope.
- Added a checked representative consumer bundle comparison; focused imports
  save 46.6-50.1 KB raw and 14.4-15.3 KB gzip versus the default namespace.
- Added bounded deterministic Node-only `globPaths` on the stable native Node
  filesystem glob API and raised the Node engine floor to 22.17.
