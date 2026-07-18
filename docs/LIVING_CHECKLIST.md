# Akashatools 2026 living checklist

> Status: active project plan; the 2026-07-18 regression expansion reopened the
> previously completed local release-candidate evidence. Update this document in
> the same commit as each meaningful implementation batch. Check an item only when its acceptance
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

The intended experience supports four complementary import styles:

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

// Granular subpath: one explicit generated method endpoint.
import chunkMethod from "akashatools/array/chunk";
```

The default namespace remains a plain, frozen utility object. The 2026-07-18
regression phase will add a separate, safe fluent deep-query wrapper because a
concrete discovery/use case now exists. Normal imports will not mutate built-in
or `Object.prototype` behavior.

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
- [x] Preserve copied Akashatools 1.0.2 in baseline commit `3a245be`. Its tree
  `e63dcb763dc238023d48c1b85200731ce0a04da9` exactly matches public GitHub
  commit `c52129b78e20b3d61f0c9765213264ffcda5180d`.
- [x] Commit the first 2.0 alpha foundation in `3b0fe6c`.
- [x] Set the package to ESM and Node.js 22.17+, the stable native-glob floor.
- [x] Add named root exports and category subpath exports.
- [x] Retain legacy `akashatools/lib` entry points temporarily.
- [x] Add strict JSDoc checking through `jsconfig.json`.
- [x] Add dependency-free runtime tests; 122 tests passed at the 2026-07-16
  release-readiness snapshot. Recount after the reopened regression phase.
- [x] Verify root, category, and legacy imports.
- [x] Verify npm tarball contents with `npm pack --dry-run`: the 2026-07-16 alpha
  selects 86 files at approximately 240 kB packed and 901 kB unpacked.
- [x] Verify focused-import tree-shaking at the 2026-07-16 snapshot:
  esbuild 0.28.1 produces 321-byte raw/252-byte gzip focused bundles versus
  54,330 raw/17,101 gzip bytes for the complete flat namespace.
- [x] Inventory the main utility locations in Akashatools, Mindspace, the 2026
  portfolio rebuild, COMPOSR, and SPLICR. The 2026-07-16 delta refresh covers
  the changes made in all four consumer source trees after the first snapshot.

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
  `collection`, `data`, `date`, `hash`, `http`, `input`, `number`, `object`,
  `random`, `sort`, `string`, and `validation`; keep `function` reserved until
  its timer/receiver/cancellation contracts are adopted.
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
- [x] Capture source behavior tests for portable functions whose edge cases were
  unclear; rejected application behavior remains in its owning project.
- [x] Review feature-local helpers only when they express a reusable primitive;
  do not migrate code solely because its folder is named `utils` or `lib`.

### 2.3 Portfolio rebuild

- [x] Inventory all 120 runtime exports in `client/src/utilities`,
  `server/utilities`, and shared contracts.
- [x] Review field-path, own-property, stable-order, field-coercion, network, and
  contained-path utilities for generalized contracts.
- [x] Keep portfolio search, admin session, public snapshot, navigation, and
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
- [x] Choose one canonical implementation and contract per adopted behavior.
- [x] Record aliases separately from canonical exports.
- [x] Record native replacements such as `structuredClone`, `Object.hasOwn`,
  `Array.prototype.toSorted`, `Intl`, `Set`, `Map`, and `URL`.

### 2.6 Active-source refresh and SPLICR

- [x] Locate and preserve the current Mindspace, portfolio rebuild, COMPOSR, and
  SPLICR app trees as read-only source references.
- [x] Create a dated delta ledger at
  `docs/inventory/SOURCE_REFRESH_2026-07-16.md` so post-snapshot findings do not
  silently invalidate the original inventories.
- [x] Complete a symbol-level delta audit of changed and untracked utility-like
  modules in all four consumer apps.
- [x] Inventory SPLICR's provider-neutral text measurement, semantic chunking,
  preprocessing, planning, delivery, storage, and error-classification
  algorithms, including Python-to-JavaScript semantic differences.
- [x] Implement and verify the independently reusable candidates selected by the
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
  All 168 current public declarations are complete, with parameter/return prose,
  documented throws, and examples enforced by `npm run check:docs`.
- [x] Add `@since 2.0.0` and `@deprecated` consistently, enforced across all
  168 current public declarations by `npm run check:docs`.
- [x] Generate an API reference grouped by category from source comments or a
  single authoritative manifest, with drift enforced by `npm run check:generated`.
- [x] Add a searchable function index with old name, new name, category, runtime,
  mutation behavior, and direct import path.
- [x] Add recipes for common array/object/data/date workflows.
- [x] Document convenience namespace versus focused import bundle tradeoffs.
- [x] Add migration examples for `utils.val.*`, `utils.ao.*`, `utils.str.*`, and
  category-level wildcard imports.
- [x] Evaluate and commit generated `.d.ts` files from checked JavaScript, with a
  byte-for-byte drift check across 204 declaration files, including generated
  category and granular method targets.
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
- [x] Add regression tests for every portable source-defect family whose behavior
  migrated; rejected app/framework defects are recorded separately in
  `docs/SOURCE_REGRESSIONS.md` rather than copied into the package.
- [x] Add cross-realm/browser tests: Node VM realms cover Date, plain objects,
  Map, Set, and typed arrays; the real-browser fixture covers native Blob/File
  plus iframe-realm Map, Set, and typed arrays with a visible pass signal.
- [x] Add source-only coverage reporting with enforced aggregate floors of 95%
  lines, 80% branches, and 90% functions. The 2026-07-16 observed baseline after
  the active-source and live-usage additions is 97.61% / 86.32% / 96.19% on
  Node 22; Node 24 reports 86.21% branches with the same line/function values.
  Branch accounting varies slightly by runtime; see `docs/TESTING.md`.
- [x] Run the complete release audit locally on supported Node 22.18.0 and
  Node 24.18.0, and run all six Chromium/Firefox/WebKit browser contracts.
- [ ] Capture the first hosted Node 22/24 and browser workflow result. The jobs
  are configured, but local multi-runtime evidence cannot prove hosted setup,
  checkout, dependency installation, or runner behavior.

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

- [x] Establish deterministic small, medium, and large fixtures from source-app
  record IDs, natural labels, and multilingual document text.
- [x] Benchmark only competing implementations with identical semantics, with
  output equality asserted before timing.
- [x] Record Node/OS/CPU, warmups, samples, median, range, standard deviation,
  and exact proportional allocation where relevant.
- [x] Avoid micro-optimizations that reduce readability without measured benefit;
  measured decisions retain clear Set/Map/collator and allocation-free text paths.
- [x] Add bundle fixtures for named root, category named/namespace, default
  flat/category namespace, an actual granular method export, and side-effect-only import.
- [x] Set measured esbuild 0.28.1 budgets: focused imports remain at 400 raw/300
  gzip bytes; the reopened discoverable default namespace temporarily uses the
  100,000 raw/30,000 gzip expansion guardrail pending final recalibration.
- [x] Verify `sideEffects: false` remains truthful through source review and a
  zero-byte side-effect-only bundle contract.

## Phase 8 — packaging and automation

- [x] Decide whether ESM-only remains appropriate after consumer fixture testing:
  yes. Active JavaScript consumers are ESM or bundler-resolved ESNext, while
  SPLICR is Python and creates no CommonJS requirement.
- [x] CommonJS is not required by active consumers; therefore do not generate or
  hand-maintain duplicate outputs. Reopen identity/interop tests only if that
  decision changes.
- [x] Keep extensionless modern subpaths as the canonical spelling; extensioned
  `lib/*.js` paths exist only for explicitly temporary 1.x compatibility.
- [x] Evaluate per-method subpaths and implement the explicitly requested
  category/method form such as `akashatools/array/chunk`. Generated wrappers are
  byte-identical to named-root/category focused imports and remain inside this
  package; no separate method packages or duplicate implementations are created.
- [x] Ensure export maps expose types, import targets, and environment targets
  consistently.
- [x] Add reproducible scripts for type-check, lint/format, test, browser test,
  coverage, benchmarks, build if needed, and package verification. Everything
  is now scripted; maintained ESM uses pinned ESLint 10 and Prettier 3 gates.
- [x] Add CI for Node 22/24 LTS, source coverage, package smoke/content checks,
  and Chromium/Firefox/WebKit browser contracts. First hosted execution remains
  an evidence gate under Phase 7.
- [x] Pin ordinary CI actions to verified full commit identities, bound job
  runtimes, retain read-only permissions, parse its YAML in the format gate, and
  test those workflow invariants.
- [x] Add an API-surface snapshot so accidental exports fail CI.
- [x] Add an exports-resolution test generated from `package.json`.
- [x] Verify the installed tarball in a fresh JavaScript and TypeScript fixture.
- [x] Document a staged release runbook covering granular approval, exact
  candidate identity, hosted gates, npm trusted publishing/provenance, explicit
  dist-tags, registry-installed verification, and fix-forward recovery.
- [ ] Add npm provenance/release automation only when publishing is authorized.

## Phase 9 — dogfood in real consumers

These projects are read-only references until the user explicitly authorizes
edits. When authorized, migrate one bounded area at a time.

- [x] Create a Mindspace compatibility fixture for client/shared utilities.
- [x] Create a Mindspace compatibility fixture for server utilities.
- [x] Create a portfolio rebuild compatibility fixture.
- [x] Create a COMPOSR compatibility fixture.
- [x] Create a SPLICR algorithm-compatibility fixture for ported
  provider-neutral text helpers, including byte/word/cost limits and offsets.
- [x] Measure representative bundle/runtime impact before and after focused
  imports. Focused sets save 47,058-50,564 raw and 14,493-15,441 gzip bytes;
  their runtime contracts pass and imports remain side-effect free. Whole-app
  runtime profiling still belongs to an authorized consumer migration.
- [x] Record missing ergonomics discovered through real usage. The fixture pass
  retained thin application adapters; the later complete call-site audit added
  seven strict validation conveniences backed by 559 live legacy reads.
- [ ] Confirm no source app depended on swallowed errors, mutation, loose coercion,
  or environment globals accidentally. Static AST evidence now maps all 1,982
  parsed legacy member reads and identifies one undeclared `utils` global in a
  malformed `_unused` Mindspace file, but runtime intent still requires an
  authorized bounded migration.
- [x] Feed validated improvements back into the canonical API before 2.0 RC.
  The refresh contributed bounded single-flight loaders, deterministic JSON,
  text measurement/chunking, byte/duration/relative-time formatting, strict JSON
  cloning, response filenames, native glob discovery, strict type guards, and a
  blank-value fallback. The residual usage audit findings are native,
  application-owned, composition-only, or provably broken.

## Phase 9.5 — 2026-07-18 regression and utility-surface expansion

The user explicitly reopened scope after the earlier local release-readiness
snapshot. Overlapping utilities may remain when each has a documented semantic
distinction; the most atomic operation is the core and broader versions compose
or wrap it. See `docs/inventory/DATA_INPUT_REGRESSION_2026-07-18.md`.

- [x] Re-audit the Mindspace `data.js`, `input.js`, `array.js`, validation, and
  form-generator families at function and active-call-site level.
- [x] Separate runtime branding, descriptor normalization, full-array type
  analysis, fresh default construction, and recursive shape initialization.
- [x] Add the universal `data` category with tested `normalizeDataType`,
  `analyzeArrayTypes`, `defaultValueForType`, `defaultValueFor`, and
  `initializeLike` contracts.
- [x] Add pure input/control inference that composes the atomic data layer:
  type/value-to-native-input mapping, declared/runtime control classification,
  single field descriptors, and direct data-to-field descriptors without React,
  Mongoose, or application schemas.
- [x] Expand bounded deep query/search operations into an explicit `has` family
  that can return boolean, first match, value, parent, or all matches without
  changing return shape behind boolean flags. Predicate and exact-needle cores
  remain separate, with key/value/either matching and output bounds.
- [x] Add a side-effect-free `deepQuery(data).has(...)` fluent query wrapper for discoverable dot syntax.
  Normal imports must remain inert; direct arbitrary `value.has()` would require
  `Object.prototype` mutation and is not permitted on the default surface.
- [ ] Decide and test whether an explicit opt-in augmentation entry can safely
  provide non-enumerable, collision-checked `Array.prototype` conveniences with
  an uninstall path. Do not augment `Object.prototype`.
- [x] Add generated granular method subpaths beneath their category, such as
  `akashatools/array/chunk`, while keeping one package and one canonical function
  identity. Each category also has a generated index that fronts its canonical
  implementation; generated-source, identity, declaration, installed-package,
  and bundle-equivalence checks prevent drift.
- [x] Refresh the changed-source delta across Mindspace, portfolio rebuild,
  COMPOSR, and SPLICR after the 2026-07-16 snapshot. The dated 2026-07-18 ledger
  screens current dirty/untracked source and dispositions every new generic
  family without modifying a consumer.
- [ ] Review rejected/deferred families for useful atomic variants and add
  justified missing utilities in small, independently tested batches.
- [x] Generalize COMPOSR's origin concurrency governor into bounded global and
  keyed async limiters with per-key fairness, queued cancellation, live counts,
  queue-capacity rejection, and unconditional release after sync/async failure.
- [x] Add strict RFC 6901 JSON Pointer parsing and own-data-property reads with
  root/escape semantics, canonical array indices, absent-versus-undefined
  results, unsafe-token rejection, and no accessor invocation.
- [x] Replace unsafe object-backed array registries with identity-preserving
  `keyBy` Maps and extract lower/upper insertion bounds plus first-match binary
  search from COMPOSR's sorted-offset lookup, retaining logarithmic work.
- [x] Add strict bounded `Retry-After` interpretation in seconds with standard
  integer and HTTP-date forms, explicit fractional compatibility for current
  provider APIs, injectable time/caps, and no implicit request retries.
- [x] Add a universal hash category separating native SHA-256, fast non-security
  CRC-32, strict stable-JSON digests, and configurable deterministic JSON IDs;
  retain explicit byte/shape bounds and leave streaming/archive/trust policy out.
- [ ] Re-run API collision, types, editor completions, package smoke, bundle,
  coverage, Node 22/24, and browser regression gates after the expanded surface
  stabilizes. Replace the superseded release-readiness measurements.

Acceptance criteria:

- Similar names or capabilities coexist only when their behavior, return shape,
  or policy differs in a way documented by JSDoc and tests.
- Type/default/input functions preserve `0`, `false`, and empty-string semantics
  literally rather than selecting fallbacks through truthiness.
- Generic data/input operations do not absorb Mongoose, React, database-ID,
  product-schema, or form-layout policy.
- Every default returned for a mutable type is fresh unless an explicit caller
  factory chooses otherwise.
- All recursive work is cycle-aware, bounded, non-mutating, and safe around
  accessors, symbols, custom properties, and prototype-mutating keys.

## Phase 10 — release gates

### Alpha exit

- [x] Complete the disposition ledger for all four active consumer source sets,
  alongside the complete 1.0.2 legacy manifest.
- [x] Stabilize default/named/category namespace architecture.
- [ ] Reconfirm the expanded universal core with contract tests and JSDoc. The
  earlier 2026-07-16 snapshot had 134 documented declarations and 122 passing
  contract tests; the 2026-07-18 scope expansion supersedes those totals.
- [ ] Publish nothing until the user explicitly approves an alpha release.

### Beta exit

- [x] Finish selected browser, Node, and HTTP surfaces.
- [x] Pass all representative consumer compatibility fixtures.
- [ ] Re-freeze canonical names and option shapes after the regression expansion.
- [x] Complete security review and initial performance/bundle baselines.
- [ ] Publish nothing until the user explicitly approves a beta release.

### Release candidate exit

- [x] Complete API docs, migration guide, declarations, and package smoke tests.
- [ ] Resolve all newly reopened breaking-change questions recorded in this checklist and
  the decision documents.
- [x] Confirm clean install and the local supported-runtime matrix on Node
  22.18.0, Node 24.18.0, Chromium, Firefox, and WebKit. Hosted workflow evidence
  remains a separate open gate under Phase 7.
- [x] Confirm package contents, license, changelog, repository links, and current
  alpha version. See `docs/RELEASE_READINESS.md`; stable version promotion is
  still part of the authorized publication gate.
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
- [x] How generated per-method package subpaths should be exposed beneath each
  category: `akashatools/<category>/<method>`, with both named and default export
  identity, a wildcard export-map condition, generated declarations, and no
  separate npm packages.
- [x] Whether generated declarations are needed beyond JSDoc for downstream IDEs:
  yes, expose deterministic conditional type targets generated from source.
- [x] Whether ESM-only is acceptable for all active consumers: yes; retain ESM
  for 2.0 unless a future real consumer supplies contrary evidence.
- [x] Which advanced date/timezone and schema helpers are truly generic: adopt
  atomic data introspection/initialization and pure input inference, while
  keeping incompatible Mongoose, React, layout, and product schemas app-local;
  retain strict JSON contracts, Intl formatting, and explicit instant/local-date
  primitives while deferring ambiguous zoned-local conversion until the runtime
  floor supports a stable Temporal contract.
- [x] Whether HTTP retry and filesystem globbing justify dependencies: neither.
  Retry remains application policy; stable Node 22.17 native globbing underpins
  bounded `globPaths` without adding a dependency.

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
| 2026-07-16 | Raise only the full default-namespace bundle guardrail to 55,000 raw/18,000 gzip. | The source refresh intentionally expands the discoverable convenience namespace; focused imports remain 321 raw/252 gzip, while the new limit retains roughly 18% measured headroom for regression detection. |
| 2026-07-16 | Keep Akashatools 2.0 ESM-only after active-consumer fixture review. | Mindspace client/server, portfolio server, and COMPOSR declare ESM; portfolio web and COMPOSR TypeScript use ESNext bundler resolution; SPLICR is Python, so no active CommonJS requirement justifies a dual build. |
| 2026-07-16 | Raise the Node floor to 22.17 and adopt native glob path discovery. | `fsPromises.glob` is stable at that floor, resolving the broken Mindspace wrapper without a dependency; bounded deterministic discovery stays separate from containment and mutation authorization. |
| 2026-07-16 | Add only strict validation vocabulary justified by current call-site evidence. | The refreshed AST audit maps all 1,982 parsed legacy reads; seven literal predicates/default helpers address 559 reads without reviving ambiguous `valid` aliases. |
| 2026-07-16 | Treat the existing public repository and registry as the untouched 1.x release state. | Read-only checks show GitHub `main` still at 2024 commit `c52129b` with no workflows or Actions runs and npm `latest` still at 1.0.2; pushing 2.0 or obtaining hosted evidence therefore requires explicit approval. |
| 2026-07-16 | Verify the preserved 1.0.2 baseline by Git tree identity. | Local baseline `3a245be` and public release commit `c52129b` share tree `e63dcb7`, proving the rollback point is exact without rewriting either history. |
| 2026-07-16 | Prepare a trusted-publishing runbook without adding release automation or credentials. | A precise candidate, provenance, dist-tag, verification, and recovery procedure improves readiness while preserving the user's approval boundary for every external write. |
| 2026-07-16 | Pin hosted CI actions by full commit identity and enforce the workflow contract in tests. | Mutable major tags weaken reproducibility; ordinary CI needs only read access and must retain Node 22/24, coverage, package, and three-browser gates without silently broadening permissions. |
| 2026-07-18 | Reopen the local release-candidate evidence for a regression expansion. | The user explicitly requested another changed-source scan, deeper semantic preservation, additional utility design, granular imports, and dot-style ergonomics; earlier measurements remain historical evidence rather than current release gates. |
| 2026-07-18 | Keep meaningfully distinct variants around an atomic core. | Redundancy is harmful only when contracts are indistinguishable; runtime branding, descriptor normalization, array profiling, default creation, and recursive initialization answer separate questions and should compose rather than be collapsed. |
| 2026-07-18 | Add a universal `data` category but still reject a universal application-schema category. | Generic type/default/shape behavior is shared and dependency-free, while Mongoose adapters, custom IDs, layout metadata, React components, and product models remain incompatible application policy. |
| 2026-07-18 | Reopen generated granular subpaths as an ergonomics requirement. | Named and category imports already tree-shake, but explicit per-method paths make dependency intent and discovery more granular; they will remain subpaths of one package rather than separate packages. |
| 2026-07-18 | Generate category indexes and granular wrappers from canonical declarations. | All 168 current method paths re-export the canonical function identity with default and named forms; generation-drift, type-resolution, package-install, identity, and actual bundle checks prevent wrapper divergence. |
| 2026-07-18 | Provide dot-style deep queries without default prototype mutation. | A fluent wrapper can offer discoverable syntax safely; arbitrary `value.has()` requires global `Object.prototype` mutation, so normal package imports must never install it. |
| 2026-07-18 | Raise the temporary expanded default-namespace guardrail to 75,000 raw/24,000 gzip. | The first `data` batch measures 61,279 raw/19,058 gzip while every focused fixture remains 321/252 and side-effect-only remains zero bytes; the widened cap leaves room for the already approved input/query surface while still failing unbounded growth. Recalibrate to the stabilized measured surface before RC. |
| 2026-07-18 | Raise the temporary full-discovery guardrail to 100,000 raw/30,000 gzip after the Retry-After batch. | Strict support for all standard HTTP-date forms moved the complete namespace to 75,742 raw/22,873 gzip, 742 raw bytes over the prior expansion ceiling. Focused root/category/granular imports remain exactly 321/252 and side-effect-only remains zero; only the intentionally comprehensive namespace receives more headroom, and it must be recalibrated before RC. |
| 2026-07-18 | Treat the second source refresh as a delta, not a bulk copy. | Current dirty and untracked consumer source is evidence for atomic contracts, but thread archives, TTS providers, UI components, storage, and application policy remain with their owning projects; the dated ledger records every new family and the reusable implementation queue. |

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
