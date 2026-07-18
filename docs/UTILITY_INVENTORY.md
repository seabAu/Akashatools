# Akashatools utility inventory and disposition ledger

This ledger is the authoritative migration record for utility candidates. Every
source export receives a disposition before Akashatools 2.0 reaches release
candidate status. The inventory describes behavior rather than assuming an old
name or implementation should survive.

Large source-set appendices provide full module classification and feed their
export-level dispositions back into this ledger:

- [Mindspace inventory](inventory/MINDSPACE.md)
- [2026-07-16 active-source refresh, including SPLICR](inventory/SOURCE_REFRESH_2026-07-16.md)

## Disposition vocabulary

- **Adopted** — a tested 2.x canonical implementation exists.
- **Native** — use a JavaScript/Web/Node API directly unless repeated consumer
  evidence justifies a clearer wrapper.
- **Merge** — the behavior is useful but must be combined into a smaller,
  explicitly specified 2.x API.
- **Defer** — potentially generic, but its contract or environment surface is not
  designed yet.
- **App-local** — behavior is presentation, framework, schema, or domain policy.
- **Reject** — misleading, broken, unsafe, or redundant behavior that should not
  become a canonical API.

Evidence values distinguish tested 2.x behavior from source-only observations.
Compatibility fixtures remain required before any legacy path is removed.

## Akashatools 1.0.2 — `lib/AO.js`

Runtime: universal JavaScript, but coupled through the circular legacy
`lib/index.js` namespace. Export count: 49.

| Legacy export | Behavior and finding | 2.x disposition | Evidence |
| --- | --- | --- | --- |
| `arrayToEnum` | Freezes an object mapping each array value to itself; property coercion and unsafe keys are unspecified. | Merge into a future safe `keyBy`/lookup builder only if consumers need it. | Source reviewed; parity pending. |
| `isOneOf` | Strict membership in an array. | Native `Array.prototype.includes`. | Source reviewed. |
| `uniqueArray` | Set-based first-occurrence deduplication after legacy array validation. | Adopted as `array.unique`. | 2.x array tests. |
| `mergeArray` | Concatenates two arrays and optionally deduplicates via a positional boolean. | Native spread/`concat`; merge deduplicated behavior into future `union`. | Source reviewed. |
| `replaceIfInvalid` | Replaces null, undefined, empty string, or exactly one space. | Adopted `validation.defaultIfBlank`; all whitespace-only strings now select the fallback. | Current consumer audit and 2.x validation tests. |
| `removeEmpty` | Removes null, undefined, and empty strings while retaining `0` and `false`. | Merge as an explicit predicate/filter recipe; `compact` remains nullish-only. | Source reviewed; behavior differs from 2.x `compact`. |
| `parseTextToArray` | Splits by one or multiple literal delimiters using a collision-prone sentinel. | Merge into a future `splitMany` with escaped alternation or deterministic scanning. | Source reviewed; sentinel can corrupt input. |
| `cleanJSON` | Recursively replaces scalar values with type defaults and keeps only the first array element. | Reject the misleading name; related explicit replacement is `data.initializeLike(value, { arrays: "sample" })`. | Defect/behavior proven from source; 2.x initialization tests. |
| `sanitizeObj` | Mutates recursively, calls an undefined `cleanInvalid`, and returns `forEach`'s `undefined`. | Reject. | Defect proven from source. |
| `sanitizeObjArray` | Maps through broken `sanitizeObj`, producing undefined entries. | Reject. | Defect proven from source. |
| `formatObjArray` | Mutates object entries and assumes every nested value has string methods. | App-local formatting or redesign as a mapper supplied by the caller. | Source reviewed; mutation/throw risk. |
| `cleanArray` | Removes every falsy value. | Native `array.filter(Boolean)`; do not conflate with nullish `compact`. | Source reviewed. |
| `removeKey` | Returns a shallow copy with one own key deleted. | Adopted as `object.omit` for one or many keys. | 2.x object tests. |
| `findOne` | Finds by property with optional case/substring matching, then returns either a property or the object. | Merge into separate `findBy`, text predicate, and property access operations; reject shape-changing return. | Source reviewed; contract redesign pending. |
| `findAll` | Filters by one exact property and optionally plucks another property. | Native `filter` plus `map`, or future `findAllBy` if usage supports it. | Source reviewed. |
| `objectFindByKey` | Linear property lookup returning either an object or `{ error: "Not found" }`. | Native `find`; reject sentinel return shape. | Source reviewed. |
| `splice` | Mutates every object in an array with `Object.assign`; name conflicts with array splice. | Reject; use immutable `map` plus object spread. | Source reviewed; mutation proven. |
| `flatten` | This-bound recursive array flattening that calls nonexistent `this.flatten` in normal module use. | Adopted strict `array.flatten`, delegating to native `flat` with documented depth and sparse-slot behavior. | Defect proven; 2.x flatten tests. |
| `flattenObj` | Mutates nullish values in the input and joins nested keys with underscores without collision protection. | Defer a safe path-aware record flattener. | Source reviewed; mutation/key collision risk. |
| `flattenObjArray` | Applies `flattenObj` with inconsistent nesting and return shapes. | Merge only after a canonical record-flatten contract exists. | Source reviewed. |
| `flatMapObjText` | Recursively concatenates object labels and values for display without separators. | App-local presentation. | Source reviewed. |
| `validateObject` | Intended to require keys, but `return false` inside `forEach` does not escape; most nonempty key lists pass. | Reject implementation; use `keys.every(key => Object.hasOwn(value, key))` or future `hasOwnKeys`. | Defect proven from source. |
| `validateObjectArray` | Filters objects through broken `validateObject`. | Reject implementation; reconsider as `filter` plus `hasOwnKeys`. | Defect inherited from source. |
| `hasKeys` | Named as a predicate but filters arrays and repeats ineffective `forEach` returns. | Reject; split predicate and filter behaviors. | Defect/name mismatch proven. |
| `extractKey` | Maps one property from each object. | Native `map`; possible documented `pluck` only if frequent use warrants it. | Source reviewed. |
| `extractKeyArray` | Duplicate property projection with additional legacy validation. | Merge with `extractKey`; prefer native `map`. | Source reviewed. |
| `extractKeys` | Maps each object to a selected-key object. | Compose `map` with adopted `object.pick`. | `pick` tested; composition fixture pending. |
| `getObjKeys` | Converts object keys into `{ key, value }` selector records. | App-local UI adapter. | Source reviewed. |
| `objValsToArray` | Returns enumerable own property values. | Native `Object.values`. | Source reviewed. |
| `arrayToObjArray` | Wraps every array value under a caller-provided property name. | Native `map`; unsafe property names would need protection in a wrapper. | Source reviewed. |
| `keySortData` | Returns a copied array sorted by a property and direction. | Adopted/generalized as `sort.sortBy`. | 2.x sort tests. |
| `filterKeys` | Builds an object from selected input keys. | Adopted as `object.pick`. | 2.x object tests. |
| `filterData` | Applies a custom array-of-filter-records query language with coercion and substring policy. | Defer or keep app-local until real query semantics are captured. | Source reviewed; no independent contract. |
| `filterDataFast` | Alternate filter engine with JSON stringification and different matching behavior. | Reject as a duplicate implementation; disposition behavior-by-behavior with `filterData`. | Source reviewed; semantic drift observed. |
| `has` | Recursively checks for a key, mixing arrays/objects and legacy validity rules. | Use `hasAtPath` for known paths or `findDeep` for bounded recursive key discovery. | Current consumer audit and 2.x path/traversal tests. |
| `hasAll` | Attempts recursive presence of all keys, with loop-return control-flow defects. | Reject implementation; compose the intended every-key policy explicitly with bounded `findDeep` calls. | Defect proven; current consumer audit and 2.x traversal tests. |
| `valContains` | JSON-stringifies values before substring comparison. | Adopted for actual strings as `string.includesText`; non-string search requires a separate explicit serializer/search API. | 2.x string tests. |
| `objContains` | Recursively searches object values but relies on returns inside `forEach`. | Merge into canonical traversal/search. | Source reviewed; control-flow risk. |
| `arrayContains` | Recursively searches array values with inconsistent object handling. | Merge into canonical traversal/search; primitive membership uses native `includes`. | Source reviewed. |
| `deepGetKey` | Recursively returns values associated with a matching key. | Compose `object.findDeep(value, ({ key }) => key === target)?.value`; missing results now use undefined. | Current consumer audit and 2.x bounded traversal tests. |
| `deepSearch` | Recursively searches a named key using a predicate and optionally returns a parent. | Compose `object.findDeep` and select its value or parent from the path-aware result. | Current consumer audit and 2.x bounded traversal tests. |
| `deepSearchItems` | Deep search variant that calls `this.deepSearchItems`, making module invocation fragile. | Reject implementation; merge behavior into canonical traversal. | Defect proven from source. |
| `deepFindSet` | Intended immutable deep update, but recursive `forEach` returns are discarded; generally only a root match survives. | Reject; use `setAtPath` for known paths and design predicate-based deep update separately. | Defect proven from source. |
| `cloneObj` | Recursive enumerable string-key clone that loses prototypes and special built-ins. | Adopted replacement `object.deepClone` using `structuredClone`. | 2.x clone tests. |
| `deepCopy` | Recursive `for...in` clone without cycles or built-in preservation. | Adopted replacement `object.deepClone`. | 2.x clone tests. |
| `deepCopyJSON` | JSON round-trip clone loses unsupported values/types and fails on cycles. | Adopted replacement `object.deepClone`; keep JSON round-trip only as explicit serialization. | 2.x clone tests. |
| `findAndSetObject` | Mutates every recursively found property with a matching key. | Defer a cycle-safe predicate update API; known paths use `setAtPath`. | Source reviewed; mutation proven. |
| `sortObject` | Creates a new object with enumerable string keys in lexical order. | Native `Object.fromEntries(Object.entries(value).sort(...))`; adopt only if consumer evidence warrants. | Source reviewed. |
| `sortObjArray` | Mutates input using numeric subtraction on a property. | Adopted immutable replacements `sortBy`/`sortByNumericOrder`. | 2.x sort tests. |

## Akashatools 1.0.2 — `lib/Val.js`

Runtime: nominally universal, but `isFile` and `isBlob` directly reference browser
globals. Export count: 30.

| Legacy export | Behavior and finding | 2.x disposition | Evidence |
| --- | --- | --- | --- |
| `valid` | References undeclared `variable` instead of `value`, throwing for defined input. | Reject; adopted literal predicate `validation.isDefined`. | Defect proven; 2.x predicate tested. |
| `isValid` | Changes meaning by type and optional positional boolean; treats several legitimate falsy values as invalid. | Reject umbrella predicate; use `isDefined`, `isBlank`, `isEmpty`, or a domain validator. | Source reviewed. |
| `validate` | Attempts nested truthiness checks, but returns inside `forEach` do not affect the result. | Reject; compose explicit predicates with `every`. | Defect proven from source. |
| `cleanInvalid` | Duplicate fallback logic for nullish, empty string, and one space. | Adopted `validation.defaultIfBlank`; all whitespace-only strings now select the fallback. | Current consumer audit and 2.x validation tests. |
| `isDefined` | Checks non-nullish values. | Adopted as `validation.isDefined`. | 2.x validation tests. |
| `isTruthy` | Means defined and not empty string rather than JavaScript truthiness. | Reject misleading name; use native Boolean, a literal check, or `!validation.isBlank` when whitespace is absent. | Current consumer audit and 2.x validation tests. |
| `isString` | Cross-realm string tag check. | Adopted primitive-only `validation.isString`; boxed String objects no longer pass. | Current consumer audit and 2.x validation tests. |
| `isNumber` | Checks `typeof value === "number"`, including `NaN` and infinities. | Adopted primitive `validation.isNumber`; use `validation.isFiniteNumber` when arithmetic requires a finite value. | Current consumer audit and 2.x type-guard tests. |
| `isNum` | Exact duplicate of `isNumber`. | Reject duplicate legacy spelling; migrate to `validation.isNumber`. | Current consumer audit and 2.x type-guard tests. |
| `isInt` | Integer check via modulo. | Native `Number.isInteger`; possible canonical type guard. | Source reviewed. |
| `isSafeInt` | Safe integer check with redundant number test. | Adopted as explicit `validation.isSafeInteger`; native `Number.isSafeInteger` remains equally valid inline. | 2.x type-guard tests. |
| `isFloat` | Defines float as any number that is not an integer, including problematic values. | Adopted explicit `validation.isFiniteNonInteger`; non-finite values no longer pass. | Current consumer audit and 2.x type-guard tests. |
| `isBool` | Checks exact true or false. | Adopted clearly named primitive `validation.isBoolean`. | Current consumer audit and 2.x type-guard tests. |
| `isBlank` | References `this.length`/`this.trim()` in an arrow function and can throw. | Adopted replacement `validation.isBlank` with literal nullish/whitespace semantics. | Defect proven; 2.x tests. |
| `escapeHtml` | Escapes five text-significant HTML characters. | Adopted under `string.escapeHtml`, documented as escaping rather than sanitization. | 2.x string tests. |
| `isJSONRegex` | This-bound prototype-style function calls nonexistent `blank()` and uses a regex approximation. | Reject. | Defect proven from source. |
| `isJSON` | Parses undeclared `str` instead of the argument and rejects valid scalar intent ambiguously. | Adopted replacement `validation.isJson`, accepting all valid JSON text. | Defect proven; 2.x tests. |
| `isMap` | `instanceof Map` predicate. | Adopted as `validation.isMap` with a cross-realm brand check. | 2.x cross-realm tests. |
| `isSet` | `instanceof Set` predicate. | Adopted as `validation.isSet` with a cross-realm brand check. | 2.x cross-realm tests. |
| `isFile` | Uses `'File' in window` and direct `File`, throwing outside browsers. | Adopted as `validation.isFile` using safe `globalThis.File` detection. | 2.x universal-runtime tests. |
| `isBlob` | Uses `'Blob' in window` and direct `Blob`, throwing outside browsers. | Adopted as `validation.isBlob` using safe `globalThis.Blob` detection. | 2.x universal-runtime tests. |
| `isObject` | Any defined non-array object, including Dates, Maps, and class instances. | Adopted exact-shape `validation.isNonArrayObject`; use `object.isPlainObject` when prototypes matter. | Current consumer audit and 2.x validation/plain-object tests. |
| `isArray` | Null-safe array predicate. | Adopted discoverable `validation.isArray`; native `Array.isArray` remains equally valid inline. | Current consumer audit and 2.x cross-realm tests. |
| `isValidArray` | Rejects empty arrays and arrays whose first item is undefined even when length checking is disabled. | Adopted clear predicate `array.isNonEmptyArray`; use `Array.isArray` when emptiness is allowed. | 2.x array tests. |
| `arrayContainsObjects` | Returns true for any `typeof "object"` item, including null and arrays. | Merge into explicit `some(isPlainObject)` or `every(isPlainObject)` recipes. | Source reviewed. |
| `isObjectArray` | Means an array containing at least one object-like item, not an array entirely of objects. | Reject ambiguous semantics; adopted `validation.isPlainObjectArray`, which requires every item to be a plain object and explicitly accepts an empty array. | 2.x type-guard tests. |
| `isAO` | Uses `instanceof Array/Object`, with cross-realm and semantic ambiguity. | Reject abbreviation; compose `validation.isArray` and `validation.isNonArrayObject` explicitly. | Current consumer audit and 2.x cross-realm tests. |
| `getType` | Returns custom strings and infers array type from only the first element. | Split into atomic `validation.typeOf`, `data.normalizeDataType`, and full-slot `data.analyzeArrayTypes`. | 2.x type/data tests. |
| `getFieldType` | Maps runtime values to HTML/form control concepts. | Merge into pending pure `input` inference; keep component/layout/schema policy app-local. | Active-call-site regression review. |
| `getArrayType` | Walks array elements to report a custom homogeneous/mixed type string. | Adopted structured replacement `data.analyzeArrayTypes`. | Full-slot, sparse, heterogeneous, and frozen-result tests. |

## Akashatools 1.0.2 — `lib/Time.js`

Runtime: universal Date/Intl. Export count: 14.

| Legacy export | Behavior and finding | 2.x disposition | Evidence |
| --- | --- | --- | --- |
| `convertDate` | Hard-coded English abbreviated weekday and full month display. | Merge into adopted `date.formatDate` with explicit `Intl` options. | 2.x date formatting tested at API level. |
| `sec2str` | Formats seconds with inconsistent omitted units and mixed suffix/colon output. | Defer a duration formatter with a stable grammar. | Source reviewed. |
| `elapsed` | Returns `(finish - start) / 1000`, despite docs calling inputs seconds. | Merge into a named duration/difference helper with unit-explicit inputs. | Source reviewed; unit mismatch. |
| `timeElapsed` | References undeclared `finishg`. | Reject implementation; future composition of elapsed duration and formatter. | Defect proven. |
| `estimate` | Documentation promises seconds but implementation returns `sec2str` and estimates total duration rather than remaining duration. | Reject signature; design `estimateRemaining` explicitly. | Defect/contract mismatch proven. |
| `timeEstimate` | Omits `return` and passes the already formatted estimate back to `sec2str`. | Reject. | Defect proven. |
| `dateStr2LocaleDateStr` | Parses English `Month Year`/`Present` and returns a locale-formatted string despite the name implying a Date. | App-local portfolio/resume presentation or redesign as explicit parser. | Source reviewed. |
| `generateDateOptions` | Produces reverse chronological `{ key, value }` records for an HTML selector. | App-local UI adapter. | Source reviewed. |
| `convertTimestampToYYYYMMDDDD` | Produces unpadded local `YYYY-M-D`; name contains duplicated `DD`. | Merge into adopted `date.localDateKey`. | 2.x date-key tests. |
| `convertYYYYMMDDDDtoTimestamp` | Calls `new Date(date.split("-"))`, relying on array string coercion and host parsing. | Reject; use explicit local-date parsing when designed. | Source reviewed; parsing ambiguity. |
| `formatDate` | Locale date formatting with a null fallback. | Adopted stricter `date.formatDate`. | 2.x date tests. |
| `formatDateDMY` | Formats a Date as local `DD/MM/YYYY`. | Merge as a documented formatter preset rather than duplicate implementation. | Source reviewed. |
| `formatDateDDMMYYYY` | Duplicate `formatDateDMY`. | Reject duplicate; same future preset. | Source reviewed. |
| `formatTimestampDDMMYYYY` | Name/docs say DD/MM/YYYY, implementation returns local `YYYY-MM-DD`. | Reject misleading alias; adopted `localDateKey` covers actual output. | Defect proven; 2.x date-key tests. |

## Akashatools 1.0.2 — `lib/String.js`

Runtime: universal, but circularly imports the complete legacy namespace. Export
count: 6.

| Legacy export | Behavior and finding | 2.x disposition | Evidence |
| --- | --- | --- | --- |
| `toCapitalCase` | Uppercases the first UTF-16 code unit. | Adopted Unicode-aware `string.capitalize`. | 2.x non-ASCII test. |
| `toKebabCase` | Inserts a hyphen before every uppercase letter; does not normalize spaces/acronyms. | Adopted generalized `string.kebabCase`. | 2.x string tests. |
| `toUpperCamelCase` | Converts hyphenated lowercase segments only. | Adopted generalized `string.pascalCase`. | 2.x string tests. |
| `subStringSearch` | Literal substring search with optional case sensitivity. | Adopted `string.includesText` with a named option. | 2.x string tests. |
| `replaceMultiple` | Treats replacement keys as raw regular expressions. | Adopted safe literal `string.replaceMany`; explicit regex behavior uses `string.replaceRegex` with a cloned caller RegExp. | 2.x literal/regex contract tests. |
| `getLongest` | Returns maximum string length across array values, object keys, or a scalar. | Adopted `string.longestStringLength`. | Function implemented; focused test expansion pending. |

## Akashatools 1.0.2 — `lib/Math.js`

Runtime: universal math. Export count: 9.

| Legacy export | Behavior and finding | 2.x disposition | Evidence |
| --- | --- | --- | --- |
| `clamp` | Clamps without validating finite values or bound order. | Adopted strict `number.clamp`. | 2.x number tests. |
| `wrap` | Modulo wrap over a half-open range. | Adopted strict `number.wrap`. | 2.x number tests. |
| `round` | Decimal exponent-string rounding. | Adopted as `number.roundTo` with precision bounds. | 2.x number tests. |
| `add` | Sums values from zero without validation. | Adopted strict `number.sum`. | 2.x number tests. |
| `sub` | Negates the sum of all inputs rather than subtracting subsequent inputs from the first. | Reject as a likely defect; canonical `number.subtract(first, ...rest)` is explicit. | Source reviewed; 2.x subtract implemented. |
| `distance` | Absolute distance between two numbers. | Adopted strict `number.distance`. | 2.x implementation; direct test expansion pending. |
| `distance2` | Euclidean distance between `{ x, y }` objects. | Merge object-coordinate compatibility into or alongside adopted tuple-based `distance2d` only if consumers require it. | 2.x tuple test; legacy fixture pending. |
| `boolRand` | Documentation promises boolean, implementation returns `1` or `-1`. | Split into adopted `randomBoolean` and future explicit `randomSign`. | Defect proven; boolean helper tested. |
| `decToBinary` | Recursive numeric-digit representation with bitwise truncation limits. | Adopted `number.toBinary`, returning a string. | 2.x number tests. |

## Akashatools 1.0.2 — `lib/Rand.js`

Runtime: `Math.random`; never cryptographically secure. Export count: 2.

| Legacy export | Behavior and finding | 2.x disposition | Evidence |
| --- | --- | --- | --- |
| `rand` | Random float with unusual `(max, min)` parameter order. | Adopted `random.randomFloat(minimum, maximum, random)`, with a breaking argument-order correction. | Deterministic 2.x random tests. |
| `randString` | Random string from a character set; JSDoc was copied from integer random behavior. | Adopted `random.randomString` with security warning and injectable source. | Deterministic 2.x random tests. |

## Akashatools 1.0.2 — `lib/Http.js`

Runtime: Fetch, AbortController, and timers; coupled to legacy validation. Export
count: 6. All behavior feeds the future `http` design, but none is safe as a
canonical compatibility implementation.

| Legacy export | Behavior and finding | 2.x disposition | Evidence |
| --- | --- | --- | --- |
| `handleBasicFetch` | Redundant Promise wrapper, always parses JSON, and never checks `response.ok`. | Reject implementation; adopted `http.request` checks status and exposes explicit parsing. | Source reviewed; 2.x local-server tests. |
| `fetchData` | Callback API, sends JSON bodies for GET, logs/swallow errors, and returns no request promise. | Reject; compose adopted `http.request` with an application callback only where needed. | Source reviewed; error swallowing proven; 2.x HTTP tests. |
| `constructFetchError` | Returns a record containing methods and a live response, making serialization incomplete and unstable. | Replace with a typed `HttpError` data contract. | Source reviewed. |
| `handleFetchResponse` | Sometimes returns a JSON Promise and otherwise throws JSON-stringified pseudo-errors. | Reject; adopted `http.request` provides explicit status/body parsing and `HttpError`. | Source reviewed; 2.x HTTP tests. |
| `parseError` | Parses stringified errors through broken legacy `isJSON`. | Reject; preserve adopted `HttpError` instances and causes instead. | Dependency defect proven; 2.x typed-error tests. |
| `handleFetch` | Forces GET, delays requests, mixes caller/internal signals, clears timeout before fetch settles, and converts final rejection into a resolved parsed value. | Reject; adopted `http.request` composes caller cancellation and timeout without delays or automatic retries. | Multiple defects proven; 2.x timeout/abort tests. |

## Akashatools 1.0.2 — `lib/File.js`

Runtime: Fetch/URL syntax, despite the category name suggesting filesystem I/O.
Export count: 2.

| Legacy export | Behavior and finding | 2.x disposition | Evidence |
| --- | --- | --- | --- |
| `importFile` | Starts an asynchronous fetch but returns before `data` can be assigned. | Reject; use adopted `http.request` for URLs or a separate browser `File` reader for local files. | Defect proven; 2.x HTTP tests. |
| `checkImageURL` | Regex checks an HTTP(S) URL suffix only; misses query strings and says nothing about content. | Reject misleading validation claim; future helper must be named extension/syntax check or inspect media metadata. | Source reviewed. |

## Akashatools 1.0.2 — `lib/Debug.js`

Runtime: console and legacy namespace formatting. Export count: 1.

| Legacy export | Behavior and finding | 2.x disposition | Evidence |
| --- | --- | --- | --- |
| `debug` | Formats and conditionally writes diagnostic values to the console. | Reject generic helper and omit a 2.0 `debug` category; diagnostics stay operation/app-specific and inert by default. | Source reviewed; the portfolio copy is imported once but has no live call, while active Mindspace/COMPOSR diagnostics are app-owned coordinators/profilers. |

## Legacy inventory coverage

| File | Exports recorded | Status |
| --- | ---: | --- |
| `AO.js` | 49 | Complete source review and preliminary disposition. |
| `Val.js` | 30 | Complete source review and preliminary disposition. |
| `Time.js` | 14 | Complete source review and preliminary disposition. |
| `String.js` | 6 | Complete source review and preliminary disposition. |
| `Math.js` | 9 | Complete source review and preliminary disposition. |
| `Rand.js` | 2 | Complete source review and preliminary disposition. |
| `Http.js` | 6 | Complete source review and preliminary disposition. |
| `File.js` | 2 | Complete source review and preliminary disposition. |
| `Debug.js` | 1 | Complete source review and preliminary disposition. |
| **Total** | **119** | **Every 1.0.2 named export recorded.** |

## COMPOSR — `app/packages/utilities`

Runtime: TypeScript ESM. The package declares `@composr/contracts` because its
profiler helpers use application-owned records; the remaining primitives are
dependency-free. Public surface: 9 runtime functions and 2 exported interfaces.

| COMPOSR export | Behavior and finding | Akashatools disposition | Evidence |
| --- | --- | --- | --- |
| `mapSettledWithConcurrency` | Maps with a worker ceiling, preserves input order, and retains every failure as a settled result. | Adopted with stricter safe-integer validation and JSDoc generics. | Akashatools bounded-concurrency/order/failure test. |
| `fulfilledValues` | Projects fulfilled values from settled results in input order. | Adopted unchanged in principle with runtime argument validation. | Akashatools async test. |
| `toSafeFilename` | Lowercases ASCII text, replaces non-alphanumerics with hyphens, and bounds code-unit length. | Adopted as `string.safeFilename`, adding Unicode normalization, trailing-hyphen cleanup, and named options. | Akashatools string test. |
| `downloadBlob` | Creates an object URL, clicks an anchor, and revokes the URL in `finally`. | Adopted as `browser.downloadBlob` with an injectable environment, synchronous anchor cleanup, deferred successful revocation, and immediate failure cleanup. | Injected unit tests and real-browser fixture pass. |
| `downloadTextFile` | Creates a Blob and delegates download; default content type is JSON despite accepting arbitrary text. | Adopted with `text/plain` default and named options; JSON has a separate `downloadJson`. | Injected Blob/content tests and real-browser fixture pass. |
| `upsertById` | Immutably prepends or replaces an object by string `id`. | Adopted as generic `collection.upsertBy`; retained as a deprecated convenience alias. | Akashatools collection tests. |
| `excludeIds` | Immutably filters objects whose string IDs occur in a Set. | Adopted as generic `collection.excludeBy`; retained as a deprecated convenience alias. | Akashatools collection tests. |
| `loadProfilerRunHistory` | Calls a COMPOSR API and clamps its tool-history limit to 1–500. | App-local; limit and API semantics belong to COMPOSR. | Source and COMPOSR test reviewed. |
| `buildProfilerResultBundle` | Loads COMPOSR profiler envelopes with bounded concurrency and constructs a versioned COMPOSR export bundle. | App-local; its reusable concurrency primitives are already adopted. | Source and COMPOSR bundle test reviewed. |
| `ProfilerRunHistoryApi` | Interface describing two COMPOSR profiler API methods and contract-owned records. | App-local type. | Imports `RunRecord`/`ProfilerResultExportEnvelope`. |
| `ProfilerResultBundle` | Interface for the versioned COMPOSR profiler export format. | App-local type. | Format/tool contract reviewed. |

COMPOSR package coverage is complete: every entry re-exported by
`@composr/utilities/src/index.ts` is recorded. Utility-like primitives outside
that package remain a separate audit item because they span application packages
with their own contracts.

## Remaining source sets

- [x] Mindspace generic client utilities; see `docs/inventory/MINDSPACE.md` and
  its linked behavior ledgers.
- [x] Mindspace generic server utilities; see `docs/inventory/MINDSPACE_TIME.md`
  and `docs/inventory/MINDSPACE_SERVER.md`.
- [x] Mindspace active utility modules classified by portability/environment.
- [x] Mindspace universal core exports reviewed: arrays, objects, strings, math,
  sorting, and client/server validation (66 exports).
- [x] Mindspace data/schema/random/error-validation cluster reviewed (58 exports).
- [x] Mindspace date-selection/timestamp-adapter cluster reviewed (29 exports).
- [x] Mindspace color/local-text/speech-cleanup cluster reviewed (24 exports).
- [x] Portfolio rebuild client/server/shared utilities; all 120 runtime exports
  are dispositioned in `docs/inventory/PORTFOLIO.md`.
- [x] COMPOSR `app/packages/utilities` public surface.
- [x] COMPOSR utility-like cross-package primitives; see
  `docs/inventory/COMPOSR_CROSS_PACKAGE.md`.
- [x] Cross-project behavior-group and duplicate matrix; see
  `docs/DUPLICATE_ANALYSIS.md`.
- [ ] Machine-readable legacy-to-modern alias manifest after canonical names settle.
