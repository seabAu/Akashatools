# Portfolio rebuild utility inventory

Source reviewed read-only:
`_Portfolio/sgb-portfolio-rebuild2026/{client,server,shared}` as of 2026-07-11.
The source project's `AGENTS.md`/`RTK.md` command-wrapper requirement was
followed during inspection.

## Coverage map

The requested utility roots contain 120 runtime exports across 21 nonempty
JavaScript modules. The empty `client/src/utilities/buildNav.js` file is also
recorded. This inventory is being completed in behavior groups so exact legacy
copies can point to the already-reviewed Mindspace ledger rather than presenting
copied code as independent evidence.

| Group | Exports | Status |
| --- | ---: | --- |
| Secure field paths and own properties | 7 | Complete below. |
| Stable numeric ordering | 2 | Complete below. |
| Storage containment | 2 | Complete below. |
| Network configuration/loopback guards | 3 | Complete below. |
| Admin field coercion | 1 | Complete below. |
| Shared JSON contract validation | 2 | Complete below. |
| Client DOM/data/debug utilities | 32 | Complete below. |
| Copied/derived server legacy and app modules | 71 | Complete below. |
| **Total** | **120** | **Complete.** |

## Secure field paths: `server/utilities/fieldPath.js` (5 exports)

| Portfolio export | Finding | Akashatools disposition |
| --- | --- | --- |
| `parseFieldPath` | Parses dot/numeric-bracket paths and rejects empty, malformed, and prototype-mutating segments. | Adopted/generalized as `object.parsePath`, adding validated segment-array input. |
| `hasAtPath` | Requires every path component to be an own property. | Adopted as `object.hasAtPath`. |
| `getAtPath` | Own-property lookup distinguishes absence from an existing undefined value. | Adopted as `object.getAtPath`. |
| `setAtPathImmutable` | Clones only containers along a path and infers arrays from numeric next segments. | Adopted as `object.setAtPath`; retains structural sharing and validates array-form paths too. |
| `isBlockedProperty` | Exposes the three unsafe path names as a predicate for app services. | Keep internal in Akashatools; all relevant public object functions enforce the rule themselves. |

The source tests prove exact nested selection, immutable array updates, and
rejection of `__proto__` and `constructor` paths. Akashatools adds contract tests
for own-property reads, fallback behavior, structural sharing, and array-form
path validation.

## Own-property filtering: `server/utilities/ownProperties.js` (2 exports)

| Portfolio export | Finding | Akashatools disposition |
| --- | --- | --- |
| `isPlainObject` | Accepts ordinary and null-prototype objects. | Adopted as `object.isPlainObject`. |
| `pickOwnAllowed` | Copies allowed enumerable own keys and optionally rejects unknown/blocked keys. | Adopted as `object.pickAllowed` with argument validation and category-consistent naming. |

## Stable ordering: `server/utilities/stableOrder.js` (2 exports)

| Portfolio export | Finding | Akashatools disposition |
| --- | --- | --- |
| `compareNumericOrder` | Compares the first differing finite numeric value among configurable keys; invalid/missing values sort last. | Adopted with input validation as `sort.compareNumericOrder`. |
| `stableSortByNumericOrder` | Decorates values with positions, sorts without mutating, and uses position as a tie breaker; non-array input silently becomes empty. | Adopted as strict `sort.sortByNumericOrder`, using modern stable `toSorted`. |

The default keys (`showIndex`, `index`, `order`) are useful application
conventions, not claims that other ordering fields will be discovered
automatically.

## Contained storage paths: `server/utilities/storagePath.js` (2 exports)

| Portfolio export | Finding | Akashatools disposition |
| --- | --- | --- |
| `resolveContainedPath` | Resolves a nonempty relative storage key and rejects null bytes, absolute paths, different drives/shares, and lexical traversal outside a root. It supports injected POSIX/Windows path APIs in tests. | Adopted on `akashatools/node` with strict arguments and cross-platform internal contract tests. |
| `resolveExistingContainedPath` | Applies lexical containment, resolves root/target symlinks with `realpath`, then rejects an existing target outside the real root. | Adopted on `akashatools/node`, explicitly documenting existence, propagated filesystem errors, and symlink/TOCTOU limits. |

These are materially safer than the copied legacy file deletion helpers. They
are not universal exports because importing them loads `node:fs/promises` and
`node:path`. Safe open/write/delete APIs will also need operation-time
containment rather than treating a previously resolved string as permanent
authorization.

## Network configuration: `server/utilities/network.js` (3 exports)

| Portfolio export | Finding | Akashatools disposition |
| --- | --- | --- |
| `isLoopbackHostname` | Recognizes only localhost and exact IPv4/IPv6 loopback spellings used by the QA tooling. | Keep app-local until a broader IP/hostname threat model and use case exist. |
| `normalizeListenHost` | Accepts a host or URL-shaped setting, strips plain IPv6 brackets, and silently falls back on invalid URL text. | App-local server configuration; generic normalization should not hide invalid configuration. |
| `requireLoopbackUrl` | Parses HTTP(S), rejects non-loopback hosts, and returns `URL`; its error copy and purpose are admin-QA-specific. | Keep app-local security gate; do not weaken it into a general URL predicate. |

## Admin field coercion: `server/utilities/fieldCoercion.js` (1 export)

| Portfolio export | Finding | Akashatools disposition |
| --- | --- | --- |
| `coerceFieldValue` | Dispatches portfolio field kinds to trimming, English validation errors, number/boolean conversion, HTTP(S) URL checks, email normalization, and deduplicated string lists. | Keep app-local manifest/form policy; independently adopt small coercers only if repeated cross-project usage defines their contracts. |

The function is cohesive inside the portfolio admin manifest, but names such as
`media-reference`, `toggle`, and `string-list`, its relative-URL acceptance, and
its user-facing copy are not universal type semantics.

## Shared contracts: `shared/contracts/validateJsonContract.mjs` (2 exports)

| Portfolio export | Finding | Akashatools disposition |
| --- | --- | --- |
| `validateJsonContract` | Validates a small JSON Schema subset (`$ref`, type, const, enum, required, properties, items, and closed objects) and returns path-prefixed errors. Its extra `root`/`path` parameters expose recursion internals. | Adopted as two-argument `validation.validateJsonContract`, adding schema validation, JSON Pointer unescaping, union/null types, and own-key checks. |
| `assertJsonContract` | Throws one `TypeError` containing all validation messages and otherwise returns the input. | Adopted as typed `validation.assertJsonContract`. |

Akashatools deliberately documents this as a useful subset rather than an
accidental full JSON Schema implementation. Further keywords require explicit
contracts and tests.

## Core-candidate result

- Twelve functions were adopted/generalized across `object`, `sort`,
  `validation`, and the Node-only surface; one blocked-key helper remains
  internal.
- Four network/field-coercion exports remain app-owned.
- Two contained-path exports now form the initial Node-only entry point.
- No Portfolio source file is copied wholesale. The current implementations add
  validation, clearer names, modern native APIs, and narrower public signatures.

## Client `Data.js` (13 exports)

This is an older portfolio copy of the same data/form-generation family already
reviewed in Mindspace. It imports the Akashatools 1.x wildcard namespace and
mixes primitive-looking functions with HTML input and schema-form policy.

| Portfolio export | Finding | Akashatools disposition |
| --- | --- | --- |
| `generateString` | Generates characters with `Math.random` and no argument/source validation. | Replaced by validated, injectable `random.randomString`. |
| `getType` | Produces legacy custom type strings and infers an array type from its first element. | Basic inspection is covered by `validation.typeOf`; structured array inspection remains deferred. |
| `getFieldType` | Maps runtime values to HTML input concepts. | App-local form adapter. |
| `getArrayType` | Infers from the first item and references undeclared `test` for nonempty arrays. | Reject broken implementation. |
| `formatInputValue` | Reads DOM event/control shapes and applies HTML-field coercion. | App-local UI adapter. |
| `initializeModel` | Delegates to legacy `cleanJSON`, which does not preserve a general value model. | Reject; model initialization requires an explicit schema contract. |
| `arrayToEnum` | Builds a frozen value-to-itself object without defining duplicate/unsafe-key behavior. | Defer safe lookup/keying helper only if usage warrants it. |
| `typeToInitialDefault` | Maps form types to defaults but loses explicit false/zero defaults through truthiness checks. | App-local; reject implementation. |
| `dataType2fieldType` | Maps custom data-type labels to HTML input types. | App-local form adapter. |
| `generateRandom` | Dispatches fixture generation by schema/form type using `Math.random`. | Primitive cases are covered by `random`; schema dispatch remains fixture-local. |
| `createBasicUUID` | Produces a non-cryptographic, caller-shaped random identifier. | Reject for identity/security use; use Web Crypto identifiers. |
| `schemaToFormModel` | Recursively turns a custom schema into form metadata and optional random fixtures. | App-local schema/form adapter. |
| `schemaToModel` | Recursively creates a data model from the same custom schema. | App-local; compare only if a stable generic schema format is later selected. |

## Client `Debug.js` (4 exports)

| Portfolio export | Finding | Akashatools disposition |
| --- | --- | --- |
| `getArgs` | Copies its `arguments` object into an array. | Native rest parameters or `Array.from`; no public helper. |
| `args2obj` | Logs its arguments and returns undefined; it never constructs the promised object. | Reject. |
| `debug` | Depends on legacy `utils.val`, writes directly to console, overrides caller options with defaults, ignores rest values, and returns undefined. | Reject implementation; any future diagnostics API must be injectable and inert by default. |
| `nameOf` | Removes punctuation from a function's source text and cannot reliably recover a variable/function name across syntax or minification. | Reject; use explicit labels or the limited native `.name` property. |

## Client `DOM.js` (15 exports)

This JSX-bearing module imports React and legacy Akashatools. Most exports are
overlapping attempts to render arbitrary nested values as lists. They have no
cycle policy, stable React keys, component contract, or safe HTML-string
contract.

| Portfolio export | Finding | Akashatools disposition |
| --- | --- | --- |
| `isDarkMode` | Reads `window.matchMedia` at import time, so server rendering/import without `window` can throw; result never updates. | Reject constant; a browser helper would feature-detect at call time and expose change observation separately. |
| `setElementValueById` | Requires truthy inputs and assigns `value.latitude` rather than the supplied value. | Reject app-specific/broken DOM mutation. |
| `obj2ListText` | Recursively interpolates unescaped keys/values into HTML-like strings and uses React `className` syntax in text markup. | Reject injection-prone serializer. |
| `objArray2List` | Renders recursive React lists without keys and depends on ambiguous legacy validation/replacement helpers. | App-local component; reject as universal utility. |
| `value2List` | Returns JSX for scalars and an empty string for objects/arrays. | App-local renderer. |
| `array2List` | Calls itself with the unchanged array, causing infinite recursion for valid arrays. | Reject. |
| `obj2List` | Recursive JSX object renderer with no cycle handling or React keys. | App-local/reject implementation. |
| `objArrayToList` | Dispatches object/array/scalar rendering through legacy predicates whose object/array overlap can select the wrong branch. | Reject duplicate dispatcher. |
| `arrayToList` | Second recursive JSX array renderer; drops empty arrays and lacks keys/cycle handling. | App-local/reject duplicate. |
| `objToList` | Second recursive object renderer with branch-order ambiguity for arrays. | App-local/reject duplicate. |
| `valueToList` | Scalar replacement helper returns empty text for null because `typeof null` is object. | Reject presentation semantics. |
| `valToList` | Third JSX dispatch path for arrays/objects/scalars. | App-local/reject duplicate. |
| `hasClass` | Checks `event.target.classList.contains` for one class. | Native DOM API; component code should call it directly with explicit target/currentTarget choice. |
| `list` | Builds caller-selected list tags and interpolates unescaped values into an HTML string. | Reject injection-prone string builder; use DOM/React rendering or an escaping serializer. |
| `ObjMap` | Logs, creates DOM nodes recursively, joins them into strings, and then embeds the result in JSX. | Reject mixed DOM/React/debug behavior. |

## Client `buildNav.js` (0 exports)

The file is empty. It contributes no candidate behavior and is complete by
classification.

## Verified server legacy copies (58 exports)

These files are source-identical to reviewed Mindspace modules except that the
portfolio `time.js` stops after `d8` and therefore lacks Mindspace's later
`sanitizeDateArray` export. They provide consumer/provenance evidence, not 58
independent reasons to preserve broken behavior.

| Portfolio file | Exports | Verified relationship | Authoritative findings |
| --- | ---: | --- | --- |
| `server/utilities/file.js` | 7 | Exact byte-for-byte Mindspace copy. | [`MINDSPACE_SERVER.md`](./MINDSPACE_SERVER.md#filejs-7-exports) |
| `server/utilities/utils.js` | 29 | Exact byte-for-byte Mindspace copy. | [`MINDSPACE_SERVER.md`](./MINDSPACE_SERVER.md#utilsjs-29-exports) |
| `server/utilities/validation.js` | 4 | Exact byte-for-byte Mindspace copy. | [`MINDSPACE.md`](./MINDSPACE.md#server-validationjs-4-exports) |
| `server/utilities/time.js` | 18 | Exact prefix of Mindspace server time; Mindspace adds one later export. | [`MINDSPACE_TIME.md`](./MINDSPACE_TIME.md#server-timejs-19-exports) |

### Copied `file.js` export map (7)

| Portfolio export | Akashatools disposition |
| --- | --- |
| `findFilesByPattern` | Reject undeclared-`glob` implementation; defer deliberate Node glob API. |
| `saveFile` | Native Node write API or future explicit atomic/overwrite helper. |
| `getFile` | App-local Mindspace media adapter. |
| `getFiles` | App-local media adapter composition. |
| `deleteFile` | Reject unrestricted-path and false-success implementation. |
| `importFile` | Reject always-early return; future HTTP/file APIs remain separate. |
| `checkImageURL` | Reject misleading extension-only image-validity claim. |

### Copied `time.js` export map (18)

| Portfolio export | Akashatools disposition |
| --- | --- |
| `isValidDate` | `date.isValidDate`. |
| `dateToUnixSeconds` | Reject milliseconds-under-seconds bug; use `date.toUnixSeconds`. |
| `unixSecondsToDate` | Reject milliseconds-under-seconds bug; use `date.fromUnixSeconds`. |
| `_getFormattedTime` | App-local/`Intl`. |
| `formatDate` | `date.localDateKey`. |
| `formatDateTime` | Reject implicit-now fallback; use strict `date.formatDateTime`. |
| `formatDateYYYYMMDD` | `date.localDateKey`. |
| `dateFormatYYYYMMDD` | `date.localDateKey`. |
| `formatDateTimezone` | Reject undefined-helper implementation; use `date.formatDate` with `timeZone`. |
| `humanFriendlyDateStr` | App-local or future `Intl.RelativeTimeFormat` wrapper. |
| `getDate` | App-local current-date template copy. |
| `convert` | Explicit parser plus formatter; reject unvalidated text reordering. |
| `YYYY_MM_DD_Formatter` | `date.localDateKey` or explicit display preset. |
| `sameDay` | Defer explicitly named `isSameUtcDay` only if used. |
| `isSameDay` | `date.isSameLocalDay`. |
| `isToday` | `date.isToday`. |
| `daysInMonth` | `date.daysInMonth`. |
| `d8` | Reject monolith and broken `subtract`; extract primitives independently. |

This copied module performs the same import-time `Date.prototype` mutations as
Mindspace. Portfolio duplication reinforces the need for inert imports; it does
not make the mutation a compatibility requirement.

### Copied `utils.js` export map (29)

| Portfolio export | Akashatools disposition |
| --- | --- |
| `generateTokenAndSetCookie` | App-owned auth; reject billion-day JWT unit bug. |
| `chkfxRequestID` | Reject logging/shape-dependent Mongoose coercion. |
| `isObjectIdValid` | Defer explicitly named Mongo predicate and dependency decision. |
| `sendResponse` | Express/Mindspace response adapter. |
| `SpliceObjArray` | Reject mutating, misleadingly named object-array merge. |
| `catchAsync` | Express middleware adapter. |
| `pick` | Independently covered by `object.pick`. |
| `mergeProps` | Reject Mongoose patching that loses falsy updates. |
| `swapIfValid` | Native explicit nullish/blank conditional. |
| `isObject` | `object.isPlainObject`. |
| `objectDeepMerge` | Reject unsafe mutation; use `object.deepMerge`. |
| `hasOwnProperty` | Native `Object.hasOwn`. |
| `parseSchema2` | App-local/reject duplicate Mongoose schema parser. |
| `parseSchema` | App-local/reject inconsistent Mongoose parser. |
| `getPropertyType` | App-local Mongoose reflection. |
| `getPropertyTypeFromConstructor` | App-local parser helper. |
| `parsePropertyDetails` | App-local Mongoose reflection. |
| `getMongooseArrayType` | App-local Mongoose labeling. |
| `getSchemaInfo` | Reject broken branch; any replacement remains a Mongoose adapter. |
| `processSchema` | Defer only with an explicit schema-description format. |
| `getSchemaDefinition` | App-local third Mongoose description format. |
| `validateInputData` | Explicit own-key validation; keep English response copy app-local. |
| `fetchNestedDocuments` | App-owned Mongo graph query. |
| `isArray` | Native `Array.isArray`. |
| `isValidArray` | Reject ambiguous first-slot/boolean-option semantics. |
| `isObjectArray` | Reject ambiguous some-versus-every object semantics. |
| `arrayContainsObjects` | Compose native `some` with a precise predicate. |
| `isAO` | Reject broad abbreviated umbrella predicate. |
| `handleCheckRequired` | Reject undeclared-namespace and falsy-value defects. |

### Copied `validation.js` export map (4)

| Portfolio export | Akashatools disposition |
| --- | --- |
| `isValidEmail` | Merge only tested syntax improvements into `validation.isEmail`. |
| `isValidPhoneNumber` | Reject international-validity implication from regex/length approximation. |
| `formatPhoneNumber` | `validation.formatNanpPhone` for explicit NANP behavior; international formatting deferred. |
| `getValidationErrorMessage` | App-local English form feedback. |

## Portfolio server app/framework modules (13 exports)

### Recurrence and scheduling (6)

| File/export | Finding | Akashatools disposition |
| --- | --- | --- |
| `client-recurrence-calculator.js` / `getNextOccurrenceForRule` | Exact copy of Mindspace's client-compatible reminder recurrence calculator. | App-owned reminder/rrule policy. |
| `recurrence.calculator.js` / `getNextOccurrenceForRule` | Exact copy of the separate Mindspace server recurrence implementation under the same export name. | App-owned; identical name hides distinct contracts. |
| `client-scheduler.js` / `calculateNextRunClient` | Calculates Mindspace reminder next-run state using its recurrence records. | App-owned scheduler. |
| `client-scheduler.js` / `generateMockNotificationData` | Creates notification fixtures from reminder fields. | App-owned fixture/presentation data. |
| `scheduler.utils.js` / `getNextOnDayOccurrence` | Searches up to 365 UTC days for named weekdays and applies a target UTC time. | App-owned recurrence primitive until weekday/timezone/range behavior is independently specified. |
| `scheduler.utils.js` / `calculateNextRunAt` | Chooses future trigger/recurrence dates from Mindspace reminder shapes; active logic ignores `onDay` rules despite importing recurrence support. | App-owned; reject as generic scheduling API. |

### Socket.IO registry (5)

| Portfolio export | Finding | Akashatools disposition |
| --- | --- | --- |
| `unregisterSocket` | Mutates user-to-socket map and returns affected users. | App-local Socket.IO registry. |
| `registerUserSocket` | Enforces one user per socket through global unregister then mutation. | App-local identity policy. |
| `getUserSocketIds` | Normalizes set/array/string registry values into a copied list. | App-local. |
| `emitToUserSockets` | Emits a Socket.IO event to every registered user socket without the later Mindspace liveness pruning. | App/framework adapter. |
| `countRegisteredSockets` | Counts normalized socket IDs across registry values. | App-local registry metric. |

### Authentication and SMS (2)

| File/export | Finding | Akashatools disposition |
| --- | --- | --- |
| `generateTokenAndSetCookie.js` / `generateToken` | Couples jsonwebtoken, environment secret, and Express cookie policy; milliseconds are interpolated as JWT days and a `Date` is passed as cookie `maxAge`. | App-owned authentication; reject implementation. |
| `notify.sms.js` / default `sendSMS` | Configures dotenv and a Twilio client at import, logs success/errors, and swallows delivery failures. | App-owned provider adapter; never import from a universal entry point. |

## Portfolio inventory result

- All 120 runtime exports are dispositioned: 49 in the core/client sections and
  71 in the copied/app server sections.
- Exact copies do not outrank the current Mindspace version or create new
  compatibility promises. Their consumers will be fixtures for canonical APIs.
- Portfolio search, admin sessions, public snapshots, navigation, and storage
  service policy outside these requested utility roots remain app-local by
  default; feature-local review is still a separate checklist item.
- No direct adoption candidate remains unresolved in this source set; deferred
  app behavior still requires demonstrated cross-project demand.

## Portfolio audit status

- [x] Client `DOM.js`, `Data.js`, and `Debug.js` (32 exports); empty
  `buildNav.js` is classified and has no public surface.
- [x] Generic/security core and shared contracts (17 exports).
- [x] Copied server `file.js`, `time.js`, `utils.js`, and `validation.js` (58 exports).
- [x] Scheduler/recurrence, socket, auth-cookie, and SMS modules (13 exports).
- [x] Per-module source counts total exactly 120 runtime exports.
