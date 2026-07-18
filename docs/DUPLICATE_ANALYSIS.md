# Cross-project duplicate analysis

This document groups reviewed candidates by behavior rather than filename or
export spelling. It covers Akashatools 1.0.2, the requested Mindspace utility
roots, the portfolio rebuild utility roots/shared contract, and COMPOSR's
`@composr/utilities` package as reviewed on 2026-07-11.

Detailed source defects and dispositions remain in `UTILITY_INVENTORY.md` and
`docs/inventory/*`. This matrix records the consolidation decision.

## Mindspace client/server matrix

### Time

The client and server time modules share 16 exact export names, with copied code
and some drift. The complete name-by-name matrix is in
[`MINDSPACE_TIME.md`](./inventory/MINDSPACE_TIME.md). Important semantic
conflicts are summarized here.

| Behavior | Source names | Conflict | Canonical direction |
| --- | --- | --- | --- |
| Date validity | client/server `isValidDate` | Same valid-`Date` behavior. | One `date.isValidDate`. |
| Unix conversion | server `dateToUnixSeconds`, `unixSecondsToDate` | Both names say seconds but use milliseconds; one also returns ISO text. | Strict `date.toUnixSeconds` and `date.fromUnixSeconds`; formatting stays separate. |
| Local date key | `getLocalDateKey`, `formatDate`, `formatDateYYYYMMDD`, `dateFormatYYYYMMDD`, `formatDateToString`, `convert`, `YYYY_MM_DD_Formatter` | Same intent under many names; padding, coercion, and input grammars differ. | `date.localDateKey` for Dates; explicit parsers for strings. |
| Same calendar day | `sameDay`, `isSameDay`, `isToday` | `sameDay` is UTC; `isSameDay` is local plus a DST-fragile 24-hour check. | `isSameLocalDay`/`isToday`; add `isSameUtcDay` only from real demand. |
| Month length | `getDaysInMonth`, `daysInMonth`, `d8.daysInMonth` | Date input versus 1-based numeric month versus monolith member. | `date.daysInMonth` with one documented overload contract. |
| Presentation | `_getFormattedTime`, `getPretty*`, `formatDateTime`, `formatDateTimezone`, `formatDateTimeInt` | Local/UTC mixing, implicit-now fallback, missing server helper, hard-coded locale. | `Intl`-backed `formatDate`/`formatDateTime` with explicit options. |
| Time zones | `getTZOffset`, `getTimezoneOffset`, zoned input converters, timezone list helpers | Locale-string offset estimation, silent fallbacks, stale DST caching, logging. | Deferred zoned-time design with explicit instant, zone, gap, and overlap policy. |
| Time text | `isValidTime24`, `parseClockTimeToMinutes`, `convert12to24`, `convert24to12` | Source parser accepts invalid ranges; 12-hour converter's regex/splitting disagree. | `clockTimeToMinutes`, `clock12To24`, `clock24To12`. |
| Date ranges/filters | three `filterByDate*` variants plus range selectors | Inclusive boundaries, broad coercion, logging, and duplicate concatenation vary. | Adopt strict instant-range normalization/predicate; filtering stays native composition. |
| Absolute instant ranges | reviewed date filter/comparison consumers | `date.normalizeInstantRange` plus start-inclusive/end-exclusive `isWithinInstantRange`; boundary overrides are independent booleans and reversed ranges throw. |
| Date toolkit | client/server `d8` | Copied monolith mixes unrelated operations and contains broken members. | Reject monolith; extract only independently specified primitives. |

### Validation

| Behavior | Client/server names | Conflict | Canonical direction |
| --- | --- | --- | --- |
| Email syntax | both `isValidEmail` | Client has more length/syntax checks; server is older. Neither proves ownership/deliverability. | `validation.isEmail` remains a pragmatic syntax helper; merge only tested improvements. |
| Phone validity | both `isValidPhoneNumber` | Client uses `libphonenumber-js` with US default; server uses regex/length approximation. | Explicit NANP helpers today; international API deferred with dependency/default-region contract. |
| Password policy/results | Mindspace configurable password validator, labels, messages, and strength classes | Keep application-owned. Akashatools makes no credential-security claim and has no second consumer establishing shared policy or result metadata. |
| Phone formatting | both `formatPhoneNumber` | Client library and server manual branches accept/format different sets. | `formatNanpPhone`; international formatting deferred. |
| Form error copy | both `getValidationErrorMessage` | Older/newer English UI copy, not validation behavior. | App-local presentation. |
| Array validity | client data/array helpers and server `isValidArray` | “Valid” can mean array, nonempty, first slot defined, or all values pass an umbrella predicate. | Native `Array.isArray`, `isNonEmptyArray`, or explicit `every(predicate)`. |
| Value validity | client `invalid`/`isInvalid`/`isValid`, server required helpers | Nullish, blank, empty, NaN, and falsy meanings drift; server drops zero/false. | Literal predicates (`isDefined`, `isBlank`, `isEmpty`, finite-number guards). |
| Runtime type guards | legacy `isNumber`/`isSafeInt`/`isMap`/`isSet`/`isFile`/`isBlob`/`isObjectArray` | Literal `validation` guards; Map/Set/Date support cross-realm brands, Blob/File use safe `globalThis` detection, and plain-object arrays require every item. |

### File and browser I/O

| Behavior | Sources | Conflict | Canonical direction |
| --- | --- | --- | --- |
| Remote JSON import | server/legacy `importFile`, client `readJSONFile`, HTTP wrappers | Server helper starts fetch but returns before settlement; client helper reads a browser `File`, not a URL. | Keep URL fetch and browser file reading as separate APIs; file read remains deferred. |
| Image URL check | server/legacy `checkImageURL` | Extension regex is not content, MIME, or even robust URL validation. | Reject generic validity claim; compose `URL` with explicitly named checks. |
| Browser download | client `downloadFile`, `downloadJSON`, `downloadJSONExport`, `downloadCSV`; COMPOSR downloads | Cleanup, extension, content type, serialization, and format policy differ. | `downloadBlob`, `downloadTextFile`, `downloadJson`; app CSV/envelopes compose those. |
| Server file write/delete | `saveFile`, `deleteFile` | Thin sync write versus unrestricted broken delete with false success. | Native APIs for basic use; safe helpers require Node-only atomicity/containment/error contracts. |
| Path containment | portfolio contained-path pair versus unrestricted server file paths | Lexical planning and realpath/symlink checking are distinct. | `akashatools/node` `resolveContainedPath` and `resolveExistingContainedPath`. |
| File discovery | server `findFilesByPattern` | Calls undeclared glob and defines no ordering/error/dependency contract. | Node-only `globPaths` delegates grammar to stable native globbing and adds deterministic deduplication and work bounds. |
| Node file mutation | legacy `saveFile`/`deleteFile`, portfolio storage services | Native `fs/promises` plus contained paths for current use; no generic helper claims atomicity until verified parent/symlink/durability/cleanup semantics exist. |

### Schema and data

| Behavior | Sources | Conflict | Canonical direction |
| --- | --- | --- | --- |
| Nested reads/writes | client `safeGet`, `getNestedValue`, four deep setters; server schema/path code; portfolio field paths | Inherited reads, truthiness short-circuits, mutation, and unsafe segments vary. | Secure own-property `getAtPath`/`hasAtPath`/`setAtPath`. |
| Key selection | client `filterKeys`/document cleaners, server `pick`, portfolio allow-list | Some names obscure select-versus-remove; unknown/unsafe-key policy differs. | `object.pick`, `object.omit`, and strict `object.pickAllowed`. |
| Deep merge | legacy/client/server variants | Mutating versus immutable, unsafe keys, and array semantics differ. | Current immutable plain-object `deepMerge`; richer semantics remain explicit future APIs. |
| Data/schema validation | client `validateField`/`validateData*`, server `sanitizePayloadAgainstSchema`, shared JSON contract | Custom import schema, Mongoose coercion, and JSON Schema subset are different languages. | Do not merge magically: keep Mongoose/app adapters local; expose documented JSON-contract subset only. |
| Schema description | server `parseSchema`, `parseSchema2`, `getSchemaInfo`, `getSchemaDefinition`, `processSchema`; client form-model generators | Multiple result shapes and framework/UI concepts under generic names. | App-local until one stable, framework-independent schema representation exists. |
| Object IDs | client `isObjectId`, server `isObjectIdValid`/`chkfxRequestID` | Hex shape versus Mongoose canonicalization/coercion and dependency. | Deferred explicitly named Mongo ObjectId surface if cross-project use justifies it. |
| Random fixtures | client data/schema/random modules | Primitive randomness, schema dispatch, network word fetch, custom model classes, and IDs are mixed. | Canonical primitive random functions only; fixtures remain app/schema owned. |

## Cross-project behavior groups

| Behavior group | Reviewed aliases/examples | Consolidation result |
| --- | --- | --- |
| Array normalization | `safeArray`, `isArrSafe`, `arrSafeTernary*` | `array.asArray`; reject boolean/array return ambiguity. |
| Array compaction | `cleanArray`, `clean`, legacy variants | `array.compact` removes nullish values only; other filtering uses predicates. |
| Flattening | legacy recursive helpers and native-style candidates | `array.flatten` with native depth/sparse semantics. |
| Counting and partitioning | Mindspace prototype `countBy`/`partition` | Standalone `array.countBy` returns an identity-safe `Map`; `array.partition` returns an ordered tuple. Both validate callbacks and propagate failures. |
| Array indexing and set/slice conveniences | legacy `arrayToEnum`/registry builders plus evaluated `difference`, `union`, `take`, and `drop` names | Repeated current registry construction now warrants `array.keyBy`, returning an identity-safe `Map` with explicit duplicate policy. Prefer native `Set`/`slice` and existing `unique`/`groupBy` for the remaining uncalled conveniences. |
| Sorted-array lookup | COMPOSR `lineAt` offset lookup and other ordered indexes | `array.lowerBound`, `upperBound`, and first-match `binarySearch` share a comparator core and preserve logarithmic comparisons; callers retain responsibility for sorting with the same comparator. |
| Random array selection | Mindspace prototype `sample` and feature-local Heatmap sampler | Deferred: neither implementation has an active caller, the feature helper uses biased random sorting, and the name does not establish single-item versus multi-item return behavior. |
| Reordering | `reorder`, `reorderArray`, move variants | Immutable `array.moveItem` with strict indices. |
| Removal | index/value/predicate legacy variants | One `removeFromArray` with explicit mode/options; metadata belongs in a separate future `extractFromArray` only if demanded. |
| Identity replacement/exclusion | COMPOSR `upsertById`/`excludeIds`, Mindspace bulk pending-scrap removal | Generic immutable `collection.upsertBy`/`excludeBy`; `Object.is`/`Set` compare derived keys, so numeric keys are never interpreted as array indices. Database updates remain app-owned. |
| Generic iterable transforms | Evaluated Set/Map/generator input across all requested consumers | Deferred: active call sites use arrays, and array indices/sparse slots/fresh array returns are intentional contracts. Collection-specific arguments remain explicitly typed. |
| Deep equality | Mindspace `obj.isDeepEqual` and a private client copy | Deferred to a dedicated dependency or future constrained contract. The copies are unused or unproven and omit cycles, prototypes, built-in collections, typed arrays, accessors, and symbols. |
| Deep traversal/search | `deepSearch`, `deepSearchItems`, `deepSearchByKey`, `findByKey`, `findByProperty`, `findByValue`, recursive contains helpers | `object.traverseObject` returns deterministic path-aware entries; `object.findDeep` stops at the first predicate match. Both are cycle-safe and bounded, skip accessors/symbols, and enter only arrays/plain objects. |
| Shallow object transforms | Evaluated `pickBy`, `omitBy`, `mapValues`, `mapKeys`, `invert`, and entry wrappers | No active named-wrapper calls were found; consumers compose `Object.entries`/`Object.fromEntries` with domain predicates. Retain `pick`/`omit` where keys are explicit and defer the rest. |
| Nested paths | many `deep*`, `safeGet`, portfolio field paths | Secure `object.parsePath`, `getAtPath`, `hasAtPath`, `setAtPath`. |
| Picking/allow-listing | server `pick`, portfolio `pickOwnAllowed`, legacy filters | `pick`, `omit`, `pickAllowed`; unsafe segments rejected. |
| Cloning | JSON clone helpers and COMPOSR/app copies | Native `structuredClone` through `object.deepClone`. |
| Stable sorting | prototype `sortBy`, Mindspace `sortBy`, portfolio numeric order, repeated hand-built locale tie-breakers | `sortBy`/`sortByMany` with selectors, direction, explicit null placement, reusable collators, and stable ties; legacy numeric-order coercion stays isolated. |
| Random values | legacy `rand`, color/data generators, portfolio data generator | Validated `randomInt`, `randomFloat`, `randomString`, `randomDate` with injected `[0,1)` source. |
| Secure identifiers/tokens | portfolio `createBasicUUID`, active consumer `crypto.randomUUID`, legacy pseudo-random strings | `random.secureRandomUuid` and bias-free `secureRandomString` require Web Crypto; `randomString` remains explicitly non-cryptographic. |
| Local dates/clocks | Akashatools/Mindspace/portfolio time copies | Small `date` primitives and `Intl`; ranges/zones/durations remain separate deferred designs. |
| Bounded async work | COMPOSR concurrency utilities | `async.mapSettledWithConcurrency` and `fulfilledValues`, preserving order/failures. |
| Browser downloads | COMPOSR and Mindspace variants | `browser.downloadBlob`, `downloadTextFile`, `downloadJson`; formats remain app compositions. |
| Safe filenames | COMPOSR `toSafeFilename`, Mindspace export sanitizer | `string.safeFilename` with Unicode normalization/options. |
| URL/path slugs | duplicated portfolio client/server `slugify` implementations | `string.slugify` with strict string input, ASCII/NFKD normalization, fallback, and length options. |
| JSON contracts | portfolio shared validator and Mindspace custom schemas | `validation.validateJsonContract`/`assertJsonContract` for documented subset only. |
| Node containment | portfolio storage paths versus unsafe legacy file helpers | Separate Node-only lexical and existing-realpath functions. |
| Debouncing | Mindspace fetch-local `debounce` | Deferred until sync/async result, context, cancel, flush, signal, and timing contracts are chosen. |
| HTTP requests | Akashatools legacy HTTP and Mindspace API coordinator | Adopted bounded `http.request` with typed errors, cancellation, parsing, and redaction; auth/store/toast/envelope/retry policy remains app-owned. |
| CSV | multiple Mindspace serializers/parsers | Reject naive implementations; evaluate a maintained grammar/dependency and formula-injection policy. |
| Numeric distribution summaries | COMPOSR transition percentile/statistics helper | Adopted strict finite-input `number.summarizeNumbers`; null statistics distinguish empty data from observed zero. |
| Security redaction/target checks | Mindspace error redaction and COMPOSR security package | Deferred threat-modeled security surface; HTTP transport must pin validated addresses and revalidate redirects. |
| Debugging | legacy/portfolio console helpers, Mindspace runtime diagnostics, COMPOSR profilers | No 2.0 `debug` category: console wrappers are rejected, active diagnostics are app coordinators, and COMPOSR owns profiler records; future operation-specific callbacks must be inert by default. |
| Prototype extensions | Mindspace prototype modules and time side effects | Rejected categorically; standalone functions only. |

## Canonical exports versus aliases

- Canonical 2.x functions live in `src/<category>.js`, appear as named root
  exports when environment-neutral, and appear on the frozen default namespace.
- Node-only functions are canonical under `akashatools/node` and intentionally
  are not flattened into the universal root.
- Deprecated convenience aliases currently retained are `upsertById` for
  `collection.upsertBy` and `excludeIds` for `collection.excludeBy`.
- The `akashatools/lib/*` modules are compatibility surfaces, not canonical
  implementations or names.
- Source-project spellings in the inventory are migration mappings, not automatic
  aliases. An alias is added only when a verified consumer requires it.
- A machine-readable alias manifest remains pending until canonical scope and
  consumer fixtures stabilize.

## Native replacements recorded

| Native/platform API | Replaces or underpins |
| --- | --- |
| `Array.isArray`, `every`, `some`, `find`, `flat`, `toSorted` | Thin/ambiguous array guards, searches, flattening, and mutating sort wrappers. |
| `Set` and `Map` | Deduplication, membership, grouping, settled registries, and identity lookup where contracts match. |
| `Object.hasOwn`, `Object.keys`, `Object.entries`, `Object.fromEntries` | Prototype calls/wrappers and safe own-key transforms. |
| `structuredClone` | JSON-based cloning that loses Dates, Maps, Sets, typed arrays, undefined, and cycles. |
| `String.prototype.replaceAll`, `padStart`, normalization | Literal replacement, padding, and filename normalization. |
| `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat` | Hand-built locale presentation and future relative-time formatting. |
| `URL` | URL syntax/hostname/protocol parsing before explicitly named policy checks. |
| Web Crypto | Security-sensitive randomness/IDs and any future reviewed encryption contract. |
| Node `path.resolve`/`relative` and `fs.realpath` | Lexical and existing symlink-aware containment on the Node-only surface. |

Native use is not automatic: Akashatools wraps a platform API only when the
wrapper adds a stable contract, validation, composition, or discoverability.
