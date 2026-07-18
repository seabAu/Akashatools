# Akashatools API reference

> Generated from public source JSDoc by `npm run docs:api`. Edit the source
> comments, not this file. Run `npm run check:generated` to detect drift.

Every universal category is also available as a named root export and on the
frozen default `akasha` namespace. The paths below are the focused category
imports. Node-only utilities intentionally appear only under `akashatools/node`.

## array

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/array`

### asArray

Returns the input when it is an array, preserving its identity and sparse slots, or a fresh dense copy of the fallback otherwise.

- Signature: `asArray()`
- Import: `import { asArray } from "akashatools/array"`
- Granular import: `import asArray from "akashatools/array/asArray"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Original array value, or a fresh dense fallback copy.

Throws:
- `TypeError` — If fallback is not an array.

### isNonEmptyArray

Checks whether a value is an array containing at least one item.

- Signature: `isNonEmptyArray()`
- Import: `import { isNonEmptyArray } from "akashatools/array"`
- Granular import: `import isNonEmptyArray from "akashatools/array/isNonEmptyArray"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is T[]` — Whether value is an array with length greater than zero.

### compact

Removes nullish values from an array without removing `0`, `false`, or `""`. Sparse slots are treated as `undefined` and therefore removed.

- Signature: `compact()`
- Import: `import { compact } from "akashatools/array"`
- Granular import: `import compact from "akashatools/array/compact"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense copy containing every non-nullish value in order.

Throws:
- `TypeError` — If values is not an array.

### chunk

Splits an array into same-sized chunks. The final chunk may be shorter. Sparse slots are treated as `undefined` items and returned chunks are dense.

- Signature: `chunk()`
- Import: `import { chunk } from "akashatools/array"`
- Granular import: `import chunk from "akashatools/array/chunk"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[][]` — Ordered dense chunks; an empty input produces an empty array.

Throws:
- `TypeError` — If values is not an array.
- `RangeError` — If size is not a positive safe integer.

### unique

Returns the first item for each unique key, preserving input order. Sparse slots are treated as `undefined` items and the returned array is dense.

- Signature: `unique()`
- Import: `import { unique } from "akashatools/array"`
- Granular import: `import unique from "akashatools/array/unique"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense, ordered copy containing the first value for each SameValueZero key.

Throws:
- `TypeError` — If values is not an array or toKey is not a function.

### flatten

Flattens nested arrays to a requested depth without mutating the input. Semantics match `Array.prototype.flat`: `Infinity` flattens every level and sparse slots are removed at levels that are flattened.

- Signature: `flatten()`
- Import: `import { flatten } from "akashatools/array"`
- Granular import: `import flatten from "akashatools/array/flatten"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown[]` — Native-flat result with flattened sparse slots removed.

Throws:
- `TypeError` — If `values` is not an array or depth is not an integer.
- `RangeError` — If depth is negative or exceeds the safe-integer range.

### moveItem

Moves one item to another position without mutating the input. Sparse slots are treated as `undefined` items and the returned array is dense.

- Signature: `moveItem()`
- Import: `import { moveItem } from "akashatools/array"`
- Granular import: `import moveItem from "akashatools/array/moveItem"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense reordered copy, including when both indices are equal.

Throws:
- `TypeError` — If values is not an array.
- `RangeError` — If either index does not identify an existing item.

### insertItem

Inserts an item at a bounded index without mutating the input. Indices below zero insert at the start and indices beyond the length append. Sparse slots are treated as `undefined` items and the returned array is dense.

- Signature: `insertItem()`
- Import: `import { insertItem } from "akashatools/array"`
- Granular import: `import insertItem from "akashatools/array/insertItem"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense copy containing item at the bounded index.

Throws:
- `TypeError` — If values is not an array or index is not a safe integer.

### removeFromArray

Removes array items by index, value, or predicate. The input is never mutated. In `auto` mode a function is a predicate, an integer is an index, and every other selector is compared by `Object.is`. Use `mode: "value"` to remove a numeric value instead of treating it as an index. Sparse slots are treated as `undefined` items; predicates receive a dense copy of the input.

- Signature: `removeFromArray()`
- Import: `import { removeFromArray } from "akashatools/array"`
- Granular import: `import removeFromArray from "akashatools/array/removeFromArray"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense copy with the requested item or matches removed.

Throws:
- `TypeError` — If values, options, mode, all, or the selected selector contract is invalid.

### groupBy

Groups items in a Map, avoiding object-key coercion and prototype collisions. Sparse slots are treated as `undefined` items and group arrays are dense.

- Signature: `groupBy()`
- Import: `import { groupBy } from "akashatools/array"`
- Granular import: `import groupBy from "akashatools/array/groupBy"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Map<K, T[]>` — Insertion-ordered keys mapped to dense, ordered value arrays.

Throws:
- `TypeError` — If values is not an array or toKey is not a function.

### keyBy

Indexes items in a Map without coercing object, symbol, numeric, or string keys into property names. Sparse slots are treated as `undefined` items and the selector receives a dense input copy. Duplicate-key behavior is explicit. This is the identity-safe replacement for legacy `arrayToEnum` and object-backed registry builders. Use `groupBy` when every duplicate value should be retained rather than selecting one value per key.

- Signature: `keyBy()`
- Import: `import { keyBy } from "akashatools/array"`
- Granular import: `import keyBy from "akashatools/array/keyBy"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Map<K, T>` — Insertion-ordered identity-preserving key/value index.

Throws:
- `TypeError` — If values, toKey, options, or the duplicate policy is invalid.
- `RangeError` — If `onDuplicate` is `"error"` and a key repeats.

### countBy

Counts items by a derived key without coercing key identity.

- Signature: `countBy()`
- Import: `import { countBy } from "akashatools/array"`
- Granular import: `import countBy from "akashatools/array/countBy"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Map<unknown, number>` — Insertion-ordered SameValueZero key counts.

Throws:
- `TypeError` — If values is not an array or toKey is not a function.

### partition

Splits items into matching and non-matching arrays while preserving order. Sparse slots are treated as `undefined` items. Callback errors propagate.

- Signature: `partition()`
- Import: `import { partition } from "akashatools/array"`
- Granular import: `import partition from "akashatools/array/partition"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `[T[], T[]]` — Pair of dense arrays: matches first, non-matches second.

Throws:
- `TypeError` — If values is not an array or predicate is not a function.

### lowerBound

Finds the first insertion index at which `needle` can be placed without moving an equal value earlier. The input must already be sorted under the same comparator; ordering is intentionally not rescanned so work stays logarithmic. Sparse slots compare as `undefined` values.

- Signature: `lowerBound()`
- Import: `import { lowerBound } from "akashatools/array"`
- Granular import: `import lowerBound from "akashatools/array/lowerBound"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — First index whose value does not compare below the needle, in `[0, values.length]`.

Throws:
- `TypeError` — If values or compare is invalid, or compare returns a non-finite number.

### upperBound

Finds the first insertion index after every comparator-equal value. The input must already be sorted under the same comparator; ordering is not rescanned, preserving logarithmic work. Sparse slots compare as `undefined`.

- Signature: `upperBound()`
- Import: `import { upperBound } from "akashatools/array"`
- Granular import: `import upperBound from "akashatools/array/upperBound"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — First index whose value compares above the needle, in `[0, values.length]`.

Throws:
- `TypeError` — If values or compare is invalid, or compare returns a non-finite number.

### binarySearch

Returns the first comparator-equal item in a sorted array. Unlike `Array.prototype.findIndex`, this performs logarithmic comparisons. The input must already be sorted under the same comparator and is not mutated.

- Signature: `binarySearch()`
- Import: `import { binarySearch } from "akashatools/array"`
- Granular import: `import binarySearch from "akashatools/array/binarySearch"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — First equal index, or `-1` when absent.

Throws:
- `TypeError` — If values or compare is invalid, or compare returns a non-finite number.

### intersection

Returns unique values present in every input array. Sparse slots are treated as `undefined` items and the returned array is dense.

- Signature: `intersection()`
- Import: `import { intersection } from "akashatools/array"`
- Granular import: `import intersection from "akashatools/array/intersection"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense unique values from the first array present in every later array.

Throws:
- `TypeError` — If any argument is not an array.

### range

Creates an end-exclusive numeric range, like Python's `range`.

- Signature: `range()`
- Import: `import { range } from "akashatools/array"`
- Granular import: `import range from "akashatools/array/range"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number[]` — Arithmetic sequence containing at most one million values.

Throws:
- `TypeError` — If either bound is not a finite number.
- `RangeError` — If step is zero/non-finite or the result would exceed allocation limits.

### zip

Combines arrays by position, stopping at the shortest input. Sparse slots are read as `undefined` and every returned row is dense.

- Signature: `zip()`
- Import: `import { zip } from "akashatools/array"`
- Granular import: `import zip from "akashatools/array/zip"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown[][]` — Dense positional rows through the shortest input length.

Throws:
- `TypeError` — If any argument is not an array.

### shuffle

Returns a shuffled copy using Fisher-Yates. A random source can be injected for deterministic tests or seeded applications. Sparse slots are treated as `undefined` items and the returned array is dense.

- Signature: `shuffle()`
- Import: `import { shuffle } from "akashatools/array"`
- Granular import: `import shuffle from "akashatools/array/shuffle"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense Fisher-Yates shuffled copy.

Throws:
- `TypeError` — If values is not an array or random is not a function.
- `RangeError` — If random returns a value outside [0, 1) or a non-finite number.

## async

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/async`

### createSingleFlight

Coalesces concurrent loader calls and optionally caches an accepted result. Invalidation starts a new generation: an older in-flight request still settles for its callers but cannot repopulate the cache. Synchronous loader errors are exposed as Promise rejections.

- Signature: `createSingleFlight()`
- Import: `import { createSingleFlight } from "akashatools/async"`
- Granular import: `import createSingleFlight from "akashatools/async/createSingleFlight"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Readonly<{load: () => Promise<T>, invalidate: () => void}>` — Frozen controller with a shared load Promise and synchronous cache invalidation.

Throws:
- `TypeError` — If loader/options/callbacks are invalid or shouldCache does not return a boolean.
- `RangeError` — If ttl or a clock result is outside its documented range.

### createKeyedSingleFlight

Creates bounded per-key single-flight controllers. Entries use least-recently accessed eviction when maximumSize is reached. Evicting or invalidating an in-flight key does not cancel its Promise, but its result cannot enter the retained cache.

- Signature: `createKeyedSingleFlight()`
- Import: `import { createKeyedSingleFlight } from "akashatools/async"`
- Granular import: `import createKeyedSingleFlight from "akashatools/async/createKeyedSingleFlight"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Readonly<{load: (key: K) => Promise<V>, invalidate: (key: K) => boolean, invalidateAll: () => number, readonly size: number}>` — Frozen keyed controller; invalidation reports whether/count of retained entries removed.

Throws:
- `TypeError` — If loader/options/callbacks are invalid or shouldCache does not return a boolean.
- `RangeError` — If ttl, maximumSize, or a clock result is outside its documented range.

### createConcurrencyLimiter

Creates a reusable scheduler for independent operations submitted over time. At most `maximumConcurrency` callbacks run together and at most `maximumPending` callbacks wait in memory. A queued caller may abort without affecting work that has already started; pass the same signal into the operation itself when running work is also cancellable.

- Signature: `createConcurrencyLimiter()`
- Import: `import { createConcurrencyLimiter } from "akashatools/async"`
- Granular import: `import createConcurrencyLimiter from "akashatools/async/createConcurrencyLimiter"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Readonly<{run: <T>(operation: () => T | PromiseLike<T>, options?: {signal?: AbortSignal}) => Promise<T>, readonly activeCount: number, readonly pendingCount: number}>` — Frozen controller whose run method preserves each callback result or error and whose counts reflect live scheduler state.

Throws:
- `TypeError` — If options, an operation, or an AbortSignal is invalid.
- `RangeError` — If a concurrency/queue limit is invalid; a run Promise also rejects with RangeError when the pending queue is full.

### createKeyedConcurrencyLimiter

Creates a scheduler with both global and SameValueZero per-key concurrency ceilings. Work is selected in arrival order among entries whose key currently has capacity, so a saturated key cannot block unrelated keys. Queued aborts remove their listener and queue entry; callbacks already running settle normally and always release capacity after fulfillment or rejection.

- Signature: `createKeyedConcurrencyLimiter()`
- Import: `import { createKeyedConcurrencyLimiter } from "akashatools/async"`
- Granular import: `import createKeyedConcurrencyLimiter from "akashatools/async/createKeyedConcurrencyLimiter"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Readonly<{run: <K, T>(key: K, operation: () => T | PromiseLike<T>, options?: {signal?: AbortSignal}) => Promise<T>, activeFor: (key: unknown) => number, pendingFor: (key: unknown) => number, readonly activeCount: number, readonly pendingCount: number}>` — Frozen keyed controller with live global/per-key counts and Promise-preserving execution.

Throws:
- `TypeError` — If options, an operation, or an AbortSignal is invalid.
- `RangeError` — If a concurrency/queue limit is invalid; a run Promise also rejects with RangeError when the pending queue is full.

### mapSettledWithConcurrency

Maps values with a fixed concurrency ceiling. Results retain input order and individual failures are represented like `Promise.allSettled`.

- Signature: `mapSettledWithConcurrency()`
- Import: `import { mapSettledWithConcurrency } from "akashatools/async"`
- Granular import: `import mapSettledWithConcurrency from "akashatools/async/mapSettledWithConcurrency"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Promise<PromiseSettledResult<R>[]>` — Settled results in input order.

Throws:
- `TypeError` — If values is not an array or mapper is not a function.
- `RangeError` — If concurrency is not a positive safe integer.

### fulfilledValues

Extracts values from fulfilled settled results.

- Signature: `fulfilledValues()`
- Import: `import { fulfilledValues } from "akashatools/async"`
- Granular import: `import fulfilledValues from "akashatools/async/fulfilledValues"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Values from fulfilled entries only.

Throws:
- `TypeError` — If results is not an array.

### delay

Waits for a duration and optionally supports cancellation.

- Signature: `delay()`
- Import: `import { delay } from "akashatools/async"`
- Granular import: `import delay from "akashatools/async/delay"`
- Input mutation: Does not mutate inputs; schedules a timer.
- Since: 2.0.0
- Returns: `Promise<void>` — Promise fulfilled after the duration or rejected on cancellation.

Throws:
- `TypeError` — If signal does not implement the AbortSignal contract.
- `RangeError` — If milliseconds is outside the host timer range.

## browser

Runtime: Modern browser at effect time; safe to import universally.

Focused import: `akashatools/browser`

### downloadBlob

Triggers a browser download for a Blob. The temporary anchor is removed synchronously; object URL revocation is deferred to the next timer turn so the browser can consume the click. Click/scheduling failures revoke at once. Browser globals and the scheduler can be injected for testing.

- Signature: `downloadBlob()`
- Import: `import { downloadBlob } from "akashatools/browser"`
- Granular import: `import downloadBlob from "akashatools/browser/downloadBlob"`
- Input mutation: Does not mutate inputs; performs a browser download effect.
- Since: 2.0.0
- Returns: `void` — Performs the download effect synchronously and schedules URL cleanup.

Throws:
- `TypeError` — If filename, blob, or the injected scheduler is invalid.
- `Error` — If required document or object-URL capabilities are unavailable.

### downloadTextFile

Downloads string content as a file in a browser.

- Signature: `downloadTextFile()`
- Import: `import { downloadTextFile } from "akashatools/browser"`
- Granular import: `import downloadTextFile from "akashatools/browser/downloadTextFile"`
- Input mutation: Does not mutate inputs; performs a browser download effect.
- Since: 2.0.0
- Returns: `void` — Performs the download effect.

Throws:
- `TypeError` — If content or delegated Blob arguments are invalid.
- `Error` — If required browser capabilities are unavailable.

### downloadJson

Creates a safe filename and downloads JSON content.

- Signature: `downloadJson()`
- Import: `import { downloadJson } from "akashatools/browser"`
- Granular import: `import downloadJson from "akashatools/browser/downloadJson"`
- Input mutation: Does not mutate inputs; performs a browser download effect.
- Since: 2.0.0
- Returns: `void` — Performs a JSON download using a normalized safe filename.

Throws:
- `TypeError` — If JSON.stringify returns undefined or delegated arguments are invalid.
- `Error` — If serialization or required browser capabilities fail.

## collection

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/collection`

### upsertBy

Inserts or replaces a value by a derived identity, preserving immutability. Keys are compared with `Object.is`; numeric keys are never treated as indices. Sparse slots are treated as `undefined` items and returned arrays are dense.

- Signature: `upsertBy()`
- Import: `import { upsertBy } from "akashatools/collection"`
- Granular import: `import upsertBy from "akashatools/collection/upsertBy"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense copied array containing the upserted value.

Throws:
- `TypeError` — If values, toKey, or prepend does not match its contract.

### excludeBy

Excludes values whose derived identities occur in a Set. Numeric keys are never treated as indices. Sparse slots are treated as `undefined` items and returned arrays are dense.

- Signature: `excludeBy()`
- Import: `import { excludeBy } from "akashatools/collection"`
- Granular import: `import excludeBy from "akashatools/collection/excludeBy"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense copied array without excluded identities.

Throws:
- `TypeError` — If values, excluded, or toKey does not match its contract.

### upsertById

Inserts or replaces an object by its `id` property.

- Signature: `upsertById()`
- Import: `import { upsertById } from "akashatools/collection"`
- Granular import: `import upsertById from "akashatools/collection/upsertById"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Copied array containing the upserted object.
- Deprecated: Prefer `upsertBy` with an explicit key selector.

Throws:
- `TypeError` — If delegated upsert arguments are invalid.

### excludeIds

Excludes objects whose `id` properties occur in a Set.

- Signature: `excludeIds()`
- Import: `import { excludeIds } from "akashatools/collection"`
- Granular import: `import excludeIds from "akashatools/collection/excludeIds"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Copied array without objects carrying excluded ids.
- Deprecated: Prefer `excludeBy` with an explicit key selector.

Throws:
- `TypeError` — If delegated exclusion arguments are invalid.

## data

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/data`

### normalizeDataType

Normalizes a built-in constructor or common schema-style type name to the lowercase runtime vocabulary used by `typeOf`. Array descriptors such as `[String]`, `String[]`, and `array<object>` normalize to `array`; custom constructors normalize to `object` without being invoked.

- Signature: `normalizeDataType()`
- Import: `import { normalizeDataType } from "akashatools/data"`
- Granular import: `import normalizeDataType from "akashatools/data/normalizeDataType"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Canonical lowercase data type.

Throws:
- `TypeError` — If descriptor is neither a nonblank string nor a function.

### analyzeArrayTypes

Scans every slot in an array and reports its complete runtime type profile. Sparse slots are intentionally counted as `undefined`, making the result reflect indexed reads rather than only present properties.

- Signature: `analyzeArrayTypes()`
- Import: `import { analyzeArrayTypes } from "akashatools/data"`
- Granular import: `import analyzeArrayTypes from "akashatools/data/analyzeArrayTypes"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `{length: number, empty: boolean, homogeneous: boolean, primaryType: string | undefined, types: readonly string[], counts: Readonly<Record<string, number>>}` — Frozen type analysis in first-seen order.

Throws:
- `TypeError` — If values is not an array.

### defaultValueForType

Creates a fresh initialized value for a type descriptor without invoking custom constructors. Built-in collection, buffer, URL, Blob, File, and typed array defaults are supported when the current runtime exposes them.

- Signature: `defaultValueForType()`
- Import: `import { defaultValueForType } from "akashatools/data"`
- Granular import: `import defaultValueForType from "akashatools/data/defaultValueForType"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown` — Fresh initialized value for the normalized type.

Throws:
- `TypeError` — If descriptor/options are invalid or no default is supported.

### defaultValueFor

Creates a fresh initialized value based on a runtime value's intrinsic type. This is the value-oriented counterpart to `defaultValueForType`; it does not preserve the input's content or invoke custom constructors.

- Signature: `defaultValueFor()`
- Import: `import { defaultValueFor } from "akashatools/data"`
- Granular import: `import defaultValueFor from "akashatools/data/defaultValueFor"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown` — Fresh initialized value for the runtime type.

Throws:
- `TypeError` — If options are invalid or no default is supported.

### initializeLike

Builds an initialized skeleton from plain data without mutating it. Objects can retain their key shape or collapse to empty containers; arrays can be emptied, initialize every item, or retain one representative item. Circular plain-data references are recreated. Enumerable accessors, symbols, custom array properties, and prototype-mutating keys are rejected without executing getters.

- Signature: `initializeLike()`
- Import: `import { initializeLike } from "akashatools/data"`
- Granular import: `import initializeLike from "akashatools/data/initializeLike"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown` — Independent initialized skeleton.

Throws:
- `TypeError` — If options or traversed property semantics are unsafe.
- `RangeError` — If maxDepth or maxNodes is exceeded.

## date

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/date`

### isValidDate

Checks whether a value represents a valid Date object.

- Signature: `isValidDate()`
- Import: `import { isValidDate } from "akashatools/date"`
- Granular import: `import isValidDate from "akashatools/date/isValidDate"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Date` — Whether Date.prototype can read a finite timestamp from value.

### toDate

Converts a Date-compatible value to a fresh Date or returns null.

- Signature: `toDate()`
- Import: `import { toDate } from "akashatools/date"`
- Granular import: `import toDate from "akashatools/date/toDate"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Date | null` — Fresh valid Date, or null for absent/invalid input.

### daysInMonth

Returns the number of days in a local calendar month.

- Signature: `daysInMonth()`
- Import: `import { daysInMonth } from "akashatools/date"`
- Granular import: `import daysInMonth from "akashatools/date/daysInMonth"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Number of local calendar days in the selected month.

Throws:
- `RangeError` — If year/month fields are invalid or outside 0-11 for the month.

### startOfLocalDay

Returns a new Date at the beginning of the local calendar day.

- Signature: `startOfLocalDay()`
- Import: `import { startOfLocalDay } from "akashatools/date"`
- Granular import: `import startOfLocalDay from "akashatools/date/startOfLocalDay"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Date` — Fresh Date set to 00:00:00.000 in the local timezone.

Throws:
- `TypeError` — If value does not represent a valid Date.

### localDateKey

Returns a stable local date key in YYYY-MM-DD format.

- Signature: `localDateKey()`
- Import: `import { localDateKey } from "akashatools/date"`
- Granular import: `import localDateKey from "akashatools/date/localDateKey"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Local calendar key formatted `YYYY-MM-DD`.

Throws:
- `TypeError` — If value does not represent a valid Date.

### differenceInLocalDays

Calculates whole local calendar-day boundaries between two values. This uses UTC representations of local calendar fields to avoid daylight-saving shifts.

- Signature: `differenceInLocalDays()`
- Import: `import { differenceInLocalDays } from "akashatools/date"`
- Granular import: `import differenceInLocalDays from "akashatools/date/differenceInLocalDays"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Signed count of crossed local calendar-day boundaries.

Throws:
- `TypeError` — If either value does not represent a valid Date.

### isSameLocalDay

Checks whether two values fall on the same local calendar day.

- Signature: `isSameLocalDay()`
- Import: `import { isSameLocalDay } from "akashatools/date"`
- Granular import: `import isSameLocalDay from "akashatools/date/isSameLocalDay"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether both values share one local calendar date.

Throws:
- `TypeError` — If either value does not represent a valid Date.

### isToday

Checks whether a value falls on today's local calendar day.

- Signature: `isToday()`
- Import: `import { isToday } from "akashatools/date"`
- Granular import: `import isToday from "akashatools/date/isToday"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether value shares now's local calendar date.

Throws:
- `TypeError` — If either value does not represent a valid Date.

### toUnixSeconds

Converts a date value to whole Unix seconds.

- Signature: `toUnixSeconds()`
- Import: `import { toUnixSeconds } from "akashatools/date"`
- Granular import: `import toUnixSeconds from "akashatools/date/toUnixSeconds"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Truncated whole seconds since the Unix epoch.

Throws:
- `TypeError` — If value does not represent a valid Date.

### fromUnixSeconds

Converts Unix seconds to a Date.

- Signature: `fromUnixSeconds()`
- Import: `import { fromUnixSeconds } from "akashatools/date"`
- Granular import: `import fromUnixSeconds from "akashatools/date/fromUnixSeconds"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Date` — Fresh Date at seconds times 1,000 milliseconds.

Throws:
- `TypeError` — If seconds is not finite.
- `RangeError` — If the resulting timestamp is outside the Date range.

### normalizeInstantRange

Normalizes two Date-compatible boundaries into fresh Date objects. Boundaries represent absolute instants and are never swapped implicitly.

- Signature: `normalizeInstantRange()`
- Import: `import { normalizeInstantRange } from "akashatools/date"`
- Granular import: `import normalizeInstantRange from "akashatools/date/normalizeInstantRange"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `{start: Date, end: Date}` — Fresh normalized boundary Dates.

Throws:
- `TypeError` — If either boundary does not represent a valid Date.
- `RangeError` — If start is after end.

### isWithinInstantRange

Checks whether a Date-compatible value is within an absolute instant range. The default range is start-inclusive and end-exclusive.

- Signature: `isWithinInstantRange()`
- Import: `import { isWithinInstantRange } from "akashatools/date"`
- Granular import: `import isWithinInstantRange from "akashatools/date/isWithinInstantRange"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether value satisfies both range boundaries.

Throws:
- `TypeError | RangeError` — If options or Date/range boundaries are invalid.

### clockTimeToMinutes

Parses a 24-hour `HH:mm` clock time into minutes after midnight.

- Signature: `clockTimeToMinutes()`
- Import: `import { clockTimeToMinutes } from "akashatools/date"`
- Granular import: `import clockTimeToMinutes from "akashatools/date/clockTimeToMinutes"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number | null` — Minutes after midnight, or null for invalid syntax/ranges.

### minutesToClockTime

Formats minutes after midnight as 24-hour `HH:mm`, wrapping across days.

- Signature: `minutesToClockTime()`
- Import: `import { minutesToClockTime } from "akashatools/date"`
- Granular import: `import minutesToClockTime from "akashatools/date/minutesToClockTime"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Zero-padded 24-hour `HH:mm` clock text.

Throws:
- `TypeError` — If minutes is not finite.

### clock12To24

Converts a 12-hour clock string such as `2:05 PM` to `14:05`.

- Signature: `clock12To24()`
- Import: `import { clock12To24 } from "akashatools/date"`
- Granular import: `import clock12To24 from "akashatools/date/clock12To24"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | null` — Zero-padded 24-hour text, or null for invalid input.

### clock24To12

Converts a `HH:mm` clock string to a 12-hour form such as `2:05 PM`.

- Signature: `clock24To12()`
- Import: `import { clock24To12 } from "akashatools/date"`
- Granular import: `import clock24To12 from "akashatools/date/clock24To12"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | null` — 12-hour clock text, or null for invalid input.

### formatDate

Formats a date using `Intl.DateTimeFormat`.

- Signature: `formatDate()`
- Import: `import { formatDate } from "akashatools/date"`
- Granular import: `import formatDate from "akashatools/date/formatDate"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Locale-formatted date text.

Throws:
- `TypeError | RangeError` — If value, locales, or options are invalid.

### formatDateTime

Formats a date and time using `Intl.DateTimeFormat`.

- Signature: `formatDateTime()`
- Import: `import { formatDateTime } from "akashatools/date"`
- Granular import: `import formatDateTime from "akashatools/date/formatDateTime"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Locale-formatted date-and-time text.

Throws:
- `TypeError | RangeError` — If value, locales, or options are invalid.

### formatDuration

Formats a non-negative minute duration as compact, locale-independent hours and minutes. Fractional input uses an explicit whole-minute rounding policy; zero components are omitted except for the canonical `0m` result.

- Signature: `formatDuration()`
- Import: `import { formatDuration } from "akashatools/date"`
- Granular import: `import formatDuration from "akashatools/date/formatDuration"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Compact `0m`, `45m`, `2h`, or `2h 5m`-style label.

Throws:
- `TypeError` — If minutes or options violates its literal contract.
- `RangeError` — If minutes is negative/unsafe or rounding is unsupported.

### formatRelativeTime

Formats a Date-compatible instant relative to an injectable base through `Intl.RelativeTimeFormat`. Automatic units use fixed thresholds of 60 seconds, 60 minutes, 24 hours, 30 days, and 365 days; month/year values are therefore presentation approximations rather than calendar arithmetic.

- Signature: `formatRelativeTime()`
- Import: `import { formatRelativeTime } from "akashatools/date"`
- Granular import: `import formatRelativeTime from "akashatools/date/formatRelativeTime"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Locale-formatted relative time such as `yesterday` or `in 2 hours`.

Throws:
- `TypeError | RangeError` — If dates, locales, options, or Intl values are invalid.

## http

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/http`

### HttpError

A stable HTTP/network error with redacted response metadata.

- Signature: `class HttpError`
- Import: `import { HttpError } from "akashatools/http"`
- Granular import: `import HttpError from "akashatools/http/HttpError"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0

### request

Performs one HTTP(S) request without application auth, envelopes, delays, or automatic retries. Bodies are size-bounded unless `responseType: "response"` transfers raw response ownership to the caller. Empty JSON bodies return null.

- Signature: `request()`
- Import: `import { request } from "akashatools/http"`
- Granular import: `import request from "akashatools/http/request"`
- Input mutation: Does not mutate inputs; performs one network request.
- Since: 2.0.0
- Returns: `Promise<T>` — Parsed response value, Blob/ArrayBuffer, or raw Response according to responseType.

Throws:
- `TypeError | RangeError` — If URL, method, options, or limits do not match the request contract.
- `HttpError` — For HTTP status, network, abort, timeout, size, or JSON parsing failures.

### redactHeaders

Copies headers while replacing common credential/cookie values with `[REDACTED]`. Names are normalized by the platform Headers implementation.

- Signature: `redactHeaders()`
- Import: `import { redactHeaders } from "akashatools/http"`
- Granular import: `import redactHeaders from "akashatools/http/redactHeaders"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Record<string, string>` — Plain copied record with sensitive values replaced by `[REDACTED]`.

Throws:
- `TypeError` — If additionalSensitiveNames is not an array of strings or Headers rejects the input.

### parseRetryAfter

Parses a `Retry-After` field into a non-negative delay in seconds without performing a retry. RFC delay-seconds are decimal integers; the three HTTP date forms are accepted and calendar/weekday consistency is checked. An explicit compatibility option accepts non-standard fractional delay values used by some APIs. Past dates resolve to zero.

- Signature: `parseRetryAfter()`
- Import: `import { parseRetryAfter } from "akashatools/http"`
- Granular import: `import parseRetryAfter from "akashatools/http/parseRetryAfter"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number | undefined` — Finite delay seconds, capped when requested, or undefined for an absent/invalid/unrepresentable field.

Throws:
- `TypeError` — If value, options, now, or allowFractionalSeconds violates its literal contract.
- `RangeError` — If a bound is invalid, now is outside the Date range, or the field exceeds maximumHeaderLength.

### parseContentDispositionFilename

Extracts a bounded cross-platform-safe filename suggestion from an HTTP `Content-Disposition` value. A valid RFC extended `filename*` takes precedence over `filename`; malformed candidates fall through to the next candidate and then an optional fallback. Path components, controls, bidi overrides, reserved characters, and Windows device names are neutralized.

- Signature: `parseContentDispositionFilename()`
- Import: `import { parseContentDispositionFilename } from "akashatools/http"`
- Granular import: `import parseContentDispositionFilename from "akashatools/http/parseContentDispositionFilename"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | undefined` — Safe filename suggestion, normalized fallback, or undefined.

Throws:
- `TypeError` — If value, options, or fallback violates its literal contract.
- `RangeError` — If a length bound is invalid or the header exceeds maximumHeaderLength.

## hash

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/hash`

### sha256Hex

Computes a lowercase SHA-256 digest with the runtime's native Web Crypto implementation. Strings are encoded as UTF-8; binary views hash only their visible byte range. Input bytes are copied before the asynchronous digest so later caller mutation cannot change the result. This is a cryptographic digest primitive, not a password hash, MAC, signature, encryption operation, or proof that content is trustworthy.

- Signature: `sha256Hex()`
- Import: `import { sha256Hex } from "akashatools/hash"`
- Granular import: `import sha256Hex from "akashatools/hash/sha256Hex"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Promise<string>` — Promise for exactly 64 lowercase hexadecimal characters.

Throws:
- `TypeError` — If value, options, or crypto does not satisfy the literal contract.
- `RangeError` — If maximumBytes is invalid or the encoded input exceeds it.

### crc32

Computes the standard unsigned CRC-32/ISO-HDLC checksum used by ZIP and many file formats. Strings are encoded as UTF-8 and binary views use only their visible byte range. CRC-32 detects accidental corruption efficiently but is not collision resistant and must not be used as a security digest.

- Signature: `crc32()`
- Import: `import { crc32 } from "akashatools/hash"`
- Granular import: `import crc32 from "akashatools/hash/crc32"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Unsigned 32-bit checksum in the range 0 through 4294967295.

Throws:
- `TypeError` — If value or options does not satisfy the literal contract.
- `RangeError` — If maximumBytes is invalid or the encoded input exceeds it.

### sha256Json

Produces a prefixed SHA-256 digest of strict deterministic JSON. It composes `stableJson` rather than inventing another normalizer, so active properties, unsupported values, sparse arrays, non-finite numbers, and cycles retain the canonical JSON rejection contract.

- Signature: `sha256Json()`
- Import: `import { sha256Json } from "akashatools/hash"`
- Granular import: `import sha256Json from "akashatools/hash/sha256Json"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Promise<string>` — Promise for `sha256:` followed by 64 lowercase hexadecimal characters.

Throws:
- `TypeError` — If value, options, crypto, or JSON shape is unsupported.
- `RangeError` — If a serialization or byte work bound is invalid or exceeded.

### stableJsonId

Creates a deterministic, readable identifier from strict JSON and a caller-owned prefix. The identifier truncates SHA-256 for compactness; it is suitable for reproducible local keys, not secrets, unguessable IDs, digital signatures, or global uniqueness without a domain-specific collision plan.

- Signature: `stableJsonId()`
- Import: `import { stableJsonId } from "akashatools/hash"`
- Granular import: `import stableJsonId from "akashatools/hash/stableJsonId"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Promise<string>` — Promise for `${prefix}_${hexadecimalSuffix}`.

Throws:
- `TypeError` — If prefix, value, options, crypto, or JSON shape is unsupported.
- `RangeError` — If hashLength or a work bound is invalid or exceeded.

## input

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/input`

### inputTypeForType

Returns the native HTML input type suited to one scalar data type. Composite containers return `undefined` by default because they require a higher-level control; use `controlTypeForType` to classify those. Overrides are checked by normalized descriptor spelling and then by canonical data type.

- Signature: `inputTypeForType()`
- Import: `import { inputTypeForType } from "akashatools/input"`
- Granular import: `import inputTypeForType from "akashatools/input/inputTypeForType"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | undefined` — Native input type or undefined for unsupported/composite data.

Throws:
- `TypeError` — If descriptor or options do not match the contract.

### inputTypeForValue

Returns the native HTML input type suited to a runtime scalar value. Strings remain text even when their content resembles a number or boolean; this function never guesses semantic types from string contents.

- Signature: `inputTypeForValue()`
- Import: `import { inputTypeForValue } from "akashatools/input"`
- Granular import: `import inputTypeForValue from "akashatools/input/inputTypeForValue"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | undefined` — Native input type or undefined for unsupported/composite data.

Throws:
- `TypeError` — If options do not match the contract.

### controlTypeForType

Classifies a declared type into a renderer-level control without pretending composite data can be accepted by a native input. The result is `input`, `array`, `object`, `map`, `set`, or `unsupported`.

- Signature: `controlTypeForType()`
- Import: `import { controlTypeForType } from "akashatools/input"`
- Granular import: `import controlTypeForType from "akashatools/input/controlTypeForType"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `"input" | "array" | "object" | "map" | "set" | "unsupported"` — Generic control category.

Throws:
- `TypeError` — If descriptor or options do not match the contract.

### controlTypeForValue

Classifies a runtime value into a renderer-level control. Arrays are analyzed in full and distinguished as empty, scalar, object, nested, or mixed rather than inferred from item zero.

- Signature: `controlTypeForValue()`
- Import: `import { controlTypeForValue } from "akashatools/input"`
- Granular import: `import controlTypeForValue from "akashatools/input/controlTypeForValue"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `"input" | "array" | "scalar-array" | "object-array" | "nested-array" | "mixed-array" | "object" | "map" | "set" | "unsupported"` — Generic control category.

Throws:
- `TypeError` — If options do not match the contract.

### fieldDescriptorFor

Describes one generic data-backed input field without importing a UI framework or schema language. The existing value becomes `defaultValue` unless the option is explicitly present, so false, zero, and empty strings are preserved. The value itself is retained by reference, not cloned.

- Signature: `fieldDescriptorFor()`
- Import: `import { fieldDescriptorFor } from "akashatools/input"`
- Granular import: `import fieldDescriptorFor from "akashatools/input/fieldDescriptorFor"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Readonly<{name: string, label: string, path: readonly (string | number)[], dataType: string, inputType: string | undefined, controlType: ReturnType<typeof controlTypeForValue>, defaultValue: unknown, arrayAnalysis: ReturnType<typeof analyzeArrayTypes> | undefined}>` — Frozen framework-neutral field descriptor.

Throws:
- `TypeError` — If name, options, label, or path is invalid.

### fieldsFromData

Creates descriptors for the direct fields of a plain object or array. Object accessors, enumerable symbols, prototype-mutating names, and custom array properties are rejected without invoking getters. Sparse array slots become indexed fields with `undefined` values, matching Akashatools sequence policy.

- Signature: `fieldsFromData()`
- Import: `import { fieldsFromData } from "akashatools/input"`
- Granular import: `import fieldsFromData from "akashatools/input/fieldsFromData"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `readonly ReturnType<typeof fieldDescriptorFor>[]` — Frozen ordered field descriptors.

Throws:
- `TypeError` — If value, options, labels, or property semantics are invalid.
- `RangeError` — If the field count exceeds maximumFields.

## number

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/number`

### clamp

Constrains a finite number to an inclusive range.

- Signature: `clamp()`
- Import: `import { clamp } from "akashatools/number"`
- Granular import: `import clamp from "akashatools/number/clamp"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Value constrained to the inclusive range.

Throws:
- `TypeError` — If any argument is not finite.
- `RangeError` — If minimum exceeds maximum.

### wrap

Wraps a finite number into the half-open interval [minimum, maximum).

- Signature: `wrap()`
- Import: `import { wrap } from "akashatools/number"`
- Granular import: `import wrap from "akashatools/number/wrap"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Equivalent value in the half-open interval.

Throws:
- `TypeError` — If any argument is not finite.
- `RangeError` — If the interval is empty, reversed, or has a non-finite span.

### roundTo

Rounds a number to a decimal precision using exponent shifting.

- Signature: `roundTo()`
- Import: `import { roundTo } from "akashatools/number"`
- Granular import: `import roundTo from "akashatools/number/roundTo"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Rounded finite value.

Throws:
- `TypeError` — If value is not finite.
- `RangeError` — If digits or the rounded result is outside supported finite bounds.

### sum

Adds finite numeric arguments.

- Signature: `sum()`
- Import: `import { sum } from "akashatools/number"`
- Granular import: `import sum from "akashatools/number/sum"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Arithmetic sum, which can overflow if the result is not representable.

Throws:
- `TypeError` — If any input is not finite.

### subtract

Subtracts each subsequent value from the first.

- Signature: `subtract()`
- Import: `import { subtract } from "akashatools/number"`
- Granular import: `import subtract from "akashatools/number/subtract"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Arithmetic difference, which can overflow if the result is not representable.

Throws:
- `TypeError` — If any input is not finite.

### distance

Returns the absolute distance between two finite numbers.

- Signature: `distance()`
- Import: `import { distance } from "akashatools/number"`
- Granular import: `import distance from "akashatools/number/distance"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Absolute arithmetic distance, possibly Infinity after numeric overflow.

Throws:
- `TypeError` — If either input is not finite.

### distance2d

Calculates Euclidean distance between two `[x, y]` coordinates.

- Signature: `distance2d()`
- Import: `import { distance2d } from "akashatools/number"`
- Granular import: `import distance2d from "akashatools/number/distance2d"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Euclidean distance, possibly Infinity when no finite result is representable.

Throws:
- `TypeError` — If either coordinate is not a two-item array of finite numbers.

### fibonacci

Returns the nth Fibonacci number using an iterative O(n) implementation.

- Signature: `fibonacci()`
- Import: `import { fibonacci } from "akashatools/number"`
- Granular import: `import fibonacci from "akashatools/number/fibonacci"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Exactly representable Fibonacci number at index.

Throws:
- `RangeError` — If index is outside the supported safe-integer range.

### toBinary

Converts a safe integer to a binary string.

- Signature: `toBinary()`
- Import: `import { toBinary } from "akashatools/number"`
- Granular import: `import toBinary from "akashatools/number/toBinary"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Signed binary digits without a radix prefix.

Throws:
- `TypeError` — If value is not a safe integer.

### formatBytes

Formats a non-negative byte quantity with deterministic decimal or IEC binary units. Values are rounded only for presentation and may promote into the next unit when rounding reaches its base.

- Signature: `formatBytes()`
- Import: `import { formatBytes } from "akashatools/number"`
- Granular import: `import formatBytes from "akashatools/number/formatBytes"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Compact value followed by B/KB/MB or B/KiB/MiB-style units.

Throws:
- `TypeError` — If bytes or options do not match their literal contracts.
- `RangeError` — If bytes is negative or maximumFractionDigits is outside 0-20.

### summarizeNumbers

Summarizes a finite numeric sample without mutating it. Percentiles use linear interpolation at position `(length - 1) * percentile`, and standard deviation is the population value. Empty samples have count zero and null statistics so absence is not confused with observed zeroes.

- Signature: `summarizeNumbers()`
- Import: `import { summarizeNumbers } from "akashatools/number"`
- Granular import: `import summarizeNumbers from "akashatools/number/summarizeNumbers"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `{ count: number, minimum: number | null, maximum: number | null, median: number | null, p75: number | null, p95: number | null, mean: number | null, standardDeviation: number | null }` — Summary with interpolated percentiles and population deviation.

Throws:
- `TypeError` — If values is not an array or contains a non-finite number.
- `RangeError` — If a statistic cannot be represented as a finite number.

## object

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/object`

### isPlainObject

Checks whether a value is an object with Object.prototype or a null prototype.

- Signature: `isPlainObject()`
- Import: `import { isPlainObject } from "akashatools/object"`
- Granular import: `import isPlainObject from "akashatools/object/isPlainObject"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Record<PropertyKey, unknown>` — Whether value has the intrinsic Object constructor or null prototype.

### parsePath

Parses a safe dot/bracket property path. Prototype-mutating segments are rejected to prevent prototype-pollution vulnerabilities.

- Signature: `parsePath()`
- Import: `import { parsePath } from "akashatools/object"`
- Granular import: `import parsePath from "akashatools/object/parsePath"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `(string | number)[]` — Fresh normalized string/number segment array.

Throws:
- `TypeError` — If syntax or a segment is invalid or prototype-mutating.
- `RangeError` — If the path exceeds the length or segment limits.

### getAtPath

Reads an own property at a nested path, returning a fallback only when the path is absent. An existing `undefined` value is returned as-is.

- Signature: `getAtPath()`
- Import: `import { getAtPath } from "akashatools/object"`
- Granular import: `import getAtPath from "akashatools/object/getAtPath"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown | T` — Existing leaf value (including undefined) or fallback.

Throws:
- `TypeError | RangeError` — If the path contract is invalid.

### hasAtPath

Checks whether every segment of a nested own-property path exists.

- Signature: `hasAtPath()`
- Import: `import { hasAtPath } from "akashatools/object"`
- Granular import: `import hasAtPath from "akashatools/object/hasAtPath"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether every path segment exists, even if the leaf is undefined.

Throws:
- `TypeError | RangeError` — If the path contract is invalid.

### parseJsonPointer

Parses an RFC 6901 JSON Pointer into decoded string reference tokens. The empty pointer addresses the document root. Non-empty pointers must begin with `/`; `~0` decodes to `~` and `~1` decodes to `/`. Prototype-mutating tokens are rejected even though they could be ordinary JSON keys, preserving the package-wide safe-path boundary.

- Signature: `parseJsonPointer()`
- Import: `import { parseJsonPointer } from "akashatools/object"`
- Granular import: `import parseJsonPointer from "akashatools/object/parseJsonPointer"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string[]` — Fresh decoded token array; numeric-looking tokens remain strings until evaluated against an array.

Throws:
- `TypeError` — If pointer syntax or an escape/prototype-mutating token is invalid.
- `RangeError` — If the pointer exceeds 10,000 code units or 100 tokens.

### getAtJsonPointer

Reads a value through an RFC 6901 JSON Pointer. Traversal enters only arrays and plain objects, uses own data properties, and never invokes accessors. Array tokens use canonical unsigned decimal spelling (`0` or a nonzero digit followed by digits); sparse/missing elements and `-` are absent. A fallback is returned only for absence, not for an existing `undefined` value.

- Signature: `getAtJsonPointer()`
- Import: `import { getAtJsonPointer } from "akashatools/object"`
- Granular import: `import getAtJsonPointer from "akashatools/object/getAtJsonPointer"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown | T` — Referenced own data-property value, root, or fallback.

Throws:
- `TypeError | RangeError` — If pointer syntax is invalid or traversal encounters an accessor.

### hasAtJsonPointer

Checks whether an RFC 6901 JSON Pointer resolves through own data properties. The empty pointer always resolves to the supplied root, including an `undefined` root. Array, accessor, unsafe-token, and work-bound behavior is identical to `getAtJsonPointer`.

- Signature: `hasAtJsonPointer()`
- Import: `import { hasAtJsonPointer } from "akashatools/object"`
- Granular import: `import hasAtJsonPointer from "akashatools/object/hasAtJsonPointer"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether the complete pointer resolves, even when its value is undefined.

Throws:
- `TypeError | RangeError` — If pointer syntax is invalid or traversal encounters an accessor.

### setAtPath

Sets a nested value while structurally sharing untouched objects and arrays. Missing containers are inferred from the following path segment. If an existing leaf is `Object.is`-identical to `nextValue`, the original root is returned without allocating replacement ancestors.

- Signature: `setAtPath()`
- Import: `import { setAtPath } from "akashatools/object"`
- Granular import: `import setAtPath from "akashatools/object/setAtPath"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T` — Structurally shared root, or the original root for an identical leaf.

Throws:
- `TypeError | RangeError` — If the path contract is invalid.

### traverseObject

Traverses own enumerable data properties of plain objects and arrays in deterministic depth-first preorder. Results include paths and parents. Repeated/circular objects appear as entries but are not entered again. Accessors and symbols are skipped; built-in collections, typed arrays, Dates, and class instances are leaf values. Sparse array slots are absent properties.

- Signature: `traverseObject()`
- Import: `import { traverseObject } from "akashatools/object"`
- Granular import: `import traverseObject from "akashatools/object/traverseObject"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `ObjectTraversalEntry[]` — Deterministic preorder entries with fresh paths.

Throws:
- `TypeError` — If the root or options do not match the contract.
- `RangeError` — If traversal would exceed `maxNodes`.

### findDeep

Returns the first deep traversal entry accepted by a predicate, or `undefined`. Traversal uses the same cycle, property, and limit rules as `traverseObject`, and stops as soon as a match is found.

- Signature: `findDeep()`
- Import: `import { findDeep } from "akashatools/object"`
- Granular import: `import findDeep from "akashatools/object/findDeep"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `ObjectTraversalEntry | undefined` — First accepted entry or undefined.

Throws:
- `TypeError` — If the root, predicate, or options are invalid.
- `RangeError` — If traversal would exceed `maxNodes` before a match.

### findAllDeep

Returns every deep traversal entry accepted by a predicate. Traversal order, cycle behavior, property safety, and node/depth limits match `findDeep`. `maxMatches` adds a separate output bound and throws instead of truncating.

- Signature: `findAllDeep()`
- Import: `import { findAllDeep } from "akashatools/object"`
- Granular import: `import findAllDeep from "akashatools/object/findAllDeep"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `ObjectTraversalEntry[]` — Every accepted entry in traversal order.

Throws:
- `TypeError` — If the root, predicate, or options are invalid.
- `RangeError` — If maxNodes, maxDepth, or maxMatches is invalid/exceeded.

### hasDeep

Checks whether any deep entry's value, key, or either side matches a needle. Matching uses `Object.is` by default; object needles therefore use identity, not implicit serialization or structural equality.

- Signature: `hasDeep()`
- Import: `import { hasDeep } from "akashatools/object"`
- Granular import: `import hasDeep from "akashatools/object/hasDeep"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether a matching entry exists.

Throws:
- `TypeError` — If the root or options are invalid.
- `RangeError` — If traversal bounds are invalid or exceeded.

### findDeepMatch

Returns the first deep entry whose value/key matches a needle, retaining its key, path, parent, and value. Use the dedicated projection wrappers when only the value or parent is needed.

- Signature: `findDeepMatch()`
- Import: `import { findDeepMatch } from "akashatools/object"`
- Granular import: `import findDeepMatch from "akashatools/object/findDeepMatch"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `ObjectTraversalEntry | undefined` — First matching entry or undefined.

Throws:
- `TypeError` — If the root or options are invalid.
- `RangeError` — If traversal bounds are invalid or exceeded.

### findDeepValue

Returns the value of the first deep needle match. A matching `undefined` value and no match both project to undefined; use `findDeepMatch` when that distinction matters.

- Signature: `findDeepValue()`
- Import: `import { findDeepValue } from "akashatools/object"`
- Granular import: `import findDeepValue from "akashatools/object/findDeepValue"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown` — First matched value, or undefined when absent.

Throws:
- `TypeError` — If the root or options are invalid.
- `RangeError` — If traversal bounds are invalid or exceeded.

### findDeepParent

Returns the immediate container of the first deep needle match. Root matches and absent matches both project to undefined; use `findDeepMatch` when that distinction matters.

- Signature: `findDeepParent()`
- Import: `import { findDeepParent } from "akashatools/object"`
- Granular import: `import findDeepParent from "akashatools/object/findDeepParent"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `ObjectTraversalEntry["parent"]` — First matching parent or undefined.

Throws:
- `TypeError` — If the root or options are invalid.
- `RangeError` — If traversal bounds are invalid or exceeded.

### findAllDeepMatches

Returns every entry whose value/key matches a needle, preserving traversal metadata and deterministic preorder.

- Signature: `findAllDeepMatches()`
- Import: `import { findAllDeepMatches } from "akashatools/object"`
- Granular import: `import findAllDeepMatches from "akashatools/object/findAllDeepMatches"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `ObjectTraversalEntry[]` — All matching entries in traversal order.

Throws:
- `TypeError` — If the root or options are invalid.
- `RangeError` — If traversal/output bounds are invalid or exceeded.

### findAllDeepValues

Returns the value projection of every deep needle match. Repeated values are retained so indexes stay aligned with `findAllDeepMatches`.

- Signature: `findAllDeepValues()`
- Import: `import { findAllDeepValues } from "akashatools/object"`
- Granular import: `import findAllDeepValues from "akashatools/object/findAllDeepValues"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown[]` — Matched values in traversal order.

Throws:
- `TypeError` — If the root or options are invalid.
- `RangeError` — If traversal/output bounds are invalid or exceeded.

### findAllDeepParents

Returns the parent projection of every deep needle match. Duplicate parents are retained, and an included root match contributes undefined.

- Signature: `findAllDeepParents()`
- Import: `import { findAllDeepParents } from "akashatools/object"`
- Granular import: `import findAllDeepParents from "akashatools/object/findAllDeepParents"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `ObjectTraversalEntry["parent"][]` — Matching parents in traversal order.

Throws:
- `TypeError` — If the root or options are invalid.
- `RangeError` — If traversal/output bounds are invalid or exceeded.

### deepQuery

Creates a frozen, side-effect-free dot-style query view over structured data. Methods delegate to the same atomic traversal/search functions; creating a view never mutates the root or any global/built-in prototype.

- Signature: `deepQuery()`
- Import: `import { deepQuery } from "akashatools/object"`
- Granular import: `import deepQuery from "akashatools/object/deepQuery"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Readonly<DeepQueryView>` — Frozen fluent search/projection view.

Throws:
- `TypeError` — If the root or base options are invalid.
- `RangeError` — If base traversal bounds are invalid.

### pick

Returns an object containing selected own properties.

- Signature: `pick()`
- Import: `import { pick } from "akashatools/object"`
- Granular import: `import pick from "akashatools/object/pick"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Partial<T>` — New ordinary object containing selected own values.

Throws:
- `TypeError` — If value is not object-like or keys is not an array.

### omit

Returns a shallow copy without the selected own properties.

- Signature: `omit()`
- Import: `import { omit } from "akashatools/object"`
- Granular import: `import omit from "akashatools/object/omit"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Partial<T>` — New ordinary object without selected enumerable string keys.

Throws:
- `TypeError` — If value is not object-like or keys is not an array.

### deepClone

Deeply clones structured-cloneable values, including circular references, Maps, Sets, Dates, typed arrays, and transferable values.

- Signature: `deepClone()`
- Import: `import { deepClone } from "akashatools/object"`
- Granular import: `import deepClone from "akashatools/object/deepClone"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T` — Independent structured clone preserving supported built-in types/cycles.

Throws:
- `DOMException` — If value or transfer options cannot be structured-cloned.

### cloneJson

Clones strict plain JSON data without invoking `toJSON` methods or accessors. The result uses ordinary objects, safely preserves all string keys, and duplicates shared references as JSON serialization would. Cycles, sparse or customized arrays, non-finite numbers, symbols, and non-plain objects are rejected rather than coerced.

- Signature: `cloneJson()`
- Import: `import { cloneJson } from "akashatools/object"`
- Granular import: `import cloneJson from "akashatools/object/cloneJson"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T` — Independent plain JSON clone.

Throws:
- `TypeError` — If value/options contain unsupported JSON shapes or active property semantics.
- `RangeError` — If a configured structural or byte limit is exceeded.

### deepMerge

Recursively merges own enumerable string-keyed data properties of plain objects without mutating either input. Arrays and non-plain objects are replaced by reference. Unsafe names, enumerable symbols, and enumerable accessors are rejected without invoking getters. The base prototype is kept.

- Signature: `deepMerge()`
- Import: `import { deepMerge } from "akashatools/object"`
- Granular import: `import deepMerge from "akashatools/object/deepMerge"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T & U` — New recursively merged plain object.

Throws:
- `TypeError` — If inputs are not plain data objects or contain unsafe property semantics/cycles.
- `RangeError` — If merge depth or object-pair work exceeds the fixed limits.

### pickAllowed

Returns a new object containing only allowed own properties. Unknown or prototype-mutating properties can be rejected or skipped.

- Signature: `pickAllowed()`
- Import: `import { pickAllowed } from "akashatools/object"`
- Granular import: `import pickAllowed from "akashatools/object/pickAllowed"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Record<string, unknown>` — New ordinary object containing allowed own properties.

Throws:
- `TypeError` — If value, allowedKeys, rejectUnknown, or an encountered key is invalid.

## random

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/random`

### randomFloat

Returns a random float in the half-open range [minimum, maximum).

- Signature: `randomFloat()`
- Import: `import { randomFloat } from "akashatools/random"`
- Granular import: `import randomFloat from "akashatools/random/randomFloat"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Random value in the requested half-open interval.

Throws:
- `TypeError` — If bounds or the random source are not finite/function values.
- `RangeError` — If boundaries are reversed, their width overflows, or random violates `[0, 1)`.

### randomInt

Returns a random integer. The minimum is inclusive; the maximum can be inclusive (default) or exclusive.

- Signature: `randomInt()`
- Import: `import { randomInt } from "akashatools/random"`
- Granular import: `import randomInt from "akashatools/random/randomInt"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Random safe integer in the requested range.

Throws:
- `TypeError` — If bounds, inclusiveMaximum, or random do not match their contracts.
- `RangeError` — If the range is reversed, empty, too wide, or random violates `[0, 1)`.

### randomBoolean

Returns a random boolean.

- Signature: `randomBoolean()`
- Import: `import { randomBoolean } from "akashatools/random"`
- Granular import: `import randomBoolean from "akashatools/random/randomBoolean"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — False below 0.5 and true at or above 0.5.

Throws:
- `TypeError` — If random is not a function.
- `RangeError` — If random returns outside `[0, 1)` or a non-finite value.

### randomString

Returns a random string from the supplied character set. This is not suitable for passwords, tokens, or identifiers requiring cryptographic unpredictability.

- Signature: `randomString()`
- Import: `import { randomString } from "akashatools/random"`
- Granular import: `import randomString from "akashatools/random/randomString"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Non-cryptographic sampled string of exactly length code units.

Throws:
- `TypeError` — If characters or random do not match their contracts.
- `RangeError` — If length or a sampled random value is outside its bounds.

### secureRandomUuid

Returns a cryptographically secure RFC 4122 UUID through Web Crypto.

- Signature: `secureRandomUuid()`
- Import: `import { secureRandomUuid } from "akashatools/random"`
- Granular import: `import secureRandomUuid from "akashatools/random/secureRandomUuid"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Cryptographically secure UUID string supplied by Web Crypto.

Throws:
- `Error` — If the runtime does not provide `crypto.randomUUID`.

### secureRandomString

Returns a cryptographically secure string using rejection sampling to avoid modulo bias. The alphabet must contain 2-256 unique Unicode code points.

- Signature: `secureRandomString()`
- Import: `import { secureRandomString } from "akashatools/random"`
- Granular import: `import secureRandomString from "akashatools/random/secureRandomString"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Cryptographically secure unbiased sampled string.

Throws:
- `TypeError` — If alphabet is not a string.
- `RangeError` — If length or alphabet constraints are violated.
- `Error` — If the runtime does not provide `crypto.getRandomValues`.

### randomDate

Returns a random Date within an inclusive timestamp range.

- Signature: `randomDate()`
- Import: `import { randomDate } from "akashatools/random"`
- Granular import: `import randomDate from "akashatools/random/randomDate"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Date` — Fresh Date at a whole-millisecond instant in the range.

Throws:
- `TypeError` — If either boundary is not a valid Date-compatible value.
- `RangeError` — If the range or random source violates delegated integer constraints.

## sort

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/sort`

### sortBy

Returns a stably sorted copy based on a derived key. Nullish keys sort last. Modern JavaScript guarantees stable `toSorted` behavior without mutating the input array.

- Signature: `sortBy()`
- Import: `import { sortBy } from "akashatools/sort"`
- Granular import: `import sortBy from "akashatools/sort/sortBy"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense stably sorted copy.

Throws:
- `TypeError` — If values, selector, options, or comparator results are invalid.

### sortByMany

Returns a stable copy ordered by multiple selector criteria. Criteria are evaluated once per item and applied in array order. Sparse slots are treated as `undefined` items and the result is dense.

- Signature: `sortByMany()`
- Import: `import { sortByMany } from "akashatools/sort"`
- Granular import: `import sortByMany from "akashatools/sort/sortByMany"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense stably sorted copy using criteria in priority order.

Throws:
- `TypeError` — If values, criteria, selectors, policies, or comparator results are invalid.

### createCollatorComparator

Creates a reusable locale-aware comparator. Reusing the returned function avoids reconstructing collator options during repeated comparisons.

- Signature: `createCollatorComparator()`
- Import: `import { createCollatorComparator } from "akashatools/sort"`
- Granular import: `import createCollatorComparator from "akashatools/sort/createCollatorComparator"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `(left: unknown, right: unknown) => number` — Reusable comparator that stringifies values.

Throws:
- `RangeError` — If Intl rejects a locale or option value.

### compareValues

Compares strings, numbers, bigints, booleans, and Dates with nullish values ordered last. Other values fall back to locale-aware string comparison. Invalid Dates and NaN sort after their valid peers. Numeric and Date results are normalized to -1, 0, or 1 so extreme values remain valid comparators.

- Signature: `compareValues()`
- Import: `import { compareValues } from "akashatools/sort"`
- Granular import: `import compareValues from "akashatools/sort/compareValues"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Negative, zero, or positive ordering signal.

Throws:
- `RangeError` — If the runtime's default Intl.Collator cannot be constructed.

### compareNumericOrder

Compares objects across the first available finite numeric ordering key. Missing and invalid order values sort last. Number-like strings are coerced intentionally for compatibility with persisted legacy ordering fields.

- Signature: `compareNumericOrder()`
- Import: `import { compareNumericOrder } from "akashatools/sort"`
- Granular import: `import compareNumericOrder from "akashatools/sort/compareNumericOrder"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Numeric ordering signal; zero when all normalized fields tie.

Throws:
- `TypeError` — If either value is not an object or keys is not an array.

### sortByNumericOrder

Returns a stable copy ordered by common numeric position fields.

- Signature: `sortByNumericOrder()`
- Import: `import { sortByNumericOrder } from "akashatools/sort"`
- Granular import: `import sortByNumericOrder from "akashatools/sort/sortByNumericOrder"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Stable sorted copy with absent/invalid order fields last.

Throws:
- `TypeError` — If values or delegated comparator inputs are invalid.

## string

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/string`

### capitalize

Uppercases the first Unicode-aware character of a string.

- Signature: `capitalize()`
- Import: `import { capitalize } from "akashatools/string"`
- Granular import: `import capitalize from "akashatools/string/capitalize"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — New string, or an empty string for empty input.

Throws:
- `TypeError | RangeError` — If value or locales is invalid.

### kebabCase

Converts words and common identifier styles to kebab-case.

- Signature: `kebabCase()`
- Import: `import { kebabCase } from "akashatools/string"`
- Granular import: `import kebabCase from "akashatools/string/kebabCase"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Lowercase hyphen-delimited words.

Throws:
- `TypeError` — If value is not a string.

### camelCase

Converts words and common identifier styles to camelCase.

- Signature: `camelCase()`
- Import: `import { camelCase } from "akashatools/string"`
- Granular import: `import camelCase from "akashatools/string/camelCase"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Lower camel-cased identifier.

Throws:
- `TypeError` — If value is not a string.

### pascalCase

Converts words and common identifier styles to PascalCase.

- Signature: `pascalCase()`
- Import: `import { pascalCase } from "akashatools/string"`
- Granular import: `import pascalCase from "akashatools/string/pascalCase"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Upper camel-cased identifier.

Throws:
- `TypeError` — If value is not a string.

### sentenceCase

Converts an identifier into a human-readable sentence.

- Signature: `sentenceCase()`
- Import: `import { sentenceCase } from "akashatools/string"`
- Granular import: `import sentenceCase from "akashatools/string/sentenceCase"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Space-delimited lowercase words with the first code point uppercased.

Throws:
- `TypeError` — If value is not a string.

### includesText

Checks for literal text with optional case sensitivity.

- Signature: `includesText()`
- Import: `import { includesText } from "akashatools/string"`
- Granular import: `import includesText from "akashatools/string/includesText"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether search occurs in value.

Throws:
- `TypeError | RangeError` — If strings, caseSensitive, or locales are invalid.

### replaceMany

Applies literal string replacements in insertion order. Unlike a RegExp-based implementation, replacement keys are never interpreted as regex syntax.

- Signature: `replaceMany()`
- Import: `import { replaceMany } from "akashatools/string"`
- Granular import: `import replaceMany from "akashatools/string/replaceMany"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — String after every ordered literal replacement.

Throws:
- `TypeError` — If value, the replacement container, or any pair is not string-based.

### replaceRegex

Applies a caller-provided regular expression without mutating its `lastIndex`. The expression is cloned with the same source and flags. This function does not make an unsafe or backtracking-prone caller pattern safe.

- Signature: `replaceRegex()`
- Import: `import { replaceRegex } from "akashatools/string"`
- Granular import: `import replaceRegex from "akashatools/string/replaceRegex"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Replaced string without changing pattern.lastIndex.

Throws:
- `TypeError | SyntaxError` — If arguments are invalid or the cloned expression cannot be constructed.

### longestStringLength

Returns the greatest string length among values, object keys, or a scalar.

- Signature: `longestStringLength()`
- Import: `import { longestStringLength } from "akashatools/string"`
- Granular import: `import longestStringLength from "akashatools/string/longestStringLength"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Greatest UTF-16 code-unit length; nullish scalar entries count as empty.

### utf8ByteLength

Measures the UTF-8 encoding length of a string without allocating an encoded byte array. Unpaired UTF-16 surrogates count as the three-byte replacement character, matching `TextEncoder` and web-platform string encoding.

- Signature: `utf8ByteLength()`
- Import: `import { utf8ByteLength } from "akashatools/string"`
- Granular import: `import utf8ByteLength from "akashatools/string/utf8ByteLength"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Number of bytes in the UTF-8 representation.

Throws:
- `TypeError` — If value is not a string.

### countWords

Counts whitespace-delimited tokens without language-specific word-breaking guesses. Unicode whitespace separates tokens; punctuation remains part of the surrounding token.

- Signature: `countWords()`
- Import: `import { countWords } from "akashatools/string"`
- Granular import: `import countWords from "akashatools/string/countWords"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Number of non-whitespace runs.

Throws:
- `TypeError` — If value is not a string.

### splitTextByLimits

Splits text under byte, word, and optional caller-defined cost limits while preferring paragraph, sentence, clause, and word boundaries in that order. The function never normalizes text: joining the returned chunks exactly recreates the input, including line endings and whitespace. An empty string returns an empty array.

- Signature: `splitTextByLimits()`
- Import: `import { splitTextByLimits } from "akashatools/string"`
- Granular import: `import splitTextByLimits from "akashatools/string/splitTextByLimits"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string[]` — Non-empty, ordered, lossless chunks satisfying every enabled limit.

Throws:
- `TypeError` — If value, options, or a custom cost result violates its literal contract.
- `RangeError` — If limits are invalid, input exceeds a work bound, or one code point cannot fit.

### safeFilename

Creates a conservative lowercase filename stem. Output is ASCII, NFKD normalized, bounded, free of trailing punctuation/control characters, and prefixed when it would equal a reserved Windows device name.

- Signature: `safeFilename()`
- Import: `import { safeFilename } from "akashatools/string"`
- Granular import: `import safeFilename from "akashatools/string/safeFilename"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Non-empty conservative ASCII filename stem.

Throws:
- `TypeError | RangeError` — If strings or maximumLength are invalid.

### slugify

Creates a bounded ASCII URL/path slug with Unicode compatibility normalization. Empty normalized input returns a normalized fallback.

- Signature: `slugify()`
- Import: `import { slugify } from "akashatools/string"`
- Granular import: `import slugify from "akashatools/string/slugify"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Non-empty lowercase ASCII slug.

Throws:
- `TypeError | RangeError` — If strings or maximumLength are invalid.

### escapeHtml

Encodes five HTML-significant characters for an HTML text context. This is not HTML sanitization and does not make markup, URLs, CSS, or scripts safe.

- Signature: `escapeHtml()`
- Import: `import { escapeHtml } from "akashatools/string"`
- Granular import: `import escapeHtml from "akashatools/string/escapeHtml"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Text with ampersand, brackets, quotes, and apostrophes encoded.

### prettyJson

Serializes a JSON-compatible value with human-readable indentation.

- Signature: `prettyJson()`
- Import: `import { prettyJson } from "akashatools/string"`
- Granular import: `import prettyJson from "akashatools/string/prettyJson"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Serialized JSON text.

Throws:
- `TypeError` — If serialization fails or returns undefined.

### stableJson

Serializes strict plain JSON with recursively sorted object keys. Key order is Unicode code-unit order and is therefore independent of locale and object insertion history. Enumerable accessors, symbol keys, sparse arrays, non-finite numbers, unsupported values, and cycles are rejected rather than coerced or invoked.

- Signature: `stableJson()`
- Import: `import { stableJson } from "akashatools/string"`
- Granular import: `import stableJson from "akashatools/string/stableJson"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Compact deterministic JSON text.

Throws:
- `TypeError` — If value/options contain unsupported JSON shapes or active property semantics.
- `RangeError` — If limits are invalid or serialization exceeds one of them.

## validation

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/validation`

### isDefined

Checks whether a value is neither null nor undefined.

- Signature: `isDefined()`
- Import: `import { isDefined } from "akashatools/validation"`
- Granular import: `import isDefined from "akashatools/validation/isDefined"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is T` — Whether value is neither null nor undefined; other falsy values pass.

### isArray

Checks whether a value is an array without coercion.

- Signature: `isArray()`
- Import: `import { isArray } from "akashatools/validation"`
- Granular import: `import isArray from "akashatools/validation/isArray"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is unknown[]` — Whether the value is an array, including an empty or cross-realm array.

### isString

Checks whether a value is a primitive string without accepting boxed String objects.

- Signature: `isString()`
- Import: `import { isString } from "akashatools/validation"`
- Granular import: `import isString from "akashatools/validation/isString"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is string` — Whether the value has the primitive string type.

### isNumber

Checks whether a value is a primitive number. NaN and infinities are numbers; use `isFiniteNumber` when arithmetic requires a finite value.

- Signature: `isNumber()`
- Import: `import { isNumber } from "akashatools/validation"`
- Granular import: `import isNumber from "akashatools/validation/isNumber"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is number` — Whether the value has the primitive number type.

### isBoolean

Checks whether a value is a primitive boolean without coercion.

- Signature: `isBoolean()`
- Import: `import { isBoolean } from "akashatools/validation"`
- Granular import: `import isBoolean from "akashatools/validation/isBoolean"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is boolean` — Whether the value is exactly true or false.

### isNonArrayObject

Checks for a non-null object while excluding arrays and functions. Plain objects, class instances, Dates, Maps, and Sets are accepted across realms.

- Signature: `isNonArrayObject()`
- Import: `import { isNonArrayObject } from "akashatools/validation"`
- Granular import: `import isNonArrayObject from "akashatools/validation/isNonArrayObject"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is object` — Whether the value is a non-array object.

### isBlank

Checks for nullish values or strings containing only whitespace.

- Signature: `isBlank()`
- Import: `import { isBlank } from "akashatools/validation"`
- Granular import: `import isBlank from "akashatools/validation/isBlank"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — True only for null, undefined, or whitespace-only strings.

### defaultIfBlank

Returns a fallback for nullish or whitespace-only input and otherwise returns the original value unchanged. Zero and false are preserved.

- Signature: `defaultIfBlank()`
- Import: `import { defaultIfBlank } from "akashatools/validation"`
- Granular import: `import defaultIfBlank from "akashatools/validation/defaultIfBlank"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T | U` — Original nonblank value or the supplied fallback.

### isEmpty

Checks common empty values: blank strings, empty arrays, empty Maps/Sets, and plain objects without enumerable own properties. Zero and false are not empty.

- Signature: `isEmpty()`
- Import: `import { isEmpty } from "akashatools/validation"`
- Granular import: `import isEmpty from "akashatools/validation/isEmpty"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether value matches one explicitly supported empty shape.

### isFiniteNumber

Checks whether a value is a finite primitive number.

- Signature: `isFiniteNumber()`
- Import: `import { isFiniteNumber } from "akashatools/validation"`
- Granular import: `import isFiniteNumber from "akashatools/validation/isFiniteNumber"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is number` — Whether value is a primitive finite number without coercion.

### isFiniteNonInteger

Checks whether a value is a finite primitive number with a fractional part.

- Signature: `isFiniteNonInteger()`
- Import: `import { isFiniteNonInteger } from "akashatools/validation"`
- Granular import: `import isFiniteNonInteger from "akashatools/validation/isFiniteNonInteger"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is number` — Whether the value is finite and not an integer.

### isSafeInteger

Checks whether a value is a safe primitive integer.

- Signature: `isSafeInteger()`
- Import: `import { isSafeInteger } from "akashatools/validation"`
- Granular import: `import isSafeInteger from "akashatools/validation/isSafeInteger"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is number` — Whether value is a primitive safe integer without coercion.

### isMap

Checks for a Map, including Maps created in another JavaScript realm.

- Signature: `isMap()`
- Import: `import { isMap } from "akashatools/validation"`
- Granular import: `import isMap from "akashatools/validation/isMap"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Map<unknown, unknown>` — Whether the intrinsic Map brand accepts value.

### isSet

Checks for a Set, including Sets created in another JavaScript realm.

- Signature: `isSet()`
- Import: `import { isSet } from "akashatools/validation"`
- Granular import: `import isSet from "akashatools/validation/isSet"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Set<unknown>` — Whether the intrinsic Set brand accepts value.

### isTypedArray

Checks for any typed-array view while excluding DataView. Cross-realm typed arrays are accepted.

- Signature: `isTypedArray()`
- Import: `import { isTypedArray } from "akashatools/validation"`
- Granular import: `import isTypedArray from "akashatools/validation/isTypedArray"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Exclude<ArrayBufferView, DataView>` — Whether value is a typed array rather than DataView.

### isPlainObjectArray

Checks whether every item in an array is a plain object. Empty arrays satisfy the contract; use `isNonEmptyArray` as an additional condition when needed.

- Signature: `isPlainObjectArray()`
- Import: `import { isPlainObjectArray } from "akashatools/validation"`
- Granular import: `import isPlainObjectArray from "akashatools/validation/isPlainObjectArray"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Record<PropertyKey, unknown>[]` — Whether every item is a plain object; empty arrays pass.

### isBlob

Checks for a Blob when the current runtime exposes `globalThis.Blob`. Returns false instead of throwing in runtimes without Blob support.

- Signature: `isBlob()`
- Import: `import { isBlob } from "akashatools/validation"`
- Granular import: `import isBlob from "akashatools/validation/isBlob"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Blob` — Whether current global Blob exists and value is its instance.

### isFile

Checks for a File when the current runtime exposes `globalThis.File`. Returns false instead of throwing in runtimes without File support.

- Signature: `isFile()`
- Import: `import { isFile } from "akashatools/validation"`
- Granular import: `import isFile from "akashatools/validation/isFile"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is File` — Whether current global File exists and value is its instance.

### typeOf

Returns a precise, lowercase runtime type name.

- Signature: `typeOf()`
- Import: `import { typeOf } from "akashatools/validation"`
- Granular import: `import typeOf from "akashatools/validation/typeOf"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Lowercase intrinsic brand, with explicit null/array/nan names.

### isJson

Checks whether a string contains valid JSON. Valid scalar JSON is accepted.

- Signature: `isJson()`
- Import: `import { isJson } from "akashatools/validation"`
- Granular import: `import isJson from "akashatools/validation/isJson"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is string` — Whether value is a string accepted by JSON.parse, including scalar JSON.

### isEmail

Performs pragmatic email syntax validation. It does not attempt deliverability or full RFC mailbox validation.

- Signature: `isEmail()`
- Import: `import { isEmail } from "akashatools/validation"`
- Granular import: `import isEmail from "akashatools/validation/isEmail"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is string` — Whether value satisfies bounded pragmatic syntax only.

### normalizeNanpPhone

Normalizes a North American phone number into ten digits, or returns null. A leading country code of 1 is accepted.

- Signature: `normalizeNanpPhone()`
- Import: `import { normalizeNanpPhone } from "akashatools/validation"`
- Granular import: `import normalizeNanpPhone from "akashatools/validation/normalizeNanpPhone"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | null` — Ten normalized digits, or null for unsupported syntax/ranges.

### formatNanpPhone

Formats a valid North American phone number as `(555) 123-4567`.

- Signature: `formatNanpPhone()`
- Import: `import { formatNanpPhone } from "akashatools/validation"`
- Granular import: `import formatNanpPhone from "akashatools/validation/formatNanpPhone"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | null` — `(555) 123-4567` text, or null when normalization fails.

### validateJsonContract

Validates a value against a useful JSON Schema subset. Supported keywords are `$ref`, `type`, `const`, `enum`, `required`, `properties`, `items`, `additionalProperties`, and `definitions`. Unsupported keywords and malformed schemas throw instead of being silently ignored.

- Signature: `validateJsonContract()`
- Import: `import { validateJsonContract } from "akashatools/validation"`
- Granular import: `import validateJsonContract from "akashatools/validation/validateJsonContract"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string[]` — Deterministic path-prefixed validation errors; empty means valid.

Throws:
- `TypeError` — If schema uses unsupported/malformed behavior.

### assertJsonContract

Asserts a value against the supported JSON Schema subset.

- Signature: `assertJsonContract()`
- Import: `import { assertJsonContract } from "akashatools/validation"`
- Granular import: `import assertJsonContract from "akashatools/validation/assertJsonContract"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T` — Original value after successful validation.

Throws:
- `TypeError` — If schema is invalid or value violates one or more contracts.

## node

Runtime: Node.js 22.17+.

Focused import: `akashatools/node`

### resolveContainedPath

Resolves a relative path beneath a root without accessing the filesystem. Absolute, drive-relative, UNC/rooted, null-byte, and escaping paths are rejected. This lexical check does not inspect symlinks.

- Signature: `resolveContainedPath()`
- Import: `import { resolveContainedPath } from "akashatools/node"`
- Granular import: `import resolveContainedPath from "akashatools/node/resolveContainedPath"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Lexically resolved path beneath root.

Throws:
- `TypeError` — If either argument is not a supported path string.
- `RangeError` — If the resolved path escapes the root.

### resolveExistingContainedPath

Resolves an existing path beneath an existing root, following symlinks for both and rejecting targets whose real path is outside the real root. Filesystem errors such as missing paths and permission failures propagate. The returned string is a checked snapshot; callers performing sensitive mutations must still account for later symlink/time-of-check changes.

- Signature: `resolveExistingContainedPath()`
- Import: `import { resolveExistingContainedPath } from "akashatools/node"`
- Granular import: `import resolveExistingContainedPath from "akashatools/node/resolveExistingContainedPath"`
- Input mutation: Does not mutate inputs; reads filesystem metadata.
- Since: 2.0.0
- Returns: `Promise<string>` — Real target path proven inside the real root at check time.

Throws:
- `TypeError` — If either argument is not a supported path string.
- `RangeError` — If the lexical or real target escapes the root.

### globPaths

Collects paths matching one or more native Node glob patterns in deterministic code-unit order. Duplicate matches are removed and collection stops at an explicit work bound. Matches may be files or directories according to the patterns; this discovery helper performs no filesystem mutation or security containment check.

- Signature: `globPaths()`
- Import: `import { globPaths } from "akashatools/node"`
- Granular import: `import globPaths from "akashatools/node/globPaths"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Promise<string[]>` — Deduplicated matching paths sorted deterministically.

Throws:
- `TypeError` — If patterns, cwd, or options do not match their literal contracts.
- `RangeError` — If a pattern/input bound or maximumMatches is exceeded.
