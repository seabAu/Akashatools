# Date and time contracts

Akashatools keeps four concepts separate:

- absolute instants are valid `Date` values, Unix seconds, and instant ranges;
- local calendar dates use host-local year/month/day fields and names containing
  `LocalDay` or `localDate`;
- clock text represents a wall-clock time without a date or time zone;
- locale display is delegated to `Intl.DateTimeFormat` with caller options.

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
