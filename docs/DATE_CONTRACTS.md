# Date and time contracts

Akashatools keeps four concepts separate:

- absolute instants are valid `Date` values, Unix seconds, and instant ranges;
- local calendar dates use host-local year/month/day fields and names containing
  `LocalDay` or `localDate`;
- clock text represents a wall-clock time without a date or time zone;
- locale display is delegated to `Intl.DateTimeFormat` with caller options.

## Serialized instants

`toEpochMilliseconds` is the normalization core for ordinary Date-compatible
values, Firestore-style `{ seconds, nanoseconds }` records, and
Protobuf-message-style `{ seconds, nanos }` records. Canonical ProtoJSON
timestamps are RFC 3339 strings and follow the ordinary string path. `toDate`
returns a fresh Date over that same core, and the rest of the date category
accepts the shared `TimestampInput` type.

Integer-only strings have an explicit unit contract. `toEpochMilliseconds`
defaults to milliseconds because its name states the output unit; `toDate`
retains its historical Date-string parsing default. Either function accepts
`numericStringUnit: "date" | "milliseconds" | "seconds" | "reject"` to make the
boundary unambiguous.

Structured seconds and the optional `nanoseconds` or `nanos` fraction must be
own data properties in the standard year-0001 through year-9999 range. Supplying
both fractional spellings is rejected as ambiguous. Inherited fields, getters,
and arbitrary `toDate`/coercion methods are rejected without invocation. The
fraction is converted with sign-aware integer arithmetic before native Date
clipping, so floating-point rounding cannot carry `999,999,999` nanoseconds into
the next second at modern epoch magnitudes. JavaScript Date still has
whole-millisecond precision; smaller fractions follow native truncation toward
zero.

`isWithinInstantRange` defaults to a start-inclusive, end-exclusive interval.
Callers can independently include either boundary. Invalid or reversed bounds
throw; Akashatools never swaps them silently. Filtering remains native
composition:

```js
records.filter((record) => isWithinInstantRange(record.createdAt, start, end));
```

Local calendar-day difference intentionally does not divide elapsed milliseconds
by 24 hours. It projects local date fields onto UTC day numbers, so adjacent days
remain one day apart across 23-hour spring gaps and 25-hour fall overlaps.

Node.js 22.18.0 does not expose global Temporal in this project's supported
runtime. Adding a Temporal polyfill would be a dependency/API decision and is
deferred until browser targets and real zoned-time consumers justify it.
Recurrence, IANA-zone conversion/disambiguation, timezone selector data, and
relative-time threshold policy remain application-owned. Public presentation
uses `Intl.DateTimeFormat`; no hand-built localized month/day grammar is added.
