# Mindspace time utility inventory

Source reviewed read-only:
`_Compass/Mindspace App/app/client/src/lib/utilities/time.js` and
`_Compass/Mindspace App/app/server/utilities/time.js` as of 2026-07-11.

This ledger covers all 84 named exports: 65 client exports and 19 server
exports. A disposition describes the reusable behavior, not an endorsement of
the source implementation. Presentation, scheduling, and selection policy stay
in Mindspace unless a smaller independent contract is demonstrated.

## Cross-runtime duplicate matrix

The files share 16 export names. Most are copied implementations, but several
have drifted input coercion or dependencies. None should be maintained as a
second client/server implementation.

| Duplicate name | Conflict or defect | Canonical direction |
| --- | --- | --- |
| `_getFormattedTime` | Unpadded local presentation helper. | App-local; use `Intl` for public formatting. |
| `convert` | Reorders date-string components with implicit input assumptions. | Replace with an explicitly parsed format or `localDateKey`. |
| `d8` | Large stateful-looking namespace; broken `subtract`, mixed concerns, copied documentation. | Reject monolith; extract independently specified primitives only. |
| `dateFormatYYYYMMDD` | Produces an unpadded local key; client coerces while server assumes `Date`. | `date.localDateKey`. |
| `daysInMonth` | Uses a 1-based month argument unlike JavaScript and the new API. | `date.daysInMonth` with documented overloads. |
| `formatDate` | Actually produces a local calendar key, not general display formatting. | `date.localDateKey`; reserve `formatDate` for `Intl` output. |
| `formatDateTime` | Truncated ISO-like output; invalid input silently becomes now. | App-local preset or strict `date.formatDateTime`. |
| `formatDateTimezone` | Server calls a missing helper; client computes unused offset through fragile locale parsing. | `date.formatDate` with an explicit IANA `timeZone`. |
| `formatDateYYYYMMDD` | Padded local calendar key. | `date.localDateKey`. |
| `getDate` | Replaces English template tokens using the current date. | App-local copy/template behavior. |
| `humanFriendlyDateStr` | English relative-date presentation with hard-coded thresholds. | Future `Intl.RelativeTimeFormat` wrapper if usage warrants it. |
| `isSameDay` | Local-day comparison includes a redundant 24-hour check that is fragile at DST. | `date.isSameLocalDay`. |
| `isToday` | Local calendar-day predicate. | `date.isToday`. |
| `isValidDate` | Accepts valid `Date` objects, including cross-realm objects. | `date.isValidDate`. |
| `sameDay` | Compares UTC components despite an unqualified name. | Defer an explicit `isSameUtcDay` only if consumers need it. |
| `YYYY_MM_DD_Formatter` | Another local date-string formatter. | `date.localDateKey` or an explicit display preset. |

## Client `time.js` (65 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `getDaysInMonth` | Returns the local calendar month's length for a date. | Adopted as `date.daysInMonth`. |
| `isPastDue` | Compares broad host-parsed input with an implicit current instant; invalid input silently returns false. | Defer explicit `isBefore`/overdue contract with injectable clock. |
| `formatTimeDifference` | Returns calendar years/months/days plus duration parts and direction from date-fns. | Defer until calendar-versus-duration semantics are separated. |
| `coerceDateValue` | Treats timestamp zero as missing, unwraps `{ from }`, and host-parses before explicit formats. | Merge carefully into `date.toDate`; explicit parsers must avoid ambiguous host parsing. |
| `getLocalDateKey` | Padded local `YYYY-MM-DD`. | Adopted as `date.localDateKey`. |
| `startOfLocalDay` | Clones a date at local midnight but returns null for invalid input. | Adopted strict `date.startOfLocalDay`. |
| `differenceInLocalDays` | Rounds elapsed local-midnight milliseconds, which can miscount around DST. | Adopted calendar-field-based `date.differenceInLocalDays`. |
| `parseClockTimeToMinutes` | Accepts out-of-range clock values such as `99:99`. | Replaced by validated `date.clockTimeToMinutes`. |
| `isDateRangeValue` | Recognizes UI `{ from, to }` shapes without defining boundary semantics. | Defer to explicit date-range type and boundary contract. |
| `normalizeDateSelection` | Normalizes Mindspace single/range selection shapes. | App-local until a generic range contract exists. |
| `getDateRangeStart` | Extracts the first endpoint from UI selection values. | Defer with date-range contract. |
| `getDateRangeEnd` | Extracts the second endpoint with start fallback. | Defer; fallback changes open-range meaning. |
| `hasDateRange` | Tests whether selection contains two endpoints. | Defer with date-range contract. |
| `getDayKey` | Returns locale-dependent `toDateString` and substitutes now for invalid input. | Reject implicit fallback; use `localDateKey` for stable keys. |
| `getPrettyDate` | Returns a UTC ISO date or recursively formatted range object. | App-local presentation; split scalar and range return types. |
| `getPrettyTime` | Mixes UTC fields for 24-hour output with local fields for 12-hour output. | Reject mixed-zone behavior; use explicit `Intl` options. |
| `getPrettyDateTime` | Joins the preceding presentation helpers. | App-local composition. |
| `prettyDateTime` | Moment-based date/time presentation. | Replace app usage with `Intl`; do not add Moment dependency. |
| `isValidDate` | Cross-realm valid-`Date` predicate. | Adopted as `date.isValidDate`. |
| `_getFormattedTime` | Local `h:m` presentation without minute padding. | App-local; use `Intl.DateTimeFormat`. |
| `daysBetween` | Uses 24-hour duration division rather than explicit calendar-day semantics. | Use `differenceInLocalDays` for calendar days; defer duration helper if needed. |
| `formatRelativeDate` | Returns Today/Yesterday but returns undefined for all other valid dates. | Reject incomplete implementation; future relative formatting uses `Intl`. |
| `formatDate` | Produces a local date key despite its generic display name. | `date.localDateKey`; canonical `formatDate` is `Intl`-based. |
| `formatDateTime` | Accepts only `Date` objects and silently formats now on invalid input. | Reject implicit-now fallback; use strict `date.formatDateTime`. |
| `formatDateYYYYMMDD` | Padded local date key duplicate. | `date.localDateKey`. |
| `dateFormatYYYYMMDD` | Unpadded local date key duplicate. | `date.localDateKey`. |
| `minutesToHHMM` | Formats signed minute durations as `+HH:MM`, not a time of day. | Defer separately named duration-offset formatter. |
| `getTZOffset` | Derives offsets by parsing locale-formatted strings. | Defer robust timezone API; reject locale round-trip algorithm. |
| `formatDateTimezone` | Validates a zone, computes an unused offset, and returns only a date piece. | Use `date.formatDate` with explicit `timeZone`. |
| `timezonesWithoffsets` | Enumerates zones with current offsets. | Defer timezone-list/display submodule with snapshot-time input. |
| `getTimezoneAbbreviation` | Extracts a locale-specific time-zone name. | Defer explicit locale/zone display helper. |
| `getTimezoneOffset` | Computes offset through `formatToParts`. | Candidate internal for a future zoned-time contract, not a standalone default. |
| `getFormattedTimezoneElement` | Builds English timezone selector labels. | App-local presentation or future optional timezone-list surface. |
| `getSortedTimezones` | Logs, sorts by current offset, and caches results that become stale across DST. | Reject implementation; future API accepts reference instant and has no logging. |
| `LocalToCSTTime` | Ignores its timezone argument, applies the host offset, and logs. | Reject misleading/broken conversion. |
| `utcToLocalInputValue` | Formats an instant for host-local `datetime-local`. | Defer explicit local-input conversion and DST policy. |
| `localInputToUTCISO` | Converts host-local `datetime-local` input to an instant. | Defer with strict input parser and invalid-time policy. |
| `utcToLocalInputValueTZ` | Estimates zoned wall time through locale round trips and silently falls back. | Reject fallback behavior; defer robust zoned-time design. |
| `localInputToUTCISOTZ` | Iteratively estimates a zone offset with silent fallback. | Defer; require explicit DST gap/overlap and invalid-zone policy. |
| `humanFriendlyDateStr` | English relative presentation with implicit now and age thresholds. | App-local or future `Intl.RelativeTimeFormat` wrapper. |
| `getDate` | Substitutes `YEAR` and `MONTH` tokens using the current date. | App-local template/copy helper. |
| `convert` | Reorders date text without a validated input grammar. | Replace with explicit parser plus formatter. |
| `YYYY_MM_DD_Formatter` | Local date formatting duplicate. | `date.localDateKey` or explicit `Intl` preset. |
| `sameDay` | Compares UTC date components under an ambiguous name. | Defer explicit `isSameUtcDay` if demanded. |
| `isSameDay` | Local comparison adds a DST-fragile elapsed-hours condition. | Adopted as `date.isSameLocalDay`. |
| `isToday` | Local today predicate. | Adopted as `date.isToday`. |
| `daysInMonth` | Month/year variant uses a 1-based month argument. | Adopted `date.daysInMonth` with documented zero-based overload. |
| `d8` | Monolith combines formatting, calendar math, sorting, relative text, and mutation; `subtract` references an undefined object. | Reject monolith; extract only independently specified behavior. |
| `formatDateTimeInt` | Hard-coded `en-US` `Intl` presentation. | Covered by `date.formatDateTime` locale/options. |
| `formatDistanceToNow` | Approximate English relative text; future dates can become “just now.” | Defer `Intl.RelativeTimeFormat` wrapper with explicit rounding. |
| `filterByDate` | Filters by field/date with inclusive bounds and broad coercion. | Defer generic range predicate/filter until boundary semantics are fixed. |
| `filterByDates` | Repeats filtering across several dates and concatenates duplicates. | Reject composition; future API defines deduplication and range semantics. |
| `validateAndConvertDate` | Logging validation/coercion helper for date filters. | Merge into strict parser/range validation; no logging in universal code. |
| `validateInputs` | Generic-named plumbing for a specific filter operation. | Reject public export; validation belongs in the filter contract. |
| `extractValidDate` | Extracts/coerces a configured field and logs warnings. | Use secure `object.getAtPath` plus explicit date parser. |
| `createDateComparisonFunction` | Builds before/after predicates with inclusive behavior. | Defer explicit range predicate with standard start-inclusive/end-exclusive default. |
| `filterByDate2` | Third overlapping filter API with different plumbing and failure behavior. | Merge only after one range/filter contract is designed. |
| `validateDate` | Regex plus normalizing `Date` constructor accepts impossible rollover dates. | Reject implementation; add strict calendar-date parser if consumer usage requires it. |
| `isValidTime24` | Full-string 24-hour clock predicate. | Covered by `date.clockTimeToMinutes`. |
| `isValidTime12` | Full-string 12-hour clock predicate. | Covered by `date.clock12To24`. |
| `convert12to24` | Regex allows optional spacing but the splitter requires whitespace. | Replaced by tested `date.clock12To24`. |
| `convert24to12` | Converts validated 24-hour clock text. | Adopted as `date.clock24To12`. |
| `isValidTimeRange` | Requires lexical end-after-start and disallows equal/overnight ranges implicitly. | Defer explicit same-day/overnight policy. |
| `formatDateToString` | Another padded local calendar key. | `date.localDateKey`. |
| `parseDateString` | Calls the Date-object-only validator on a string, so valid strings always return null. | Reject broken implementation; future parser must name its grammar. |

Importing this client module also assigns `Date.prototype.now` and
`Date.prototype.yyyymmdd`. That side effect is rejected independently of every
export: Akashatools imports must not modify built-in prototypes.

## Server `time.js` (19 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `isValidDate` | Duplicate valid-`Date` predicate. | Adopted once as `date.isValidDate`. |
| `dateToUnixSeconds` | Returns milliseconds from `getTime()` and substitutes now for falsy input. | Reject misleading implementation; use strict `date.toUnixSeconds`. |
| `unixSecondsToDate` | Treats “seconds” as milliseconds and returns ISO text rather than a `Date`. | Reject; use `date.fromUnixSeconds` then format explicitly. |
| `_getFormattedTime` | Duplicate unpadded local display helper. | App-local/`Intl`. |
| `formatDate` | Duplicate local calendar key with generic name. | `date.localDateKey`. |
| `formatDateTime` | Duplicate truncated ISO-like presenter with implicit-now fallback. | Reject fallback; use strict `date.formatDateTime`. |
| `formatDateYYYYMMDD` | Duplicate padded local date key. | `date.localDateKey`. |
| `dateFormatYYYYMMDD` | Unpadded date key and stricter input assumption than client copy. | `date.localDateKey`. |
| `formatDateTimezone` | Calls undefined `getTimezoneOffset`, causing a reference error. | Reject implementation; use `date.formatDate({ timeZone })`. |
| `humanFriendlyDateStr` | Duplicate English relative presentation. | App-local or future `Intl.RelativeTimeFormat` wrapper. |
| `getDate` | Duplicate current-month/year template helper. | App-local. |
| `convert` | Duplicate unvalidated date-text reordering. | Explicit parser plus formatter. |
| `YYYY_MM_DD_Formatter` | Duplicate local formatting helper. | `date.localDateKey`/explicit preset. |
| `sameDay` | Duplicate UTC-component comparison. | Defer explicit `isSameUtcDay`. |
| `isSameDay` | Duplicate DST-fragile local-day predicate. | `date.isSameLocalDay`. |
| `isToday` | Duplicate local-today predicate. | `date.isToday`. |
| `daysInMonth` | Duplicate 1-based month/year helper. | `date.daysInMonth`. |
| `d8` | Duplicate monolith; broken `subtract`; copied third-party-style documentation; client/server members have drifted. | Reject; do not carry code or prose forward. |
| `sanitizeDateArray` | Defaults missing input to now, mutates caller array by sorting, and does not define invalid-date handling. | Keep scheduler policy app-local or redesign as strict immutable sort. |

Importing the server module performs the same `Date.prototype` mutations as the
client module. A universal package must be inert at import time.

## Result

- Existing Akashatools date primitives already cover the sound, well-specified
  core: validation/coercion, local-day operations, Unix-second conversion,
  calendar keys, `Intl` formatting, and clock parsing/conversion.
- No source implementation is copied in this pass. Remaining reusable areas
  need design work: strict calendar-text parsing, date ranges, relative time,
  signed durations, local form input, and IANA-zone conversion.
- Mindspace presentation, scheduler defaults, selection state, and field-name
  adapters remain app-owned.
- Global prototype writes, implicit-now fallbacks on invalid input, console
  logging, ambiguous host parsing, and silent timezone fallback are prohibited
  migration behavior.
