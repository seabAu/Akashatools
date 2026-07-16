# Akashatools 2026 living checklist

> Status: active project plan. Update this document in the same commit as each
> meaningful implementation batch. Check an item only when its acceptance
> criteria are verified. Add newly discovered work instead of keeping it in chat.

## Goal-slot directive

Work through this checklist until Akashatools 2.0 is release-ready. Preserve the
1.0.2 baseline, keep the checklist and decision log current, implement in small
reviewable commits, and verify every public behavior. Do not publish to npm or
modify source consumer projects without explicit user approval.

Canonical checklist:
`akashatools2026/docs/LIVING_CHECKLIST.md`

## North star

Akashatools should be a modern, dependency-light utility library that is:

- easy to discover interactively in VS Code;
- painless for quick application work;
- efficient when a consumer imports only one function or category;
- explicit about mutation, failures, runtime requirements, and edge cases;
- safe around untrusted paths, objects, URLs, files, and response bodies;
- equally coherent in browser, server, and shared JavaScript code;
- documented well enough that source-project archaeology is never required.

The intended experience supports three complementary import styles:

```js
// Discoverable namespace: optimize for editor exploration.
import akasha from "akashatools";
akasha.array.chunk(values, 10);
akasha.validation.isEmail(input);

// Flat namespace: familiar Underscore/Lodash-style convenience.
akasha.chunk(values, 10);
akasha.isEmail(input);

// Focused imports: optimize for explicit dependencies and bundling.
import { chunk, isEmail } from "akashatools";
import { chunk } from "akashatools/array";
```

The default namespace will be a plain, frozen utility object. It will not be a
callable wrapper and will not implement implicit chaining in 2.0. Those features
would add API and type complexity and require demonstrated consumer value.

## Lessons adopted without copying another library

- Underscore demonstrates that named exports and a default convenience interface
  can coexist, and that fine-grained source modules make APIs inspectable.
- Lodash demonstrates the value of a memorable flat namespace, documentation by
  category, consistent iteratee conventions, and direct method imports.
- Akashatools will keep its own naming, contracts, implementations, documentation,
  and tests. We adopt interface principles, not source code or prose.
- Standalone npm packages for every method are out of scope. They duplicate shared
  internals and complicate dependency graphs. If per-method imports are justified,
  they will be subpath exports from this single package.

## Current verified baseline

- [x] Initialize Git inside `akashatools2026`.
- [x] Preserve copied Akashatools 1.0.2 in baseline commit `3a245be`.
- [x] Commit the first 2.0 alpha foundation in `3b0fe6c`.
- [x] Set the package to ESM and Node.js 22+.
- [x] Add named root exports and category subpath exports.
- [x] Retain legacy `akashatools/lib` entry points temporarily.
- [x] Add strict JSDoc checking through `jsconfig.json`.
- [x] Add dependency-free runtime tests; 88 tests currently pass.
- [x] Verify root, category, and legacy imports.
- [x] Verify npm tarball contents with `npm pack --dry-run`.
- [x] Verify focused-import tree-shaking after adding the default namespace:
  esbuild 0.28.1 produced 304-byte minified bundles for both named-root and
  category `chunk` imports versus 20,373 bytes for the complete namespace.
- [x] Inventory the main utility locations in Akashatools, Mindspace, the 2026
  portfolio rebuild, COMPOSR, and SPLICR. A 2026-07-16 delta refresh is active
  because all four consumer source trees changed after the original snapshot.

## Phase 1 — lock the public API architecture

### 1.1 Namespace and import ergonomics

- [x] Add a documented default export named `akasha` internally.
- [x] Expose every collision-free public utility directly on the default object.
- [x] Expose every implemented canonical category as a nested namespace on the default object.
- [x] Freeze the default object and nested category objects against accidental
  consumer mutation.
- [x] Confirm `import * as akasha from "akashatools"` remains useful and typed.
- [x] Decide whether abbreviated compatibility namespaces such as `val`, `str`,
  `rand`, and `ao` belong only under `akashatools/legacy` or remain deprecated
  aliases on the main namespace.
- [x] Define deterministic handling for flat-name collisions. Preferred order:
  rename for clarity, keep only the category form, or expose an explicit alias;
  never silently overwrite a function.
- [x] Add namespace completeness tests comparing category exports, root named
  exports, and default-object properties.
- [x] Add an editor fixture proving dot completion for `akasha.array.`,
  `akasha.validation.`, and the flat namespace.

Acceptance criteria:

- A new user can discover functions by typing dots without reading source files.
- An experienced user can import a single function without loading a namespace.
- All supported styles resolve to the same function identity where practical.
- Namespace construction has no import-time effects beyond object creation.

### 1.2 Canonical categories

- [x] Confirm and document the stable categories: `array`, `async`, `browser`,
  `collection`, `date`, `function`, `http`, `number`, `object`, `random`, `sort`,
  `string`, and `validation`.
- [x] Design a separate `node` surface for filesystem/path/runtime utilities.
- [x] Decide whether schema and data-model helpers are generic enough for a
  `schema` category or belong in a separate package/add-on.
- [x] Decide whether debug helpers merit a `debug` category or should be replaced
  by application logging/diagnostic interfaces.
- [x] Keep environment-specific modules out of universal entry points when merely
  importing them could reference unavailable globals.

### 1.3 Naming and signature conventions

- [x] Create `docs/API_CONVENTIONS.md` with naming rules and examples.
- [x] Prefer full words in canonical names (`validation`, not `val`; `string`, not
  `str`) while documenting migration aliases.
- [x] Standardize callback naming: `predicate`, `mapper`, `toKey`, `compare`.
- [x] Standardize option-object placement as the final argument.
- [x] Standardize `AbortSignal` support for cancellable asynchronous operations.
- [x] Standardize range semantics as start-inclusive/end-exclusive unless the
  function name or option explicitly says otherwise.
- [x] Standardize nullish versus falsy handling; never treat `0`, `false`, and
  `""` as invalid accidentally.
- [x] Standardize not-found results by domain (`undefined`, `null`, `-1`, empty
  collection, or unchanged copy) and document each choice.
- [x] Standardize errors: programmer-contract violations throw `TypeError` or
  `RangeError`; operational failures retain a cause and domain-specific metadata.
- [x] Avoid boolean positional parameters where a named option is clearer.
- [x] Mark aliases with `@deprecated` and a replacement path.

## Phase 2 — complete the source inventory and disposition ledger

- [x] Create `docs/UTILITY_INVENTORY.md`. Every candidate needs: source project,
  file, export name, behavior summary, dependencies, environment, duplicates,
  known bugs, tests, proposed canonical name, and one disposition: adopt, merge,
  replace with a native API, keep app-local, defer, or reject.

### 2.1 Akashatools 1.0.2

- [x] Inventory every export in `lib/AO.js`.
- [x] Inventory every export in `lib/Val.js`.
- [x] Inventory every export in `lib/Time.js`.
- [x] Inventory every export in `lib/Http.js`.
- [x] Inventory every export in `lib/String.js`.
- [x] Inventory every export in `lib/Math.js` and `lib/Rand.js`.
- [x] Inventory every export in `lib/File.js` and `lib/Debug.js`.
- [x] Record broken implementations and undeclared assumptions before replacing
  them; examples already observed include incorrect variable references, browser
  globals in universal validation code, and ambiguous validity semantics.
- [x] Map all 1.x names to a 2.x replacement, deprecation, or removal rationale.

### 2.2 Mindspace

- [x] Classify every active module under the client/server utility roots as a
  generic candidate, environment/framework candidate, or app-owned module.
- [x] Inventory and disposition the 66 universal-core exports across Mindspace
  array, object, string, math, sort, and client/server validation modules.
- [x] Inventory and disposition the 58 Mindspace data, schema, random-fixture,
  and validation-error parsing exports.
- [x] Inventory and disposition the 29 Mindspace date-selection and timestamp
  adapter exports.
- [x] Inventory and disposition the 24 Mindspace color, local-text insight, and
  English speech-cleanup exports.
- [x] Inventory and disposition all 84 client/server time exports and record the
  exact 16-name duplicate matrix.
- [x] Inventory and disposition all 37 Mindspace browser/UI/React runtime
  exports.
- [x] Inventory and disposition all 15 Mindspace storage, credential-crypto, and
  service-worker debug queue exports.
- [x] Inventory and disposition all 25 Mindspace fetch/import/export/I/O exports
  and review prototype/Markdown/sentence modules without ESM declarations.
- [x] Inventory generic client utilities under `app/client/src/lib/utilities`.
- [x] Inventory generic server utilities under `app/server/utilities`.
- [x] Separate inventoried primitives from React, routing, notification, queue, recurrence,
  authentication, and domain-owned behavior.
- [x] Compare client/server duplicates for time, validation, file, schema, and
  data operations.
- [ ] Capture source behavior tests for any function whose edge cases are unclear.
- [ ] Review feature-local helpers only when they express a reusable primitive;
  do not migrate code solely because its folder is named `utils` or `lib`.

### 2.3 Portfolio rebuild

- [x] Inventory all 120 runtime exports in `client/src/utilities`,
  `server/utilities`, and shared contracts.
- [x] Review field-path, own-property, stable-order, field-coercion, network, and
  contained-path utilities for generalized contracts.
- [ ] Keep portfolio search, admin session, public snapshot, navigation, and
  storage policy app-local unless a clear independent abstraction emerges.
- [x] Compare portfolio legacy utility copies against Mindspace and Akashatools
  before adopting any implementation.

### 2.4 COMPOSR

- [x] Inventory all exports in `app/packages/utilities`.
- [x] Inventory all 79 public function declarations outside `@composr/utilities`
  plus the HTTP class/transport surface, individually dispositioning 21
  utility-like candidates.
- [x] Keep profiler bundle logic coupled to COMPOSR contracts app-local.
- [x] Generalize only dependency-free primitives or abstractions whose dependency
  belongs naturally in Akashatools.
- [x] Preserve bounded-concurrency ordering and failure semantics in compatibility
  tests for already adopted async functions.

### 2.5 Cross-project duplicate analysis

- [x] Group reviewed candidates by behavior rather than source name.
- [x] Identify semantic conflicts hidden behind identical names.
- [x] Identify identical behavior hidden behind different names.
- [ ] Choose one canonical implementation and contract per behavior.
- [x] Record aliases separately from canonical exports.
- [x] Record native replacements such as `structuredClone`, `Object.hasOwn`,
  `Array.prototype.toSorted`, `Intl`, `Set`, `Map`, and `URL`.

### 2.6 Active-source refresh and SPLICR

- [x] Locate and preserve the current Mindspace, portfolio rebuild, COMPOSR, and
  SPLICR app trees as read-only source references.
- [x] Create a dated delta ledger at
  `docs/inventory/SOURCE_REFRESH_2026-07-16.md` so post-snapshot findings do not
  silently invalidate the original inventories.
- [ ] Complete a symbol-level delta audit of changed and untracked utility-like
  modules in all four consumer apps.
- [ ] Inventory SPLICR's provider-neutral text measurement, semantic chunking,
  preprocessing, planning, delivery, storage, and error-classification
  algorithms, including Python-to-JavaScript semantic differences.
- [ ] Implement and verify the independently reusable candidates selected by the
  refresh ledger; do not migrate app contracts merely to increase API size.

## Phase 3 — finish the universal core

### 3.1 Arrays and collections

- [x] Add and test `flatten` with explicit depth semantics.
- [x] Evaluate `difference`, `union`, `partition`, `keyBy`, `countBy`, `sample`,
  `take`, and `drop` from actual consumer usage.
- [x] Consolidate reorder/move/insert/remove variants around immutable contracts.
- [x] Decide whether `removeFromArray` should optionally return removal metadata
  or whether a separate `extractFromArray` function is clearer.
- [x] Add key-based remove/update helpers without conflating index and numeric
  value selectors.
- [x] Define sparse-array behavior for every array transform.
- [x] Benchmark Set/Map strategies against nested `includes` for large inputs.
- [x] Add generic iterable support only where it improves real consumers without
  making return types surprising.

### 3.2 Objects and nested data

- [x] Add a well-specified deep equality function or explicitly defer to a
  dedicated library/native future API.
- [x] Design deep traversal/search results with `{ value, key, path, parent }`.
- [x] Consolidate `deepSearch`, `deepSearchItems`, `findByKey`, `findByValue`, and
  related legacy functions into a minimal traversal API.
- [x] Add cycle detection and traversal limits.
- [x] Decide handling for Maps, Sets, Dates, typed arrays, symbols, accessors, and
  class instances in traversal and merge operations.
- [x] Test structural sharing guarantees for `setAtPath`.
- [x] Test prototype-pollution resistance across parsed and array-form paths.
- [x] Evaluate `pickBy`, `omitBy`, `mapValues`, `mapKeys`, `invert`, and `entries`
  helpers based on cross-project use.
- [x] Specify whether deep merge replaces, concatenates, or rejects arrays; avoid
  a single magical option set that obscures behavior.

### 3.3 Validation and type inspection

- [x] Replace ambiguous 1.x `valid`, `isValid`, `isTruthy`, and `isBlank`
  semantics with small, literal predicates.
- [x] Add type guards for plain object, finite number, safe integer, Date, Map,
  Set, Blob, File, typed arrays, and object arrays where useful.
- [x] Ensure browser-only guards use `globalThis` feature detection safely.
- [x] Decide whether JSON validation accepts scalar JSON, objects/arrays only, or
  exposes both predicates under distinct names.
- [x] Expand JSON contract support only with documented schema keywords and tests;
  do not grow an accidental partial JSON Schema implementation indefinitely.
- [x] Evaluate email/phone/password functions as syntax helpers, not claims of
  identity, ownership, or deliverability.
- [x] Add configurable validation-result objects where callers need multiple
  errors; keep simple predicates boolean.
- [x] Review ReDoS and pathological-input behavior for every public regex.

### 3.4 Strings

- [x] Test case conversion with acronyms, digits, separators, and non-ASCII text.
- [x] Decide locale-sensitive versus locale-neutral behavior per function.
- [x] Add literal and RegExp replacement APIs without confusing the two.
- [x] Evaluate truncate, words, slug, strip/normalize whitespace, and pluralization
  candidates from real consumers.
- [x] Keep HTML escaping narrowly documented as text escaping, not full sanitizing.
- [x] Ensure filename helpers address reserved Windows names, trailing periods,
  path separators, extensions, and byte-length constraints where applicable.

### 3.5 Numbers, math, random, and sorting

- [x] Add and test finite numeric distribution summaries with explicit
  percentile, population-deviation, immutability, and empty-sample semantics.
- [x] Audit numeric coercion policy; default to rejecting implicit coercion.
- [x] Test `clamp`, `wrap`, and rounding at boundaries, infinities, `NaN`, and
  floating-point edge cases.
- [x] Decide BigInt counterparts only where semantics remain clear.
- [x] Add cryptographically secure random helpers under an unmistakable name;
  never imply `Math.random` output is token-safe.
- [x] Add injectable random sources consistently for deterministic tests.
- [x] Review range size limits to prevent accidental enormous allocations.
- [x] Expand sort helpers with selector, direction, null placement, collator, and
  stable multi-key ordering contracts.
- [x] Benchmark repeated `localeCompare` against reusable `Intl.Collator` objects.

### 3.6 Dates, time, ranges, and time zones

- [x] Build a duplicate matrix across Akashatools, Mindspace client/server, and
  portfolio time utilities.
- [x] Separate absolute instants, local calendar dates, zoned times, durations,
  clock times, and display formatting in names and types.
- [x] Consolidate same-day, days-in-month, local-date-key, Unix timestamp, and
  clock conversion helpers.
- [x] Design date-range normalization and inclusive/exclusive boundary rules.
- [x] Test daylight-saving gaps, overlaps, and day differences.
- [x] Prefer `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` over hand-built
  locale strings.
- [x] Evaluate the platform Temporal API only against the supported runtime floor
  and browser targets; do not assume availability.
- [x] Decide whether advanced recurrence/timezone logic stays application-owned or
  becomes a separately scoped package surface.

### 3.7 Async and function control

- [x] Add tests for empty input, mapper sync throws, cancellation, high requested
  concurrency, and result ordering.
- [x] Decide whether bounded mapping needs fail-fast and cancellation variants.
- [x] Add `once`, `memoize`, `debounce`, `throttle`, `retry`, and `timeout` only
  after defining `this`, argument, result, rejection, timer, and cancellation
  semantics.
- [x] Ensure timers do not retain abort listeners after settlement.
- [x] Define cache key and eviction behavior before exposing memoization.
- [x] Prefer composable primitives over one large async options object.

## Phase 4 — environment-specific surfaces

### 4.1 Browser

- [x] Test browser downloads with injected DOM/URL objects and a real browser.
- [x] Handle filename extensions without duplicate suffixes.
- [x] Define object URL revocation timing for synchronous and deferred clicks.
- [x] Evaluate clipboard, file reading, storage, and DOM helpers individually;
  avoid a miscellaneous browser dumping ground.
- [x] Keep React hooks and rendered DOM construction outside the core library.

### 4.2 Node filesystem and paths

- [x] Create `akashatools/node` without importing it from the universal root.
- [x] Generalize the portfolio contained-path protection and test traversal,
  symlink, separator, drive-letter, UNC, and case-sensitivity scenarios.
- [x] Design async file read/write helpers around explicit encoding and abort
  behavior.
- [x] Use atomic write patterns where a helper promises safe replacement.
- [x] Define file discovery semantics, glob dependency policy, ordering, and error
  handling before migrating `findFilesByPattern`.
- [x] Never hide destructive file failures or accept unchecked computed paths.

### 4.3 HTTP/fetch

- [x] Inventory all existing fetch wrappers and consumer expectations.
- [x] Define a typed `HttpError` carrying status, status text, URL, method,
  response headers, parsed body when safe, and original cause.
- [x] Support `AbortSignal` composition and explicit timeout behavior.
- [x] Define JSON/text/blob/array-buffer response parsing and empty-body handling.
- [x] Define retry eligibility, backoff, jitter, `Retry-After`, idempotency, and
  maximum elapsed time before implementing retries.
- [x] Redact secrets from diagnostics and errors.
- [x] Do not bake application API delays, authentication, or response envelopes
  into generic helpers.
- [x] Test with a local HTTP server, not only mocked `fetch`.

### 4.4 Debug and diagnostics

- [x] Inventory legacy debug behavior and actual current consumers.
- [x] Prefer injectable diagnostic callbacks over unconditional console output.
- [x] Decide whether function timing/profiling belongs in Akashatools or COMPOSR.
- [x] Ensure debug helpers are removable by bundlers and inert by default.

## Phase 5 — documentation and types

- [x] Give every public function a complete JSDoc summary, generic types,
  parameters, return type, thrown errors, examples, and important edge cases.
  All 119 public declarations are complete, with parameter/return prose,
  documented throws, and examples enforced by `npm run check:docs`.
- [x] Add `@since 2.0.0` and `@deprecated` consistently, enforced across all
  119 public declarations by `npm run check:docs`.
- [x] Generate an API reference grouped by category from source comments or a
  single authoritative manifest, with drift enforced by `npm run check:generated`.
- [x] Add a searchable function index with old name, new name, category, runtime,
  mutation behavior, and direct import path.
- [x] Add recipes for common array/object/data/date workflows.
- [x] Document convenience namespace versus focused import bundle tradeoffs.
- [x] Add migration examples for `utils.val.*`, `utils.ao.*`, `utils.str.*`, and
  category-level wildcard imports.
- [x] Evaluate and commit generated `.d.ts` files from checked JavaScript, with a
  byte-for-byte drift check across 17 declaration files.
- [x] Add declaration tests proving default, named, namespace, and subpath imports.
- [x] Verify VS Code-compatible completion through the TypeScript 7 language
  service in JavaScript and TypeScript consumers.
- [x] Keep README concise and route detailed material into `docs/`.

## Phase 6 — compatibility and migration experience

- [x] Create a machine-readable legacy-to-modern alias manifest covering all 119
  Akashatools 1.0.2 named exports.
- [x] Add deprecation warnings only if they can be development-only, one-time,
  side-effect controlled, and bundle-removable; otherwise rely on JSDoc/docs.
- [x] Create compatibility fixtures that execute representative 1.x imports.
- [x] Decide whether stable 2.0 ships a dedicated `akashatools/legacy` namespace:
  no; retain only the existing archival `lib` paths without blessing a duplicate API.
- [x] Decide the removal release for `akashatools/lib/*` paths: no earlier than
  3.0, after consumer fixtures and explicit approval.
- [x] Write a migration guide with behavioral changes, not just renamed functions.
- [x] Consider a codemod only after the mapping stabilizes; defer it until real
  consumer fixtures prove which rewrites preserve intent.
- [ ] Never claim drop-in compatibility until fixtures from real consumers pass.

## Phase 7 — testing, security, and performance

### 7.1 Test architecture

- [x] Organize tests by public category and behavior contract. Each implemented
  public category owns a focused test file; cross-category invariants, namespace,
  exports, installed-package, and legacy compatibility remain explicit
  integration suites.
- [x] Add test factories for mutation checks and invalid-argument checks.
- [x] Add deterministic randomized/property-style invariant tests for paths, ranges, sorting,
  deduplication, and date conversions.
- [ ] Add regression tests for every source bug found during migration.
- [x] Add cross-realm/browser tests: Node VM realms cover Date, plain objects,
  Map, Set, and typed arrays; the real-browser fixture covers native Blob/File
  plus iframe-realm Map, Set, and typed arrays with a visible pass signal.
- [x] Add source-only coverage reporting with enforced aggregate floors of 95%
  lines, 80% branches, and 90% functions. The 2026-07-11 observed baseline after
  focused public-contract additions is 96.65% / 82.20% / 94.14%, respectively;
  branch accounting can vary slightly with random-source execution; see
  `docs/TESTING.md`.
- [ ] Run tests on supported Node LTS lines and target browsers. The six-test
  Chromium/Firefox/WebKit matrix passes locally; Node 22 and 24 LTS jobs are
  configured and await their first hosted workflow run before this is complete.

### 7.2 Security review

- [x] Threat-model nested paths and object merges for prototype pollution,
  accessor side effects, cycles, depth, and work limits.
- [x] Threat-model filesystem containment, symlink escape, and TOCTOU limits.
- [x] Threat-model HTTP redirects, secret leakage, decompression/body size, and
  unsafe parsing.
- [x] Review regex complexity and input size limits.
- [x] Review random helpers for misleading security claims.
- [x] Review HTML/text helpers for sanitization ambiguity.
- [x] Add a reproducible dependency/package-content prerelease audit and verify
  the current alpha has no reported dependency vulnerabilities.

### 7.3 Benchmarks and bundle size

- [ ] Establish representative small, medium, and large fixtures from source apps.
- [ ] Benchmark only competing implementations with identical semantics.
- [ ] Record Node version, warmup, iterations, variance, and memory where relevant.
- [ ] Avoid micro-optimizations that reduce readability without measured benefit.
- [x] Add bundle fixtures for named root, category named/namespace, default
  flat/category namespace, a simulated per-method export, and side-effect-only import.
- [x] Set measured esbuild 0.28.1 budgets: focused imports at 400 raw/300 gzip
  bytes and discoverable default-namespace imports at 45,000 raw/15,000 gzip.
- [x] Verify `sideEffects: false` remains truthful through source review and a
  zero-byte side-effect-only bundle contract.

## Phase 8 — packaging and automation

- [ ] Decide whether ESM-only remains appropriate after consumer fixture testing.
- [ ] If CommonJS is required, use generated dual outputs with identity/interop
  tests; do not hand-maintain duplicate sources.
- [x] Keep extensionless modern subpaths as the canonical spelling; extensioned
  `lib/*.js` paths exist only for explicitly temporary 1.x compatibility.
- [x] Evaluate explicit per-method subpaths such as `akashatools/chunk` using a
  real bundle simulation: it is byte-identical to named-root and category imports,
  so 2.0 will not add redundant per-method exports or separate npm packages.
- [x] Ensure export maps expose types, import targets, and environment targets
  consistently.
- [ ] Add reproducible scripts for type-check, lint/format, test, browser test,
  coverage, benchmarks, build if needed, and package verification. Everything
  except an agreed formatter/linter gate is now scripted.
- [x] Add CI for Node 22/24 LTS, source coverage, package smoke/content checks,
  and Chromium/Firefox/WebKit browser contracts. First hosted execution remains
  an evidence gate under Phase 7.
- [x] Add an API-surface snapshot so accidental exports fail CI.
- [x] Add an exports-resolution test generated from `package.json`.
- [x] Verify the installed tarball in a fresh JavaScript and TypeScript fixture.
- [ ] Add npm provenance/release automation only when publishing is authorized.

## Phase 9 — dogfood in real consumers

These projects are read-only references until the user explicitly authorizes
edits. When authorized, migrate one bounded area at a time.

- [ ] Create a Mindspace compatibility fixture for client/shared utilities.
- [ ] Create a Mindspace compatibility fixture for server utilities.
- [ ] Create a portfolio rebuild compatibility fixture.
- [ ] Create a COMPOSR compatibility fixture.
- [ ] Create a SPLICR algorithm-compatibility fixture for any ported
  provider-neutral text helpers.
- [ ] Measure bundle/runtime impact before and after focused imports.
- [ ] Record missing ergonomics discovered through real usage.
- [ ] Confirm no source app depended on swallowed errors, mutation, loose coercion,
  or environment globals accidentally.
- [ ] Feed validated improvements back into the canonical API before 2.0 RC.

## Phase 10 — release gates

### Alpha exit

- [ ] Complete the disposition ledger for all four source sets.
- [ ] Stabilize default/named/category namespace architecture.
- [ ] Cover the universal core with contract tests and JSDoc.
- [ ] Publish nothing until the user explicitly approves an alpha release.

### Beta exit

- [ ] Finish selected browser, Node, and HTTP surfaces.
- [ ] Pass all consumer compatibility fixtures.
- [ ] Freeze canonical names and option shapes except for critical corrections.
- [ ] Complete security review and initial performance/bundle baselines.
- [ ] Publish nothing until the user explicitly approves a beta release.

### Release candidate exit

- [ ] Complete API docs, migration guide, declarations, and package smoke tests.
- [ ] Resolve all known breaking-change questions.
- [ ] Confirm clean install and supported-runtime matrix.
- [ ] Confirm package contents, license, changelog, repository links, and version.
- [ ] Obtain explicit user approval before publishing an RC.

### Stable 2.0.0

- [ ] Tag the exact reviewed commit.
- [ ] Publish with provenance and two-factor protections where available.
- [ ] Verify the npm artifact and import examples after publication.
- [ ] Create follow-up issues/checklist items for deferred utilities and 1.x path
  removal; do not expand stable scope during release.

## Open decisions

- [x] Final default-import name in documentation: `akasha`, `utils`, or `_`.
  Recommendation: `akasha`; consumers can locally rename a default import.
- [x] Whether flat default properties and nested categories both ship in 2.0.
  Recommendation: yes, with automated collision detection.
- [x] Whether abbreviated namespaces remain outside a legacy-only surface.
  Recommendation: legacy-only with JSDoc migration guidance.
- [x] Whether per-method package subpaths materially improve bundles beyond named
  exports and category subpaths: no; the esbuild simulation is byte-identical at
  321 raw / 252 gzip bytes, so 2.0 will not add redundant per-method exports.
- [x] Whether generated declarations are needed beyond JSDoc for downstream IDEs:
  yes, expose deterministic conditional type targets generated from source.
- [ ] Whether ESM-only is acceptable for all active consumers.
- [ ] Which advanced date/timezone and schema helpers are truly generic.
- [ ] Whether HTTP retry and filesystem globbing justify dependencies.

## Decision log

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-07-11 | Preserve 1.0.2 in a baseline commit before modernization. | Provides an exact rollback and comparison point. |
| 2026-07-11 | Target Node.js 22+ and modern browsers for the 2.0 alpha. | Enables current platform APIs while targeting supported Node lines. |
| 2026-07-11 | Use named root exports plus category subpaths. | Supports tree-shaking, explicit dependencies, and readable grouping. |
| 2026-07-11 | Design a flat and categorized default namespace. | Restores dot-completion ergonomics without sacrificing focused imports. |
| 2026-07-11 | Do not add wrapper chaining to the 2.0 plan. | It adds substantial complexity without a demonstrated Akashatools use case. |
| 2026-07-11 | Keep per-method imports within one package if adopted. | Avoids duplicated internals and fragmented package maintenance. |
| 2026-07-11 | Do not add per-method subpaths in 2.0. | Pinned esbuild measurements show no byte savings over named-root or category imports, while extra paths would expand exports, declarations, docs, and maintenance. |
| 2026-07-11 | Keep app-domain utilities app-local by default. | A `utils` filename alone does not make behavior generic. |
| 2026-07-11 | Require explicit approval for npm publishing and consumer-project edits. | These actions affect external state beyond the library workspace. |
| 2026-07-11 | Use `akasha` as the canonical documented default import name. | It is distinctive, readable, and consumers remain free to rename a default import locally. |
| 2026-07-11 | Ship flat and categorized properties on one frozen default namespace. | Flat access is concise while categories preserve dot-completion discovery. |
| 2026-07-11 | Keep abbreviated namespaces on legacy-only surfaces. | Canonical full category names are clearer and avoid permanent duplicate APIs. |
| 2026-07-11 | Treat namespace collisions as test/build-time contract failures. | Silent overwrites are unsafe, while runtime scanning would add import work and hinder tree-shaking. |
| 2026-07-11 | Preserve legacy intent, not demonstrably broken legacy behavior. | Compatibility aliases must not perpetuate reference errors, hidden mutation, misleading return types, or swallowed failures. |
| 2026-07-11 | Classify source modules before migrating their exports. | Utility folders contain substantial domain and framework behavior; module location alone is not evidence of genericity. |
| 2026-07-11 | Reject global prototype extension modules. | Importing Akashatools must never patch built-in prototypes, install chains, log, or change global behavior. |
| 2026-07-11 | Keep schema-driven fixture generation app-local by default. | Network calls, custom model classes, database IDs, and domain schemas are not generic randomness primitives. |
| 2026-07-11 | Do not silently guess zoned local times across DST ambiguity. | Generic local-input conversion needs explicit gap/overlap and invalid-zone policy rather than locale-string offset heuristics. |
| 2026-07-11 | Keep language/product heuristics outside universal string helpers. | English filler words, sentiment labels, tags, categories, and dictation policy require an explicit optional surface. |
| 2026-07-11 | Never migrate utility-module writes to built-in prototypes. | Mindspace time modules patch `Date.prototype` during import; public package imports must remain inert and globally isolated. |
| 2026-07-11 | Treat Unix-second APIs as strict unit contracts. | Legacy Mindspace helpers named for seconds actually consumed and returned milliseconds, creating silent thousand-fold errors. |
| 2026-07-11 | Design the Node file surface from security contracts, not legacy wrappers. | Mindspace file helpers allow unrestricted paths, synchronous I/O, logging, undeclared dependencies, and false-success deletion; portfolio containment behavior must be compared first. |
| 2026-07-11 | Keep database, web-framework, socket, and authentication adapters outside universal categories. | Mongoose, Express, Socket.IO, JWT/cookie, and app session contracts are useful but not environment-neutral primitives. |
| 2026-07-11 | Keep filesystem containment on a Node-only surface. | Lexical and realpath containment are valuable, but importing Node modules cannot leak into universal entry points and path resolution alone does not authorize a later filesystem mutation. |
| 2026-07-11 | Separate lexical containment from existing realpath containment. | Pure resolution is useful for destination planning, while symlink-aware checks require existing paths and filesystem I/O; neither is permanent authorization against later path changes. |
| 2026-07-11 | Require provenance and license review for embedded third-party utility source. | Mindspace includes old global-style Markdown code and an unattributed large word list; location in a utility folder is not permission or evidence that copying is maintainable. |
| 2026-07-11 | Keep removal metadata out of `removeFromArray`. | Reviewed consumers only need the resulting array; a future `extractFromArray` can return values/indices without changing the established return type if demand appears. |
| 2026-07-11 | Keep the generic HTTP surface to one bounded, non-retrying Fetch attempt. | Transport parsing, cancellation, size limits, redaction, and typed errors are reusable; authentication, envelopes, SSRF policy, retries, and UI effects depend on the consuming application. |
| 2026-07-11 | Do not create `schema` or `debug` categories for 2.0. | Reviewed schemas are incompatible app/framework contracts, while diagnostics are unused console wrappers or active app/profiler coordinators; the generic JSON subset already belongs under `validation`. |
| 2026-07-11 | Generate migration lookup data without runtime deprecation warnings. | A deterministic manifest can distinguish replacements from merely related APIs without adding import-time logging, global warning state, or production bundle effects. |
| 2026-07-11 | Generate and commit declarations from strict JSDoc. | Explicit conditional type targets give TypeScript and editors deterministic subpath resolution, while source comments remain authoritative and drift is mechanically checked. |
| 2026-07-11 | Use extensionless canonical 2.0 subpaths. | `akashatools/array`-style imports are concise and stable; extensioned `lib/*.js` spellings remain solely to avoid prematurely breaking 1.x consumers. |
| 2026-07-11 | Retain only existing `lib` compatibility paths through 2.x. | A new `/legacy` namespace would duplicate and legitimize incoherent or broken 1.x behavior; removal waits for 3.0, real-consumer evidence, and explicit approval. |
| 2026-07-11 | Bound hostile nested-data work in canonical object helpers. | Blocking prototype names is insufficient if paths or mutually recursive merges can exhaust the stack; fixed path, depth, cycle, and object-pair limits provide deterministic failure. |

## Definition of done

Akashatools 2.0 is done when:

- every candidate in Akashatools and the four current consumer source sets has a
  recorded disposition;
- the canonical API is coherent, collision-free, documented, and discoverable;
- default, flat, named, category, and approved compatibility imports are tested;
- all public functions have strict types/JSDoc and behavioral tests;
- browser, Node, and shared entry points do not leak environment assumptions;
- security-sensitive utilities have threat-specific tests;
- performance claims are backed by repeatable benchmarks;
- real consumer fixtures pass without unexplained behavioral drift;
- the packed artifact passes clean-install JavaScript and TypeScript smoke tests;
- migration and API documentation are complete;
- the user reviews and explicitly authorizes publication.
