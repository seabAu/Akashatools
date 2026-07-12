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

- Signature: `asArray(value, fallback?)`
- Import: `import { asArray } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |
| `[fallback=[]]` | `readonly T[]` | Not documented. |

### isNonEmptyArray

Checks whether a value is an array containing at least one item.

- Signature: `isNonEmptyArray(value)`
- Import: `import { isNonEmptyArray } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is T[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### compact

Removes nullish values from an array without removing `0`, `false`, or `""`. Sparse slots are treated as `undefined` and therefore removed.

- Signature: `compact(values)`
- Import: `import { compact } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `values` | `readonly (T \| null \| undefined)[]` | Not documented. |

### chunk

Splits an array into same-sized chunks. The final chunk may be shorter. Sparse slots are treated as `undefined` items and returned chunks are dense.

- Signature: `chunk(values, size)`
- Import: `import { chunk } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[][]`

| Parameter | Type | Description |
| --- | --- | --- |
| `values` | `readonly T[]` | Not documented. |
| `size` | `number` | Not documented. |

### unique

Returns the first item for each unique key, preserving input order. Sparse slots are treated as `undefined` items and the returned array is dense.

- Signature: `unique(values, toKey?)`
- Import: `import { unique } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `values` | `readonly T[]` | Not documented. |
| `[toKey]` | `(value: T, index: number) => unknown` | Not documented. |

### flatten

Flattens nested arrays to a requested depth without mutating the input. Semantics match `Array.prototype.flat`: `Infinity` flattens every level and sparse slots are removed at levels that are flattened.

- Signature: `flatten(values, depth?)`
- Import: `import { flatten } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `values` | `readonly T[]` | Not documented. |
| `[depth=Infinity]` | `number` | Not documented. |

Throws:
- `TypeError` — If `values` is not an array or depth is not an integer.
- `RangeError` — If depth is negative or exceeds the safe-integer range.

### moveItem

Moves one item to another position without mutating the input. Sparse slots are treated as `undefined` items and the returned array is dense.

- Signature: `moveItem(values, fromIndex, toIndex)`
- Import: `import { moveItem } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `values` | `readonly T[]` | Not documented. |
| `fromIndex` | `number` | Not documented. |
| `toIndex` | `number` | Not documented. |

### insertItem

Inserts an item at a bounded index without mutating the input. Indices below zero insert at the start and indices beyond the length append. Sparse slots are treated as `undefined` items and the returned array is dense.

- Signature: `insertItem(values, index, item)`
- Import: `import { insertItem } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `values` | `readonly T[]` | Not documented. |
| `index` | `number` | Not documented. |
| `item` | `T` | Not documented. |

### removeFromArray

Removes array items by index, value, or predicate. The input is never mutated. In `auto` mode a function is a predicate, an integer is an index, and every other selector is compared by `Object.is`. Use `mode: "value"` to remove a numeric value instead of treating it as an index. Sparse slots are treated as `undefined` items; predicates receive a dense copy of the input.

- Signature: `removeFromArray(values, selector, options?)`
- Import: `import { removeFromArray } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `values` | `readonly T[]` | Not documented. |
| `selector` | `number \| T \| ((value: T, index: number, values: readonly T[]) => boolean)` | Not documented. |
| `[options]` | `{mode?: RemovalMode, all?: boolean}` | Not documented. |

### groupBy

Groups items in a Map, avoiding object-key coercion and prototype collisions. Sparse slots are treated as `undefined` items and group arrays are dense.

- Signature: `groupBy(values, toKey)`
- Import: `import { groupBy } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Map<K, T[]>`

| Parameter | Type | Description |
| --- | --- | --- |
| `values` | `readonly T[]` | Not documented. |
| `toKey` | `(value: T, index: number) => K` | Not documented. |

### countBy

Counts items by a derived key without coercing key identity.

- Signature: `countBy(values, toKey?)`
- Import: `import { countBy } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Map<unknown, number>`

| Parameter | Type | Description |
| --- | --- | --- |
| `values` | `readonly unknown[]` | Not documented. |
| `[toKey]` | `(value: unknown, index: number, values: readonly unknown[]) => unknown` | Not documented. |

### partition

Splits items into matching and non-matching arrays while preserving order. Sparse slots are treated as `undefined` items. Callback errors propagate.

- Signature: `partition(values, predicate)`
- Import: `import { partition } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `[T[], T[]]`

| Parameter | Type | Description |
| --- | --- | --- |
| `values` | `readonly T[]` | Not documented. |
| `predicate` | `(value: T, index: number, values: readonly T[]) => boolean` | Not documented. |

### intersection

Returns unique values present in every input array. Sparse slots are treated as `undefined` items and the returned array is dense.

- Signature: `intersection(arrays)`
- Import: `import { intersection } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `arrays` | `...readonly T[]` | Not documented. |

### range

Creates an end-exclusive numeric range, like Python's `range`.

- Signature: `range(start, end?, step?)`
- Import: `import { range } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `start` | `number` | Not documented. |
| `[end]` | `number` | Not documented. |
| `[step]` | `number` | Not documented. |

### zip

Combines arrays by position, stopping at the shortest input. Sparse slots are read as `undefined` and every returned row is dense.

- Signature: `zip(arrays)`
- Import: `import { zip } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown[][]`

| Parameter | Type | Description |
| --- | --- | --- |
| `arrays` | `...readonly unknown[]` | Not documented. |

### shuffle

Returns a shuffled copy using Fisher-Yates. A random source can be injected for deterministic tests or seeded applications. Sparse slots are treated as `undefined` items and the returned array is dense.

- Signature: `shuffle(values, random?)`
- Import: `import { shuffle } from "akashatools/array"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `values` | `readonly T[]` | Not documented. |
| `[random=Math.random]` | `() => number` | Not documented. |

## async

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/async`

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

- Signature: `isValidDate(value)`
- Import: `import { isValidDate } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Date`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### toDate

Converts a Date-compatible value to a fresh Date or returns null.

- Signature: `toDate(value)`
- Import: `import { toDate } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Date | null`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `Date \| string \| number \| null \| undefined` | Not documented. |

### daysInMonth

Returns the number of days in a local calendar month.

- Signature: `daysInMonth(yearOrDate, monthIndex?)`
- Import: `import { daysInMonth } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number`

| Parameter | Type | Description |
| --- | --- | --- |
| `yearOrDate` | `number \| Date` | Not documented. |
| `[monthIndex]` | `number` | Not documented. |

### startOfLocalDay

Returns a new Date at the beginning of the local calendar day.

- Signature: `startOfLocalDay(value)`
- Import: `import { startOfLocalDay } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Date`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `Date \| string \| number` | Not documented. |

### localDateKey

Returns a stable local date key in YYYY-MM-DD format.

- Signature: `localDateKey(value)`
- Import: `import { localDateKey } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `Date \| string \| number` | Not documented. |

### differenceInLocalDays

Calculates whole local calendar-day boundaries between two values. This uses UTC representations of local calendar fields to avoid daylight-saving shifts.

- Signature: `differenceInLocalDays(later, earlier)`
- Import: `import { differenceInLocalDays } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number`

| Parameter | Type | Description |
| --- | --- | --- |
| `later` | `Date \| string \| number` | Not documented. |
| `earlier` | `Date \| string \| number` | Not documented. |

### isSameLocalDay

Checks whether two values fall on the same local calendar day.

- Signature: `isSameLocalDay(left, right)`
- Import: `import { isSameLocalDay } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean`

| Parameter | Type | Description |
| --- | --- | --- |
| `left` | `Date \| string \| number` | Not documented. |
| `right` | `Date \| string \| number` | Not documented. |

### isToday

Checks whether a value falls on today's local calendar day.

- Signature: `isToday(value, now?)`
- Import: `import { isToday } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `Date \| string \| number` | Not documented. |
| `[now=new Date()]` | `Date` | Not documented. |

### toUnixSeconds

Converts a date value to whole Unix seconds.

- Signature: `toUnixSeconds(value)`
- Import: `import { toUnixSeconds } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `Date \| string \| number` | Not documented. |

### fromUnixSeconds

Converts Unix seconds to a Date.

- Signature: `fromUnixSeconds(seconds)`
- Import: `import { fromUnixSeconds } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Date`

| Parameter | Type | Description |
| --- | --- | --- |
| `seconds` | `number` | Not documented. |

### normalizeInstantRange

Normalizes two Date-compatible boundaries into fresh Date objects. Boundaries represent absolute instants and are never swapped implicitly.

- Signature: `normalizeInstantRange(start, end)`
- Import: `import { normalizeInstantRange } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `{start: Date, end: Date}`

| Parameter | Type | Description |
| --- | --- | --- |
| `start` | `Date \| string \| number` | Not documented. |
| `end` | `Date \| string \| number` | Not documented. |

### isWithinInstantRange

Checks whether a Date-compatible value is within an absolute instant range. The default range is start-inclusive and end-exclusive.

- Signature: `isWithinInstantRange(value, start, end, options?)`
- Import: `import { isWithinInstantRange } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `Date \| string \| number` | Not documented. |
| `start` | `Date \| string \| number` | Not documented. |
| `end` | `Date \| string \| number` | Not documented. |
| `[options]` | `{startInclusive?: boolean, endInclusive?: boolean}` | Not documented. |

### clockTimeToMinutes

Parses a 24-hour `HH:mm` clock time into minutes after midnight.

- Signature: `clockTimeToMinutes(value)`
- Import: `import { clockTimeToMinutes } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number | null`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Not documented. |

### minutesToClockTime

Formats minutes after midnight as 24-hour `HH:mm`, wrapping across days.

- Signature: `minutesToClockTime(minutes)`
- Import: `import { minutesToClockTime } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `minutes` | `number` | Not documented. |

### clock12To24

Converts a 12-hour clock string such as `2:05 PM` to `14:05`.

- Signature: `clock12To24(value)`
- Import: `import { clock12To24 } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | null`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Not documented. |

### clock24To12

Converts a `HH:mm` clock string to a 12-hour form such as `2:05 PM`.

- Signature: `clock24To12(value)`
- Import: `import { clock24To12 } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | null`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Not documented. |

### formatDate

Formats a date using `Intl.DateTimeFormat`.

- Signature: `formatDate(value, locales?, options?)`
- Import: `import { formatDate } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `Date \| string \| number` | Not documented. |
| `[locales]` | `Intl.LocalesArgument` | Not documented. |
| `[options]` | `Intl.DateTimeFormatOptions` | Not documented. |

### formatDateTime

Formats a date and time using `Intl.DateTimeFormat`.

- Signature: `formatDateTime(value, locales?, options?)`
- Import: `import { formatDateTime } from "akashatools/date"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `Date \| string \| number` | Not documented. |
| `[locales]` | `Intl.LocalesArgument` | Not documented. |
| `[options]` | `Intl.DateTimeFormatOptions` | Not documented. |

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

- Signature: `request(input, options?)`
- Import: `import { request } from "akashatools/http"`
- Input mutation: Does not mutate inputs; performs one network request.
- Since: 2.0.0
- Returns: `Promise<T>`

| Parameter | Type | Description |
| --- | --- | --- |
| `input` | `string \| URL` | Not documented. |
| `[options]` | `RequestInit & { responseType?: "auto" \| "json" \| "text" \| "blob" \| "arrayBuffer" \| "response", timeoutMs?: number, maxResponseBytes?: number, includeErrorBody?: boolean, sensitiveHeaderNames?: readonly string[], fetchFn?: typeof fetch }` | Not documented. |

Throws:
- `HttpError` — For HTTP status, network, abort, timeout, size, or JSON parsing failures.

### redactHeaders

Copies headers while replacing common credential/cookie values with `[REDACTED]`. Names are normalized by the platform Headers implementation.

- Signature: `redactHeaders(headers, additionalSensitiveNames?)`
- Import: `import { redactHeaders } from "akashatools/http"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Record<string, string>`

| Parameter | Type | Description |
| --- | --- | --- |
| `headers` | `HeadersInit` | Not documented. |
| `[additionalSensitiveNames]` | `readonly string[]` | Not documented. |

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

- Signature: `isPlainObject(value)`
- Import: `import { isPlainObject } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Record<PropertyKey, unknown>`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### parsePath

Parses a safe dot/bracket property path. Prototype-mutating segments are rejected to prevent prototype-pollution vulnerabilities.

- Signature: `parsePath(path)`
- Import: `import { parsePath } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `(string | number)[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `path` | `string \| readonly (string \| number)[]` | Not documented. |

Throws:
- `TypeError` — If syntax or a segment is invalid or prototype-mutating.
- `RangeError` — If the path exceeds the length or segment limits.

### getAtPath

Reads an own property at a nested path, returning a fallback only when the path is absent. An existing `undefined` value is returned as-is.

- Signature: `getAtPath(value, path, fallback?)`
- Import: `import { getAtPath } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `unknown | T`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |
| `path` | `string \| readonly (string \| number)[]` | Not documented. |
| `[fallback]` | `T` | Not documented. |

Throws:
- `TypeError | RangeError` — If the path contract is invalid.

### hasAtPath

Checks whether every segment of a nested own-property path exists.

- Signature: `hasAtPath(value, path)`
- Import: `import { hasAtPath } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |
| `path` | `string \| readonly (string \| number)[]` | Not documented. |

Throws:
- `TypeError | RangeError` — If the path contract is invalid.

### setAtPath

Sets a nested value while structurally sharing untouched objects and arrays. Missing containers are inferred from the following path segment. If an existing leaf is `Object.is`-identical to `nextValue`, the original root is returned without allocating replacement ancestors.

- Signature: `setAtPath(value, path, nextValue)`
- Import: `import { setAtPath } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `T` | Not documented. |
| `path` | `string \| readonly (string \| number)[]` | Not documented. |
| `nextValue` | `unknown` | Not documented. |

Throws:
- `TypeError | RangeError` — If the path contract is invalid.

### traverseObject

Traverses own enumerable data properties of plain objects and arrays in deterministic depth-first preorder. Results include paths and parents. Repeated/circular objects appear as entries but are not entered again. Accessors and symbols are skipped; built-in collections, typed arrays, Dates, and class instances are leaf values. Sparse array slots are absent properties.

- Signature: `traverseObject(value, options?)`
- Import: `import { traverseObject } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `ObjectTraversalEntry[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `Record<PropertyKey, unknown> \| unknown[]` | Not documented. |
| `[options]` | `ObjectTraversalOptions` | Not documented. |

Throws:
- `TypeError` — If the root or options do not match the contract.
- `RangeError` — If traversal would exceed `maxNodes`.

### findDeep

Returns the first deep traversal entry accepted by a predicate, or `undefined`. Traversal uses the same cycle, property, and limit rules as `traverseObject`, and stops as soon as a match is found.

- Signature: `findDeep(value, predicate, options?)`
- Import: `import { findDeep } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `ObjectTraversalEntry | undefined`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `Record<PropertyKey, unknown> \| unknown[]` | Not documented. |
| `predicate` | `(entry: ObjectTraversalEntry) => boolean` | Not documented. |
| `[options]` | `ObjectTraversalOptions` | Not documented. |

Throws:
- `TypeError` — If the root, predicate, or options are invalid.
- `RangeError` — If traversal would exceed `maxNodes` before a match.

### pick

Returns an object containing selected own properties.

- Signature: `pick(value, keys)`
- Import: `import { pick } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Partial<T>`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `T` | Not documented. |
| `keys` | `readonly (keyof T)[]` | Not documented. |

### omit

Returns a shallow copy without the selected own properties.

- Signature: `omit(value, keys)`
- Import: `import { omit } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Partial<T>`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `T` | Not documented. |
| `keys` | `readonly (keyof T)[]` | Not documented. |

### deepClone

Deeply clones structured-cloneable values, including circular references, Maps, Sets, Dates, typed arrays, and transferable values.

- Signature: `deepClone(value, options?)`
- Import: `import { deepClone } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `T` | Not documented. |
| `[options]` | `StructuredSerializeOptions` | Not documented. |

### deepMerge

Recursively merges own enumerable string-keyed data properties of plain objects without mutating either input. Arrays and non-plain objects are replaced by reference. Unsafe names, enumerable symbols, and enumerable accessors are rejected without invoking getters. The base prototype is kept.

- Signature: `deepMerge(base, override)`
- Import: `import { deepMerge } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T & U`

| Parameter | Type | Description |
| --- | --- | --- |
| `base` | `T` | Not documented. |
| `override` | `U` | Not documented. |

Throws:
- `TypeError` — If inputs are not plain data objects or contain unsafe property semantics/cycles.
- `RangeError` — If merge depth or object-pair work exceeds the fixed limits.

### pickAllowed

Returns a new object containing only allowed own properties. Unknown or prototype-mutating properties can be rejected or skipped.

- Signature: `pickAllowed(value, allowedKeys, options?)`
- Import: `import { pickAllowed } from "akashatools/object"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `Record<string, unknown>`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |
| `allowedKeys` | `readonly string[]` | Not documented. |
| `[options]` | `{rejectUnknown?: boolean}` | Not documented. |

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

- Signature: `capitalize(value, locales?)`
- Import: `import { capitalize } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Not documented. |
| `[locales]` | `string \| string[]` | Not documented. |

### kebabCase

Converts words and common identifier styles to kebab-case.

- Signature: `kebabCase(value)`
- Import: `import { kebabCase } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Not documented. |

### camelCase

Converts words and common identifier styles to camelCase.

- Signature: `camelCase(value)`
- Import: `import { camelCase } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Not documented. |

### pascalCase

Converts words and common identifier styles to PascalCase.

- Signature: `pascalCase(value)`
- Import: `import { pascalCase } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Not documented. |

### sentenceCase

Converts an identifier into a human-readable sentence.

- Signature: `sentenceCase(value)`
- Import: `import { sentenceCase } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Not documented. |

### includesText

Checks for literal text with optional case sensitivity.

- Signature: `includesText(value, search, options?)`
- Import: `import { includesText } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Not documented. |
| `search` | `string` | Not documented. |
| `[options]` | `{caseSensitive?: boolean, locales?: string \| string[]}` | Not documented. |

### replaceMany

Applies literal string replacements in insertion order. Unlike a RegExp-based implementation, replacement keys are never interpreted as regex syntax.

- Signature: `replaceMany(value, replacements)`
- Import: `import { replaceMany } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Not documented. |
| `replacements` | `ReadonlyMap<string, string> \| Record<string, string>` | Not documented. |

### replaceRegex

Applies a caller-provided regular expression without mutating its `lastIndex`. The expression is cloned with the same source and flags. This function does not make an unsafe or backtracking-prone caller pattern safe.

- Signature: `replaceRegex(value, pattern, replacement)`
- Import: `import { replaceRegex } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Not documented. |
| `pattern` | `RegExp` | Not documented. |
| `replacement` | `string \| ((substring: string, ...args: any[]) => string)` | Not documented. |

### longestStringLength

Returns the greatest string length among values, object keys, or a scalar.

- Signature: `longestStringLength(value)`
- Import: `import { longestStringLength } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `number`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### safeFilename

Creates a conservative lowercase filename stem. Output is ASCII, NFKD normalized, bounded, free of trailing punctuation/control characters, and prefixed when it would equal a reserved Windows device name.

- Signature: `safeFilename(value, options?)`
- Import: `import { safeFilename } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Not documented. |
| `[options]` | `{fallback?: string, maximumLength?: number}` | Not documented. |

### slugify

Creates a bounded ASCII URL/path slug with Unicode compatibility normalization. Empty normalized input returns a normalized fallback.

- Signature: `slugify(value, options?)`
- Import: `import { slugify } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `string` | Not documented. |
| `[options]` | `{fallback?: string, maximumLength?: number}` | Not documented. |

### escapeHtml

Encodes five HTML-significant characters for an HTML text context. This is not HTML sanitization and does not make markup, URLs, CSS, or scripts safe.

- Signature: `escapeHtml(value)`
- Import: `import { escapeHtml } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### prettyJson

Serializes a JSON-compatible value with human-readable indentation.

- Signature: `prettyJson(value, space?)`
- Import: `import { prettyJson } from "akashatools/string"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |
| `[space=2]` | `number \| string` | Not documented. |

## validation

Runtime: Universal JavaScript on the supported runtime floor.

Focused import: `akashatools/validation`

### isDefined

Checks whether a value is neither null nor undefined.

- Signature: `isDefined(value)`
- Import: `import { isDefined } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is T`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `T \| null \| undefined` | Not documented. |

### isBlank

Checks for nullish values or strings containing only whitespace.

- Signature: `isBlank(value)`
- Import: `import { isBlank } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### isEmpty

Checks common empty values: blank strings, empty arrays, empty Maps/Sets, and plain objects without enumerable own properties. Zero and false are not empty.

- Signature: `isEmpty(value)`
- Import: `import { isEmpty } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `boolean`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### isFiniteNumber

Checks whether a value is a finite primitive number.

- Signature: `isFiniteNumber(value)`
- Import: `import { isFiniteNumber } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is number`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### isSafeInteger

Checks whether a value is a safe primitive integer.

- Signature: `isSafeInteger(value)`
- Import: `import { isSafeInteger } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is number`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### isMap

Checks for a Map, including Maps created in another JavaScript realm.

- Signature: `isMap(value)`
- Import: `import { isMap } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Map<unknown, unknown>`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### isSet

Checks for a Set, including Sets created in another JavaScript realm.

- Signature: `isSet(value)`
- Import: `import { isSet } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Set<unknown>`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### isTypedArray

Checks for any typed-array view while excluding DataView. Cross-realm typed arrays are accepted.

- Signature: `isTypedArray(value)`
- Import: `import { isTypedArray } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Exclude<ArrayBufferView, DataView>`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### isPlainObjectArray

Checks whether every item in an array is a plain object. Empty arrays satisfy the contract; use `isNonEmptyArray` as an additional condition when needed.

- Signature: `isPlainObjectArray(value)`
- Import: `import { isPlainObjectArray } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Record<PropertyKey, unknown>[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### isBlob

Checks for a Blob when the current runtime exposes `globalThis.Blob`. Returns false instead of throwing in runtimes without Blob support.

- Signature: `isBlob(value)`
- Import: `import { isBlob } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is Blob`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### isFile

Checks for a File when the current runtime exposes `globalThis.File`. Returns false instead of throwing in runtimes without File support.

- Signature: `isFile(value)`
- Import: `import { isFile } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is File`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### typeOf

Returns a precise, lowercase runtime type name.

- Signature: `typeOf(value)`
- Import: `import { typeOf } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### isJson

Checks whether a string contains valid JSON. Valid scalar JSON is accepted.

- Signature: `isJson(value)`
- Import: `import { isJson } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### isEmail

Performs pragmatic email syntax validation. It does not attempt deliverability or full RFC mailbox validation.

- Signature: `isEmail(value)`
- Import: `import { isEmail } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `value is string`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### normalizeNanpPhone

Normalizes a North American phone number into ten digits, or returns null. A leading country code of 1 is accepted.

- Signature: `normalizeNanpPhone(value)`
- Import: `import { normalizeNanpPhone } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | null`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### formatNanpPhone

Formats a valid North American phone number as `(555) 123-4567`.

- Signature: `formatNanpPhone(value)`
- Import: `import { formatNanpPhone } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string | null`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |

### validateJsonContract

Validates a value against a useful JSON Schema subset. Supported keywords are `$ref`, `type`, `const`, `enum`, `required`, `properties`, `items`, `additionalProperties`, and `definitions`. Unsupported keywords and malformed schemas throw instead of being silently ignored.

- Signature: `validateJsonContract(value, schema)`
- Import: `import { validateJsonContract } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `string[]`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Not documented. |
| `schema` | `JsonContract` | Not documented. |

### assertJsonContract

Asserts a value against the supported JSON Schema subset.

- Signature: `assertJsonContract(value, schema)`
- Import: `import { assertJsonContract } from "akashatools/validation"`
- Input mutation: Does not mutate inputs.
- Since: 2.0.0
- Returns: `T`

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `T` | Not documented. |
| `schema` | `JsonContract` | Not documented. |

## node

Runtime: Node.js 22+.

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
