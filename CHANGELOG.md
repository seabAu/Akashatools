# Changelog

## 2.0.0-alpha.1

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
