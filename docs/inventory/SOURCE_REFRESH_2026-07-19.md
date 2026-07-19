# Active-source regression refresh — 2026-07-19

This is a read-only delta review of Mindspace, the portfolio rebuild, COMPOSR,
and SPLICR after Akashatools behavioral-audit commit `bcdf0bc` at
2026-07-18 18:04:51 EDT. No consumer project was modified and no consumer test,
build, service, database, browser, or network command was started.

The review compared current Git state where available and screened source-file
timestamps after the audit boundary. Dependencies, generated output, virtual
environments, caches, coverage, build output, and inaccessible temporary
document-import directories were excluded.

## Delta boundary

| Source | Current evidence | Result |
| --- | --- | --- |
| Mindspace client/server | Mindspace is not a Git working tree. The client has 1,302 screened JavaScript/TypeScript files and 28 post-boundary changes, including nine production files; the server has 214 screened files and one changed syntax-check script. | One reusable timestamp-normalization atom was missed by the earlier inventories and is repeated in four active client/worker paths. New notification routing, record composition, launch capabilities, React hooks/components, stores, and product constants remain app-owned. |
| Portfolio rebuild | Clean at `c03e86e5302c1d574dbd1cf9d3c0dfc0994cea68`, with no commit or screened source timestamp after the boundary. | No delta and no new disposition. |
| COMPOSR | Still at `3134fa89515ff1675cb28c209bf7f759c28d7a1b`; its dirty/untracked work has no screened source timestamp after the boundary. | No post-audit delta. The existing thread/archive, structured-data, concurrency, similarity, hashing, and path dispositions remain current. |
| SPLICR | Still at `fa7b4663a6278fdc09e5c2d6ca54e01537876c6f`; its dirty/untracked work has no screened source timestamp after the boundary. | No post-audit delta. The existing JSON Pointer, Retry-After, provider, media, profile, registry, and storage dispositions remain current. |

Timestamps are evidence about these working copies, not a guarantee that an
unversioned source tree cannot preserve an older modification time after a copy
or restore. The complete prior inventories remain the broader source baseline.

## Mindspace timestamp family

Four independent implementations normalize the same payload family:

- `src/lib/utilities/notificationUtils.js` converts finite millisecond numbers,
  integer strings, Date-compatible text, and `{seconds, nanoseconds}` records;
- `src/firebase-messaging-sw.js` repeats that logic for notification routing and
  display records;
- `src/lib/utilities/taskDefer.js` adds recursive `{from}` and arbitrary
  `toDate()` handling before task/reminder shifting;
- `src/lib/utilities/reminderDates.js` repeats structured timestamp handling
  while recursively collecting app-selected date fields.

The atomic requirement is not notification, task, reminder, or Firebase policy.
It is safe conversion of one serialized instant into JavaScript's whole epoch-
millisecond representation. Akashatools now provides:

- `toEpochMilliseconds(value, options)` as the normalization core;
- `toDate(value, options)` as the fresh-Date wrapper used by the rest of the
  date category;
- explicit `numericStringUnit` values `date`, `milliseconds`, `seconds`, and
  `reject` so a numeric string never changes units accidentally;
- strict Firestore `nanoseconds` and Protobuf-message `nanos` records with one
  shared whole-second and nanosecond range contract;
- own-data-property inspection that rejects inherited fields and accessors and
  never invokes an input object's `toDate`, `valueOf`, or string coercion method;
- `TimestampInput`, `StructuredTimestamp`, and `TimestampConversionOptions`
  declaration types shared by every date helper that accepts an instant.

JavaScript Date precision is whole milliseconds. Sub-millisecond structured
values therefore use the same `TimeClip` truncation behavior as native Date,
including normalization of a negative fractional millisecond to positive zero.
As with any JavaScript reflection, a Proxy can trap descriptor inspection; Proxy
objects are active application objects and are not represented as inert
`StructuredTimestamp` data by the public type.

## Remaining changed-source dispositions

| Changed family | Disposition |
| --- | --- |
| Notification aliases, routes, target availability, record normalization/merging, due-item messages, dedupe keys, and localStorage presentation suppression | Keep in Mindspace. Routes, field allowlists, statuses, record identity, display copy, launch policy, browser storage keys, and TTL behavior are product contracts. Generic composition already exists through `pickAllowed`, `deepMerge`, sorting, date, and explicit Storage helpers. |
| `parseMaybeJson` in notification and messaging-worker paths | Do not copy its ambiguous “parsed value or original input” result. Callers cannot distinguish invalid JSON from a valid JSON string with the same text. Strict input, HTTP, validation, and Storage APIs already expose bounded parsing with explicit failure contracts; a future generic result-object parser needs independent consumer demand. |
| `useDataLoader`, `useGoal`, goal-store changes, launch mode/capabilities, notification settings, dashboard/planner components, and app constants | Keep app-owned. These coordinate React hooks, stores, routes, feature flags, UI state, and product schemas rather than dependency-free utility behavior. |
| DateTime component formatting/settings changes | Keep in the component. Akashatools already supplies `Intl`-based date/time formatting; date-fns token selection, component state, timers, icons, and rendering are presentation policy. |

## Verification obligations

- Date tests cover numeric unit selection, Date cloning, class instances,
  Firestore and Protobuf-message field spellings, competing fractional fields,
  structured strings, nanosecond boundaries, negative sub-millisecond clipping,
  invalid standard ranges, inherited fields, accessors, arbitrary `toDate`
  methods, invalid options, and Date-range overflow.
- The Mindspace compatibility fixture passes structured timestamps through the
  ordinary date-formatting composition.
- Root, date-category, and granular imports must preserve one canonical function
  identity in JavaScript, TypeScript, editor completion, bundling, and the exact
  installed tarball.
- This ledger, the living checklist, changelog, source-regression table, API
  reference, declarations, bundle budgets, package manifest baseline, and
  release-readiness snapshot must move together in the implementation commit.
