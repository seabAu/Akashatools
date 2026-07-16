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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Original array value, or a fresh dense fallback copy.

Throws:
- `TypeError` — If fallback is not an array.

### isNonEmptyArray

Checks whether a value is an array containing at least one item.

- Signature: `isNonEmptyArray()`
- Import: `import { isNonEmptyArray } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is T[]` — Whether value is an array with length greater than zero.

### compact

Removes nullish values from an array without removing `0`, `false`, or `""`. Sparse slots are treated as `undefined` and therefore removed.

- Signature: `compact()`
- Import: `import { compact } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense copy containing every non-nullish value in order.

Throws:
- `TypeError` — If values is not an array.

### chunk

Splits an array into same-sized chunks. The final chunk may be shorter. Sparse slots are treated as `undefined` items and returned chunks are dense.

- Signature: `chunk()`
- Import: `import { chunk } from "akashatools/array"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense, ordered copy containing the first value for each SameValueZero key.

Throws:
- `TypeError` — If values is not an array or toKey is not a function.

### flatten

Flattens nested arrays to a requested depth without mutating the input. Semantics match `Array.prototype.flat`: `Infinity` flattens every level and sparse slots are removed at levels that are flattened.

- Signature: `flatten()`
- Import: `import { flatten } from "akashatools/array"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense copy containing item at the bounded index.

Throws:
- `TypeError` — If values is not an array or index is not a safe integer.

### removeFromArray

Removes array items by index, value, or predicate. The input is never mutated. In `auto` mode a function is a predicate, an integer is an index, and every other selector is compared by `Object.is`. Use `mode: "value"` to remove a numeric value instead of treating it as an index. Sparse slots are treated as `undefined` items; predicates receive a dense copy of the input.

- Signature: `removeFromArray()`
- Import: `import { removeFromArray } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense copy with the requested item or matches removed.

Throws:
- `TypeError` — If values, options, mode, all, or the selected selector contract is invalid.

### groupBy

Groups items in a Map, avoiding object-key coercion and prototype collisions. Sparse slots are treated as `undefined` items and group arrays are dense.

- Signature: `groupBy()`
- Import: `import { groupBy } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Map<K, T[]>` — Insertion-ordered keys mapped to dense, ordered value arrays.

Throws:
- `TypeError` — If values is not an array or toKey is not a function.

### countBy

Counts items by a derived key without coercing key identity.

- Signature: `countBy()`
- Import: `import { countBy } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Map<unknown, number>` — Insertion-ordered SameValueZero key counts.

Throws:
- `TypeError` — If values is not an array or toKey is not a function.

### partition

Splits items into matching and non-matching arrays while preserving order. Sparse slots are treated as `undefined` items. Callback errors propagate.

- Signature: `partition()`
- Import: `import { partition } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `[T[], T[]]` — Pair of dense arrays: matches first, non-matches second.

Throws:
- `TypeError` — If values is not an array or predicate is not a function.

### intersection

Returns unique values present in every input array. Sparse slots are treated as `undefined` items and the returned array is dense.

- Signature: `intersection()`
- Import: `import { intersection } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense unique values from the first array present in every later array.

Throws:
- `TypeError` — If any argument is not an array.

### range

Creates an end-exclusive numeric range, like Python's `range`.

- Signature: `range()`
- Import: `import { range } from "akashatools/array"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown[][]` — Dense positional rows through the shortest input length.

Throws:
- `TypeError` — If any argument is not an array.

### shuffle

Returns a shuffled copy using Fisher-Yates. A random source can be injected for deterministic tests or seeded applications. Sparse slots are treated as `undefined` items and the returned array is dense.

- Signature: `shuffle()`
- Import: `import { shuffle } from "akashatools/array"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Readonly<{load: (key: K) => Promise<V>, invalidate: (key: K) => boolean, invalidateAll: () => number, readonly size: number}>` — Frozen keyed controller; invalidation reports whether/count of retained entries removed.

Throws:
- `TypeError` — If loader/options/callbacks are invalid or shouldCache does not return a boolean.
- `RangeError` — If ttl, maximumSize, or a clock result is outside its documented range.

### mapSettledWithConcurrency

Maps values with a fixed concurrency ceiling. Results retain input order and individual failures are represented like `Promise.allSettled`.

- Signature: `mapSettledWithConcurrency()`
- Import: `import { mapSettledWithConcurrency } from "akashatools/async"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Values from fulfilled entries only.

Throws:
- `TypeError` — If results is not an array.

### delay

Waits for a duration and optionally supports cancellation.

- Signature: `delay()`
- Import: `import { delay } from "akashatools/async"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense copied array containing the upserted value.

Throws:
- `TypeError` — If values, toKey, or prepend does not match its contract.

### excludeBy

Excludes values whose derived identities occur in a Set. Numeric keys are never treated as indices. Sparse slots are treated as `undefined` items and returned arrays are dense.

- Signature: `excludeBy()`
- Import: `import { excludeBy } from "akashatools/collection"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense copied array without excluded identities.

Throws:
- `TypeError` — If values, excluded, or toKey does not match its contract.

### upsertById

Inserts or replaces an object by its `id` property.

- Signature: `upsertById()`
- Import: `import { upsertById } from "akashatools/collection"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Copied array without objects carrying excluded ids.
- Deprecated: Prefer `excludeBy` with an explicit key selector.

Throws:
- `TypeError` — If delegated exclusion arguments are invalid.

## date

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/date`

### isValidDate

Checks whether a value represents a valid Date object.

- Signature: `isValidDate()`
- Import: `import { isValidDate } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Date` — Whether Date.prototype can read a finite timestamp from value.

### toDate

Converts a Date-compatible value to a fresh Date or returns null.

- Signature: `toDate()`
- Import: `import { toDate } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Date | null` — Fresh valid Date, or null for absent/invalid input.

### daysInMonth

Returns the number of days in a local calendar month.

- Signature: `daysInMonth()`
- Import: `import { daysInMonth } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Number of local calendar days in the selected month.

Throws:
- `RangeError` — If year/month fields are invalid or outside 0-11 for the month.

### startOfLocalDay

Returns a new Date at the beginning of the local calendar day.

- Signature: `startOfLocalDay()`
- Import: `import { startOfLocalDay } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Date` — Fresh Date set to 00:00:00.000 in the local timezone.

Throws:
- `TypeError` — If value does not represent a valid Date.

### localDateKey

Returns a stable local date key in YYYY-MM-DD format.

- Signature: `localDateKey()`
- Import: `import { localDateKey } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Local calendar key formatted `YYYY-MM-DD`.

Throws:
- `TypeError` — If value does not represent a valid Date.

### differenceInLocalDays

Calculates whole local calendar-day boundaries between two values. This uses UTC representations of local calendar fields to avoid daylight-saving shifts.

- Signature: `differenceInLocalDays()`
- Import: `import { differenceInLocalDays } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Signed count of crossed local calendar-day boundaries.

Throws:
- `TypeError` — If either value does not represent a valid Date.

### isSameLocalDay

Checks whether two values fall on the same local calendar day.

- Signature: `isSameLocalDay()`
- Import: `import { isSameLocalDay } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether both values share one local calendar date.

Throws:
- `TypeError` — If either value does not represent a valid Date.

### isToday

Checks whether a value falls on today's local calendar day.

- Signature: `isToday()`
- Import: `import { isToday } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether value shares now's local calendar date.

Throws:
- `TypeError` — If either value does not represent a valid Date.

### toUnixSeconds

Converts a date value to whole Unix seconds.

- Signature: `toUnixSeconds()`
- Import: `import { toUnixSeconds } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Truncated whole seconds since the Unix epoch.

Throws:
- `TypeError` — If value does not represent a valid Date.

### fromUnixSeconds

Converts Unix seconds to a Date.

- Signature: `fromUnixSeconds()`
- Import: `import { fromUnixSeconds } from "akashatools/date"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether value satisfies both range boundaries.

Throws:
- `TypeError | RangeError` — If options or Date/range boundaries are invalid.

### clockTimeToMinutes

Parses a 24-hour `HH:mm` clock time into minutes after midnight.

- Signature: `clockTimeToMinutes()`
- Import: `import { clockTimeToMinutes } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number | null` — Minutes after midnight, or null for invalid syntax/ranges.

### minutesToClockTime

Formats minutes after midnight as 24-hour `HH:mm`, wrapping across days.

- Signature: `minutesToClockTime()`
- Import: `import { minutesToClockTime } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Zero-padded 24-hour `HH:mm` clock text.

Throws:
- `TypeError` — If minutes is not finite.

### clock12To24

Converts a 12-hour clock string such as `2:05 PM` to `14:05`.

- Signature: `clock12To24()`
- Import: `import { clock12To24 } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | null` — Zero-padded 24-hour text, or null for invalid input.

### clock24To12

Converts a `HH:mm` clock string to a 12-hour form such as `2:05 PM`.

- Signature: `clock24To12()`
- Import: `import { clock24To12 } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | null` — 12-hour clock text, or null for invalid input.

### formatDate

Formats a date using `Intl.DateTimeFormat`.

- Signature: `formatDate()`
- Import: `import { formatDate } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Locale-formatted date text.

Throws:
- `TypeError | RangeError` — If value, locales, or options are invalid.

### formatDateTime

Formats a date and time using `Intl.DateTimeFormat`.

- Signature: `formatDateTime()`
- Import: `import { formatDateTime } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Locale-formatted date-and-time text.

Throws:
- `TypeError | RangeError` — If value, locales, or options are invalid.

### formatDuration

Formats a non-negative minute duration as compact, locale-independent hours and minutes. Fractional input uses an explicit whole-minute rounding policy; zero components are omitted except for the canonical `0m` result.

- Signature: `formatDuration()`
- Import: `import { formatDuration } from "akashatools/date"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0

### request

Performs one HTTP(S) request without application auth, envelopes, delays, or automatic retries. Bodies are size-bounded unless `responseType: "response"` transfers raw response ownership to the caller. Empty JSON bodies return null.

- Signature: `request()`
- Import: `import { request } from "akashatools/http"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Record<string, string>` — Plain copied record with sensitive values replaced by `[REDACTED]`.

Throws:
- `TypeError` — If additionalSensitiveNames is not an array of strings or Headers rejects the input.

### parseContentDispositionFilename

Extracts a bounded cross-platform-safe filename suggestion from an HTTP `Content-Disposition` value. A valid RFC extended `filename*` takes precedence over `filename`; malformed candidates fall through to the next candidate and then an optional fallback. Path components, controls, bidi overrides, reserved characters, and Windows device names are neutralized.

- Signature: `parseContentDispositionFilename()`
- Import: `import { parseContentDispositionFilename } from "akashatools/http"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | undefined` — Safe filename suggestion, normalized fallback, or undefined.

Throws:
- `TypeError` — If value, options, or fallback violates its literal contract.
- `RangeError` — If a length bound is invalid or the header exceeds maximumHeaderLength.

## number

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/number`

### clamp

Constrains a finite number to an inclusive range.

- Signature: `clamp()`
- Import: `import { clamp } from "akashatools/number"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Arithmetic sum, which can overflow if the result is not representable.

Throws:
- `TypeError` — If any input is not finite.

### subtract

Subtracts each subsequent value from the first.

- Signature: `subtract()`
- Import: `import { subtract } from "akashatools/number"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Arithmetic difference, which can overflow if the result is not representable.

Throws:
- `TypeError` — If any input is not finite.

### distance

Returns the absolute distance between two finite numbers.

- Signature: `distance()`
- Import: `import { distance } from "akashatools/number"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Absolute arithmetic distance, possibly Infinity after numeric overflow.

Throws:
- `TypeError` — If either input is not finite.

### distance2d

Calculates Euclidean distance between two `[x, y]` coordinates.

- Signature: `distance2d()`
- Import: `import { distance2d } from "akashatools/number"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Euclidean distance, possibly Infinity when no finite result is representable.

Throws:
- `TypeError` — If either coordinate is not a two-item array of finite numbers.

### fibonacci

Returns the nth Fibonacci number using an iterative O(n) implementation.

- Signature: `fibonacci()`
- Import: `import { fibonacci } from "akashatools/number"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Exactly representable Fibonacci number at index.

Throws:
- `RangeError` — If index is outside the supported safe-integer range.

### toBinary

Converts a safe integer to a binary string.

- Signature: `toBinary()`
- Import: `import { toBinary } from "akashatools/number"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Signed binary digits without a radix prefix.

Throws:
- `TypeError` — If value is not a safe integer.

### formatBytes

Formats a non-negative byte quantity with deterministic decimal or IEC binary units. Values are rounded only for presentation and may promote into the next unit when rounding reaches its base.

- Signature: `formatBytes()`
- Import: `import { formatBytes } from "akashatools/number"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Record<PropertyKey, unknown>` — Whether value has the intrinsic Object constructor or null prototype.

### parsePath

Parses a safe dot/bracket property path. Prototype-mutating segments are rejected to prevent prototype-pollution vulnerabilities.

- Signature: `parsePath()`
- Import: `import { parsePath } from "akashatools/object"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown | T` — Existing leaf value (including undefined) or fallback.

Throws:
- `TypeError | RangeError` — If the path contract is invalid.

### hasAtPath

Checks whether every segment of a nested own-property path exists.

- Signature: `hasAtPath()`
- Import: `import { hasAtPath } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether every path segment exists, even if the leaf is undefined.

Throws:
- `TypeError | RangeError` — If the path contract is invalid.

### setAtPath

Sets a nested value while structurally sharing untouched objects and arrays. Missing containers are inferred from the following path segment. If an existing leaf is `Object.is`-identical to `nextValue`, the original root is returned without allocating replacement ancestors.

- Signature: `setAtPath()`
- Import: `import { setAtPath } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T` — Structurally shared root, or the original root for an identical leaf.

Throws:
- `TypeError | RangeError` — If the path contract is invalid.

### traverseObject

Traverses own enumerable data properties of plain objects and arrays in deterministic depth-first preorder. Results include paths and parents. Repeated/circular objects appear as entries but are not entered again. Accessors and symbols are skipped; built-in collections, typed arrays, Dates, and class instances are leaf values. Sparse array slots are absent properties.

- Signature: `traverseObject()`
- Import: `import { traverseObject } from "akashatools/object"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `ObjectTraversalEntry | undefined` — First accepted entry or undefined.

Throws:
- `TypeError` — If the root, predicate, or options are invalid.
- `RangeError` — If traversal would exceed `maxNodes` before a match.

### pick

Returns an object containing selected own properties.

- Signature: `pick()`
- Import: `import { pick } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Partial<T>` — New ordinary object containing selected own values.

Throws:
- `TypeError` — If value is not object-like or keys is not an array.

### omit

Returns a shallow copy without the selected own properties.

- Signature: `omit()`
- Import: `import { omit } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Partial<T>` — New ordinary object without selected enumerable string keys.

Throws:
- `TypeError` — If value is not object-like or keys is not an array.

### deepClone

Deeply clones structured-cloneable values, including circular references, Maps, Sets, Dates, typed arrays, and transferable values.

- Signature: `deepClone()`
- Import: `import { deepClone } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T` — Independent structured clone preserving supported built-in types/cycles.

Throws:
- `DOMException` — If value or transfer options cannot be structured-cloned.

### cloneJson

Clones strict plain JSON data without invoking `toJSON` methods or accessors. The result uses ordinary objects, safely preserves all string keys, and duplicates shared references as JSON serialization would. Cycles, sparse or customized arrays, non-finite numbers, symbols, and non-plain objects are rejected rather than coerced.

- Signature: `cloneJson()`
- Import: `import { cloneJson } from "akashatools/object"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Cryptographically secure UUID string supplied by Web Crypto.

Throws:
- `Error` — If the runtime does not provide `crypto.randomUUID`.

### secureRandomString

Returns a cryptographically secure string using rejection sampling to avoid modulo bias. The alphabet must contain 2-256 unique Unicode code points.

- Signature: `secureRandomString()`
- Import: `import { secureRandomString } from "akashatools/random"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense stably sorted copy.

Throws:
- `TypeError` — If values, selector, options, or comparator results are invalid.

### sortByMany

Returns a stable copy ordered by multiple selector criteria. Criteria are evaluated once per item and applied in array order. Sparse slots are treated as `undefined` items and the result is dense.

- Signature: `sortByMany()`
- Import: `import { sortByMany } from "akashatools/sort"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]` — Dense stably sorted copy using criteria in priority order.

Throws:
- `TypeError` — If values, criteria, selectors, policies, or comparator results are invalid.

### createCollatorComparator

Creates a reusable locale-aware comparator. Reusing the returned function avoids reconstructing collator options during repeated comparisons.

- Signature: `createCollatorComparator()`
- Import: `import { createCollatorComparator } from "akashatools/sort"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `(left: unknown, right: unknown) => number` — Reusable comparator that stringifies values.

Throws:
- `RangeError` — If Intl rejects a locale or option value.

### compareValues

Compares strings, numbers, bigints, booleans, and Dates with nullish values ordered last. Other values fall back to locale-aware string comparison. Invalid Dates and NaN sort after their valid peers. Numeric and Date results are normalized to -1, 0, or 1 so extreme values remain valid comparators.

- Signature: `compareValues()`
- Import: `import { compareValues } from "akashatools/sort"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Negative, zero, or positive ordering signal.

Throws:
- `RangeError` — If the runtime's default Intl.Collator cannot be constructed.

### compareNumericOrder

Compares objects across the first available finite numeric ordering key. Missing and invalid order values sort last. Number-like strings are coerced intentionally for compatibility with persisted legacy ordering fields.

- Signature: `compareNumericOrder()`
- Import: `import { compareNumericOrder } from "akashatools/sort"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Numeric ordering signal; zero when all normalized fields tie.

Throws:
- `TypeError` — If either value is not an object or keys is not an array.

### sortByNumericOrder

Returns a stable copy ordered by common numeric position fields.

- Signature: `sortByNumericOrder()`
- Import: `import { sortByNumericOrder } from "akashatools/sort"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — New string, or an empty string for empty input.

Throws:
- `TypeError | RangeError` — If value or locales is invalid.

### kebabCase

Converts words and common identifier styles to kebab-case.

- Signature: `kebabCase()`
- Import: `import { kebabCase } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Lowercase hyphen-delimited words.

Throws:
- `TypeError` — If value is not a string.

### camelCase

Converts words and common identifier styles to camelCase.

- Signature: `camelCase()`
- Import: `import { camelCase } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Lower camel-cased identifier.

Throws:
- `TypeError` — If value is not a string.

### pascalCase

Converts words and common identifier styles to PascalCase.

- Signature: `pascalCase()`
- Import: `import { pascalCase } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Upper camel-cased identifier.

Throws:
- `TypeError` — If value is not a string.

### sentenceCase

Converts an identifier into a human-readable sentence.

- Signature: `sentenceCase()`
- Import: `import { sentenceCase } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Space-delimited lowercase words with the first code point uppercased.

Throws:
- `TypeError` — If value is not a string.

### includesText

Checks for literal text with optional case sensitivity.

- Signature: `includesText()`
- Import: `import { includesText } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether search occurs in value.

Throws:
- `TypeError | RangeError` — If strings, caseSensitive, or locales are invalid.

### replaceMany

Applies literal string replacements in insertion order. Unlike a RegExp-based implementation, replacement keys are never interpreted as regex syntax.

- Signature: `replaceMany()`
- Import: `import { replaceMany } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — String after every ordered literal replacement.

Throws:
- `TypeError` — If value, the replacement container, or any pair is not string-based.

### replaceRegex

Applies a caller-provided regular expression without mutating its `lastIndex`. The expression is cloned with the same source and flags. This function does not make an unsafe or backtracking-prone caller pattern safe.

- Signature: `replaceRegex()`
- Import: `import { replaceRegex } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Replaced string without changing pattern.lastIndex.

Throws:
- `TypeError | SyntaxError` — If arguments are invalid or the cloned expression cannot be constructed.

### longestStringLength

Returns the greatest string length among values, object keys, or a scalar.

- Signature: `longestStringLength()`
- Import: `import { longestStringLength } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Greatest UTF-16 code-unit length; nullish scalar entries count as empty.

### utf8ByteLength

Measures the UTF-8 encoding length of a string without allocating an encoded byte array. Unpaired UTF-16 surrogates count as the three-byte replacement character, matching `TextEncoder` and web-platform string encoding.

- Signature: `utf8ByteLength()`
- Import: `import { utf8ByteLength } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Number of bytes in the UTF-8 representation.

Throws:
- `TypeError` — If value is not a string.

### countWords

Counts whitespace-delimited tokens without language-specific word-breaking guesses. Unicode whitespace separates tokens; punctuation remains part of the surrounding token.

- Signature: `countWords()`
- Import: `import { countWords } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number` — Number of non-whitespace runs.

Throws:
- `TypeError` — If value is not a string.

### splitTextByLimits

Splits text under byte, word, and optional caller-defined cost limits while preferring paragraph, sentence, clause, and word boundaries in that order. The function never normalizes text: joining the returned chunks exactly recreates the input, including line endings and whitespace. An empty string returns an empty array.

- Signature: `splitTextByLimits()`
- Import: `import { splitTextByLimits } from "akashatools/string"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Non-empty conservative ASCII filename stem.

Throws:
- `TypeError | RangeError` — If strings or maximumLength are invalid.

### slugify

Creates a bounded ASCII URL/path slug with Unicode compatibility normalization. Empty normalized input returns a normalized fallback.

- Signature: `slugify()`
- Import: `import { slugify } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Non-empty lowercase ASCII slug.

Throws:
- `TypeError | RangeError` — If strings or maximumLength are invalid.

### escapeHtml

Encodes five HTML-significant characters for an HTML text context. This is not HTML sanitization and does not make markup, URLs, CSS, or scripts safe.

- Signature: `escapeHtml()`
- Import: `import { escapeHtml } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Text with ampersand, brackets, quotes, and apostrophes encoded.

### prettyJson

Serializes a JSON-compatible value with human-readable indentation.

- Signature: `prettyJson()`
- Import: `import { prettyJson } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Serialized JSON text.

Throws:
- `TypeError` — If serialization fails or returns undefined.

### stableJson

Serializes strict plain JSON with recursively sorted object keys. Key order is Unicode code-unit order and is therefore independent of locale and object insertion history. Enumerable accessors, symbol keys, sparse arrays, non-finite numbers, unsupported values, and cycles are rejected rather than coerced or invoked.

- Signature: `stableJson()`
- Import: `import { stableJson } from "akashatools/string"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is T` — Whether value is neither null nor undefined; other falsy values pass.

### isBlank

Checks for nullish values or strings containing only whitespace.

- Signature: `isBlank()`
- Import: `import { isBlank } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — True only for null, undefined, or whitespace-only strings.

### isEmpty

Checks common empty values: blank strings, empty arrays, empty Maps/Sets, and plain objects without enumerable own properties. Zero and false are not empty.

- Signature: `isEmpty()`
- Import: `import { isEmpty } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean` — Whether value matches one explicitly supported empty shape.

### isFiniteNumber

Checks whether a value is a finite primitive number.

- Signature: `isFiniteNumber()`
- Import: `import { isFiniteNumber } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is number` — Whether value is a primitive finite number without coercion.

### isSafeInteger

Checks whether a value is a safe primitive integer.

- Signature: `isSafeInteger()`
- Import: `import { isSafeInteger } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is number` — Whether value is a primitive safe integer without coercion.

### isMap

Checks for a Map, including Maps created in another JavaScript realm.

- Signature: `isMap()`
- Import: `import { isMap } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Map<unknown, unknown>` — Whether the intrinsic Map brand accepts value.

### isSet

Checks for a Set, including Sets created in another JavaScript realm.

- Signature: `isSet()`
- Import: `import { isSet } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Set<unknown>` — Whether the intrinsic Set brand accepts value.

### isTypedArray

Checks for any typed-array view while excluding DataView. Cross-realm typed arrays are accepted.

- Signature: `isTypedArray()`
- Import: `import { isTypedArray } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Exclude<ArrayBufferView, DataView>` — Whether value is a typed array rather than DataView.

### isPlainObjectArray

Checks whether every item in an array is a plain object. Empty arrays satisfy the contract; use `isNonEmptyArray` as an additional condition when needed.

- Signature: `isPlainObjectArray()`
- Import: `import { isPlainObjectArray } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Record<PropertyKey, unknown>[]` — Whether every item is a plain object; empty arrays pass.

### isBlob

Checks for a Blob when the current runtime exposes `globalThis.Blob`. Returns false instead of throwing in runtimes without Blob support.

- Signature: `isBlob()`
- Import: `import { isBlob } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Blob` — Whether current global Blob exists and value is its instance.

### isFile

Checks for a File when the current runtime exposes `globalThis.File`. Returns false instead of throwing in runtimes without File support.

- Signature: `isFile()`
- Import: `import { isFile } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is File` — Whether current global File exists and value is its instance.

### typeOf

Returns a precise, lowercase runtime type name.

- Signature: `typeOf()`
- Import: `import { typeOf } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string` — Lowercase intrinsic brand, with explicit null/array/nan names.

### isJson

Checks whether a string contains valid JSON. Valid scalar JSON is accepted.

- Signature: `isJson()`
- Import: `import { isJson } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is string` — Whether value is a string accepted by JSON.parse, including scalar JSON.

### isEmail

Performs pragmatic email syntax validation. It does not attempt deliverability or full RFC mailbox validation.

- Signature: `isEmail()`
- Import: `import { isEmail } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is string` — Whether value satisfies bounded pragmatic syntax only.

### normalizeNanpPhone

Normalizes a North American phone number into ten digits, or returns null. A leading country code of 1 is accepted.

- Signature: `normalizeNanpPhone()`
- Import: `import { normalizeNanpPhone } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | null` — Ten normalized digits, or null for unsupported syntax/ranges.

### formatNanpPhone

Formats a valid North American phone number as `(555) 123-4567`.

- Signature: `formatNanpPhone()`
- Import: `import { formatNanpPhone } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | null` — `(555) 123-4567` text, or null when normalization fails.

### validateJsonContract

Validates a value against a useful JSON Schema subset. Supported keywords are `$ref`, `type`, `const`, `enum`, `required`, `properties`, `items`, `additionalProperties`, and `definitions`. Unsupported keywords and malformed schemas throw instead of being silently ignored.

- Signature: `validateJsonContract()`
- Import: `import { validateJsonContract } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string[]` — Deterministic path-prefixed validation errors; empty means valid.

Throws:
- `TypeError` — If schema uses unsupported/malformed behavior.

### assertJsonContract

Asserts a value against the supported JSON Schema subset.

- Signature: `assertJsonContract()`
- Import: `import { assertJsonContract } from "akashatools/validation"`
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
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Promise<string[]>` — Deduplicated matching paths sorted deterministically.

Throws:
- `TypeError` — If patterns, cwd, or options do not match their literal contracts.
- `RangeError` — If a pattern/input bound or maximumMatches is exceeded.
