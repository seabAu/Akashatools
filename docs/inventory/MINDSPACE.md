# Mindspace utility inventory

Source reviewed read-only:
`_Compass/Mindspace App/app/{client,server}` as of 2026-07-11.

This file classifies every active JavaScript module beneath the two Mindspace
utility roots. Classification is intentionally broader than adoption: a generic
candidate still needs export-level review, duplicate analysis, tests, and a clear
Akashatools contract.

## Coverage summary

| Source root | Generic/universal candidates | Environment/framework candidates | App-owned | Total |
| --- | ---: | ---: | ---: | ---: |
| `app/client/src/lib/utilities` | 17 | 21 | 75 | 113 |
| `app/server/utilities` | 2 | 5 | 16 | 23 |
| **Active total** | **19** | **26** | **91** | **136** |

Five client files under `_backups` or `_defunct` are excluded from the active
total and retained only as historical evidence. The classification was verified
against the live filesystem with no missing, extra, or duplicate paths.

## Client — generic/universal candidates (17)

These contain behavior that may be portable without React, browser globals,
Mindspace domain models, or application services.

- `array.js`
- `arrayEnhanced.js`
- `color.js`
- `data.js`
- `dateTimeSelection.js`
- `errorValidation.js`
- `localTextInsights.js`
- `math.js`
- `obj.js`
- `random.js`
- `schema.js`
- `sort.js`
- `speechTextCleanup.js`
- `string.js`
- `time.js`
- `timeTimestampAdapter.js`
- `validation.js`

`color`, schema/data modeling, speech cleanup, text insights, and complex date
selection remain candidates rather than promised categories. Their genericity
must be proven function by function.

## Client — browser/environment candidates (21)

These may yield browser utilities, but currently rely on DOM APIs, Web Crypto,
storage, fetch, React refs, service workers, presentation behavior, or global
prototype changes. They must not enter the universal root merely because their
operations are broadly named.

- `browser.js`
- `browserTextToSpeech.js`
- `click.js`
- `confirm.js`
- `contextMenuLayer.js`
- `credentialCrypto.js`
- `DOM.js`
- `draftPersistenceStorage.js`
- `fetch.js`
- `floatingUtilityPositions.js`
- `import-export.js`
- `io.js`
- `local.js`
- `markdown.js`
- `mergeButtonRefs.js`
- `plainTextDictation.js`
- `prototypes.js`
- `sentence.js`
- `serviceWorkerDebugQueue.js`
- `style.js`
- `window.js`

`prototypes.js` is presumptively rejected for canonical use because Akashatools
must not mutate global prototypes. `sentence.js` is nearly ten thousand lines and
has no detected ESM exports; it requires a separate provenance/API review before
any extraction.

## Client — app-owned modules (75)

These encode Mindspace authentication, navigation, queue processing, reminders,
tasks, notes, quick access, diagnostics, notification, switchboard, workbench, or
feature analytics. Reusable primitives may later be extracted from them, but the
modules themselves remain app-local.

- `actionSwitchboard.js`
- `actionSwitchboardContracts.js`
- `ai/ai-client.js`
- `ai/prompt-builder.js`
- `analytics/anomaly-detector.js`
- `analytics/correlation-analyzer.js`
- `analytics/data-preprocessor.js`
- `analytics/goal-velocity-analyzer.js`
- `analytics/pattern-analyzer.js`
- `analytics/streak-analyzer.js`
- `analytics/trend-analyzer.js`
- `auth.js`
- `auth-client.js`
- `collectionQueueProcessorCore.js`
- `commandMode.js`
- `contextMenuSwitchboard.js`
- `dataFreshness.js`
- `dataLoadDiagnostics.js`
- `devRuntimeDiagnostics.js`
- `dueItems.js`
- `goalQueueProcessors.js`
- `input.js`
- `inputCommitContract.js`
- `inputContracts.js`
- `inputFieldAliases.js`
- `linkedReminder.js`
- `nav.js`
- `navigationRoutes.js`
- `navPersistence.js`
- `note.js`
- `notesQueueProcessors.js`
- `notificationChannelDiagnostics.js`
- `notificationUtils.js`
- `plannerQueueProcessorCore.js`
- `plannerQueueProcessors.js`
- `queueOpenIntent.js`
- `queueProcessorResult.js`
- `queueRollbackContract.js`
- `quickAccess.js`
- `quickAccessLifecycle.js`
- `quickAccessNotificationCopy.js`
- `quickAccessSwitchboardHandlers.js`
- `quickCapture.js`
- `recurrence.js`
- `reflectHabitStats.js`
- `reflectQueueProcessorCore.js`
- `reflectQueueProcessors.js`
- `reminderCadence.js`
- `reminderDates.js`
- `reminderQueueProcessors.js`
- `reminderUrgency.js`
- `route.js`
- `routeDataRequirements.js`
- `signup.js`
- `switchboard.js`
- `switchboardCommandItems.js`
- `switchboardContractAudit.js`
- `switchboardFormRegistry.js`
- `switchboardQueueProcessor.js`
- `switchboardServiceRuntime.js`
- `switchboardServiceSpecs.js`
- `systemHealth.js`
- `taskDefer.js`
- `taskDueState.js`
- `taskSwitchboardHandlers.js`
- `taskWorkbench.js`
- `todoCommandRegistry.js`
- `todoQueueProcessorCore.js`
- `todoQueueProcessors.js`
- `updateQueueDiagnostics.js`
- `updateQueueProcessing.js`
- `userPreferences.js`
- `utils.js`
- `workbenchCommandRegistry.js`
- `workObjectLinks.js`

The analytics modules are app-owned at the module level because their fields,
time assumptions, and result vocabulary are goal/habit/product concepts. Any
future statistical primitive must be separated and independently specified.

## Server — generic/universal candidates (2)

- `time.js`
- `validation.js`

Both overlap client utilities and the Akashatools legacy package. Their exports
will be compared by behavior rather than copied twice.

## Server — Node/framework candidates (5)

- `file.js`
- `schema.sanitizer.js`
- `server.js`
- `socket.registry.js`
- `utils.js`

These mix potentially reusable operations with Node filesystem, Express,
Mongoose, Socket.IO, or server-response contracts. Export-level review must keep
framework adapters app-local and route only independent primitives to planned
`node`, `object`, `schema`, or validation surfaces.

## Server — app-owned modules (16)

- `auth.js`
- `client-recurrence-calculator.js`
- `client-scheduler.js`
- `generateTokenAndSetCookie.js`
- `notify.email.js`
- `notify.sms.js`
- `notify/fcm-targeting.js`
- `notify/notification-entitlements.js`
- `notify/notification-interaction-token.js`
- `notify/notification-pinout.js`
- `notify/notify.email.js`
- `notify/notify.single.js`
- `notify/notify.sms.js`
- `recurrence.calculator.js`
- `scheduler.utils.js`
- `security/captcha.util.js`

Authentication, recurrence policy, notification entitlement/targeting, CAPTCHA,
email/SMS providers, and reminder scheduling remain Mindspace-owned.

## Archived/defunct client evidence (excluded from active inventory)

- `_backups/auth-client.20260611-auth-refactor.js`
- `_backups/todoQueueProcessors.pre-core-adapter.20260702.js`
- `_defunct/browser.legacy-fcm-token-helpers-2026-06-20.js`
- `_defunct/fetch.1.js`
- `_defunct/fetch.js`

These may explain old consumer behavior but never outrank the current active
module when choosing a migration contract.

## Export-level review — universal core

The first export-level pass covers 66 named exports across client arrays,
objects, strings, math, sorting, validation, and the duplicate server validation
module. It also covers the side-effect-only `arrayEnhanced.js` module.

### Client `array.js` (22 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `reorder` | Copies with `Array.from` but accepts invalid indices and can insert `undefined`. | Adopted strict `array.moveItem`. |
| `isArray` | Thin predicate. | Native `Array.isArray`. |
| `isNonEmptyArray` | Exact nonempty-array predicate. | Adopted with the same name. |
| `safeArray` | Returns the original array or a new empty array. | Adopted/generalized as `asArray(value, fallback)`. |
| `cleanArray` | Removes only null and undefined. | Adopted as nullish `compact`. |
| `reorderArray` | Immutable move; silently returns a copy for invalid indices. | Adopted stricter `moveItem`, which throws for programmer errors. |
| `addItem` | Immutable append; turns non-arrays into a one-item array. | Prefer native spread; no canonical wrapper currently needed. |
| `insertItem` | Immutable insertion with `(array, item, index)` and silent index clamping. | Adopted `insertItem(array, index, item)` with a deliberate argument-order change. |
| `removeItem` | Immutable index removal and unchanged copy for invalid indices. | Adopted `removeFromArray(..., { mode: "index" })`. |
| `removeWhere` | Removes predicate matches but catches/logs callback failures. | Adopted `removeFromArray` predicate mode; callback errors propagate. |
| `getType` | Custom capitalized type labels with special array categories. | Basic replacement `validation.typeOf`; array analysis remains separate. |
| `getArrayElementTypes` | Returns structured homogeneity/type information. | Defer as a possible `inspectArrayTypes`; keep separate from basic type predicates. |
| `chunkArray` | Chunks arrays but silently coerces invalid sizes to one. | Adopted strict `array.chunk`. |
| `uniqueArray` | Set/key dedupe but logs and drops values when `keyFn` throws. | Adopted `array.unique`; callback failures propagate. |
| `flattenArray` | Delegates to native `flat` with legacy fallback and silently normalizes depth. | Adopted strict `array.flatten` with native depth/sparse-slot semantics. |
| `shuffleArray` | Immutable Fisher–Yates using `Math.random`. | Adopted `array.shuffle` with injectable randomness. |
| `groupBy` | Returns a plain object, accepts property/function keys, and swallows key errors. | Adopted `array.groupBy` returning a collision-safe `Map`; errors propagate. |
| `intersection` | Ignores non-array arguments and retains duplicates from the first input. | Adopted strict, unique `array.intersection`. |
| `range` | End-exclusive allocation; invalid step becomes one and descending defaults fail. | Adopted `array.range` with explicit direction and validation. |
| `merge` | Actually zips arrays to the shortest length. | Adopted under the accurate name `array.zip`. |
| `list` | Quotes values and joins them for source/display text. | App-local formatting. |
| `listKeys` | Applies `list` to object keys. | App-local formatting; native `Object.keys` supplies the data. |

### Client `arrayEnhanced.js` (zero exports, import-time effects)

The module installs more than twenty methods on `Array.prototype`, adds static
`Array.range`/`Array.removeExtensions`, logs caught callback errors, implements a
custom chain, and mutates globals merely by being imported. Canonical disposition:
**Reject the module and all prototype extension behavior.** Its useful operations
are already represented by standalone array functions or tracked candidates such
as `flatten`, `countBy`, and `partition`. This evidence reinforces the 2.0 rule
that importing Akashatools never modifies global prototypes.

### Client `obj.js` (16 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `remove` | Spreads an array into an object and then calls `.filter`, so valid input throws. | Reject; use `removeFromArray` with a property predicate. |
| `findNestedObj` | Uses a JSON stringify replacer, returns the last match, and fails on cycles. | Merge into planned cycle-safe traversal. |
| `replace` | Repeats the array-to-object defect and returns an object rather than an array. | Reject; use `upsertBy`/immutable map by identity. |
| `isDeepEqual` | Recursive enumerable-key equality without cycle or built-in handling. | Defer until deep-equality semantics are deliberately specified. |
| `isObject` | Broad non-null object-like predicate, including arrays and special objects. | Split from adopted `isPlainObject`; add object-like guard only if needed. |
| `findElement` | Returns `forEach`'s undefined, writes an undeclared global, and loses recursive returns. | Reject. |
| `deepSearchItems` | Calls `this.deepSearchItems`, making module use fail in strict ESM. | Reject implementation; merge behavior into traversal API. |
| `deepSearch` | Returns the first object whose named property passes a predicate. | Merge into path-aware traversal result. |
| `deepSearchByKey` | Collects all loose-equality key/value matches without cycle detection. | Merge into traversal with strict comparison and limits. |
| `findByKey` | Uses undeclared loop variable `n` and ignores found falsy values. | Reject implementation; merge behavior into traversal. |
| `findByProperty` | Uses undeclared `n` and returns first recursively matching object. | Reject implementation; merge behavior into traversal. |
| `findByValue` | Uses undeclared `n`, excludes falsy targets, and returns inconsistent ancestor levels. | Reject implementation; merge behavior into traversal. |
| `findObjects` | Mutates a required result array, logs every property, and returns undefined. | Reject. |
| `mapObj2Obj` | Renames selected keys for an object or object array through legacy type checks. | Defer as explicit `renameKeys`; secure blocked names and input shape first. |
| `objToString` | Creates newline-delimited `key::value` display text. | App-local serialization/presentation. |
| `convertToText` | Produces eval-like JavaScript text with undeclared variables and trailing commas. | Reject; use explicit JSON serialization. |

### Client `string.js` (4 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `convertCamelCaseToSentenceCase` | Converts camel/acronym boundaries and removes periods. | Adopted/generalized as `string.sentenceCase`; period removal is not canonical. |
| `caseCamelToSentence` | Exact duplicate of the preceding function. | Reject duplicate; map to `sentenceCase`. |
| `prettyJSON` | Returns HTML spans for syntax coloring but fails to escape markup safely. | App-local renderer; reject as a string/JSON utility. |
| `cleanStringify` | Replaces circular references with a sentinel and drops functions, but converts arrays to keyed objects. | Defer a clearly specified safe/circular JSON serializer. |

### Client `math.js` and `sort.js` (2 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `fibonacci` | Recursive sequence uses `F(0)=1`, `F(1)=1`; public function bypasses its own memoization at the first call. | Adopted iterative `number.fibonacci` with conventional `F(0)=0`, `F(1)=1` and safe range. |
| `sortBy` | Calling it installs a mutating `Array.prototype.sortBy` and returns undefined. | Reject global mutation; adopted immutable `sort.sortBy`. |

### Client `validation.js` (18 exports)

The module depends on `libphonenumber-js/min`; password labels/classes and file
types also contain Mindspace UI/domain policy.

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `validateItem` | Validates a hard-coded Mindspace data item schema and mutates date fields. | App-local. |
| `isItemValid` | Boolean wrapper around `validateItem`. | App-local. |
| `isValidEmail` | Detailed email syntax/length predicate. | Merge improvements into canonical `validation.isEmail` after regex/pathology tests. |
| `normalizePhoneNumberInput` | Normalizes international prefixes before library parsing. | Defer international phone surface and dependency decision; current Akashatools helper is NANP-only. |
| `isValidPhoneNumber` | Uses `libphonenumber-js` with US default for unprefixed input. | Defer with explicit default-region/dependency contract. |
| `formatPhoneNumber` | Uses `AsYouType` with US default. | Defer alongside international phone design. |
| `getValidationErrorMessage` | Produces English form feedback for email/phone fields. | App-local presentation. |
| `DEFAULT_PASSWORD_VALIDATION_CONFIG` | Mixes validation policy with English labels/messages. | Defer; separate pure requirements from UI copy. |
| `normalizePasswordValidationConfig` | Accepts config, RegExp, or literal special-character string. | Defer with password-policy API. |
| `buildPasswordRequirementChecks` | Builds required/recommended checks plus UI labels/messages. | Defer pure requirement evaluation; keep copy app-local. |
| `validatePassword` | Returns validation details and English errors. | Defer policy/result core; no claim of credential security. |
| `normalizePasswordStrengthConfig` | Merges scoring, labels, color classes, and thresholds. | App-local UI heuristic. |
| `calculatePasswordStrength` | Weighted character-class score presented as strength. | App-local heuristic; must not be a security guarantee. |
| `generatePassword` | Uses `Math.random` and `sort(() => Math.random()-0.5)` for credentials. | Reject as security-unsafe; future generator must use Web Crypto. |
| `validatePhone` | Alias of `isValidPhoneNumber`. | Reject duplicate; future compatibility alias only if required. |
| `validateEmail` | Alias of `isValidEmail`. | Reject duplicate; canonical predicate is `isEmail`. |
| `detectFileType` | Logs content and recognizes only Mindspace `habits`/`goals` JSON or CSV. | App-local; logging may expose imported content. |
| `validateFileTypeMatch` | Validates Mindspace import metadata and treats all CSV as matching. | App-local. |

### Server `validation.js` (4 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `isValidEmail` | Older duplicate of client email validation. | Superseded by client review; merge only independently tested syntax improvements. |
| `isValidPhoneNumber` | Regex/length approximation without `libphonenumber-js`. | Superseded; do not present as international validity. |
| `formatPhoneNumber` | NANP formatting plus permissive international prefix fallback. | Current `formatNanpPhone` covers explicit NANP behavior; international formatting deferred. |
| `getValidationErrorMessage` | Older English form feedback duplicate. | App-local presentation. |

## Export-level review — data, schema, and random generation

This pass covers 58 exports: 38 from `data.js`, 3 from `schema.js`, 15 from
`random.js`, and 2 from `errorValidation.js`.

### Client `data.js` (38 exports)

The module imports the legacy Akashatools namespace and Mindspace's custom
`DateTimeLocal` type. Much of its lower half generates form models from database
schema descriptions rather than providing general data primitives.

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `invalid` | Treats nullish values, strings `"null"`/`"undefined"`, blank strings, empty arrays/plain objects, and NaN as invalid. | Reject umbrella semantics; compose `isBlank`, `isEmpty`, and finite-number checks. |
| `isValid` | Negates the different, narrower `isInvalid` function rather than `invalid`. | Reject ambiguous/mismatched predicate. |
| `safeGet` | Dot-path lookup uses inherited-property `in` checks and permits unsafe segments. | Adopted secure own-property `object.getAtPath`. |
| `isValidArray` | Nonempty-array predicate optionally requiring every item to pass ambiguous `isValid`. | Adopted `isNonEmptyArray`; explicit caller predicates use `every`. |
| `isObjectId` | Regex checks exactly 24 hexadecimal characters. | Defer as explicitly named Mongo/hex validation; not a generic object-ID claim. |
| `getDocumentById` | Predicate returns any truthy `_id`, so it usually returns the first document regardless of requested ID. | Reject; use `find`/`upsertBy` with explicit identity selector. |
| `cleanDocument` | Legacy `filterKeys` call and name do not clearly establish whether `_id` is selected or removed. | App-local persistence adapter; use explicit `pick`/`omit`. |
| `isArrSafe` | Returns an array, not a boolean; both empty and nonempty arrays are truthy to callers. | Reject; use `asArray` or `isNonEmptyArray`. |
| `arrSafeTernary` | Tests `isArrSafe` as boolean, so valid empty-array results defeat the intended fallback. | Reject. |
| `arrSafeTernaryPair` | Same truthiness defect as `arrSafeTernary`. | Reject. |
| `isObjectHasSafe` | Reads one own key through legacy checks and returns a fallback. | Adopted/generalized as `getAtPath` with fallback. |
| `isEmptyArr` | Exact empty-array predicate. | Covered by `validation.isEmpty` or native length check. |
| `isEmptyStr` | Whitespace-only string predicate. | Covered by `validation.isBlank`. |
| `isInvalid` | Nullish/blank-string/empty-array predicate, unlike earlier `invalid`. | Reject duplicate semantic drift; compose literal predicates. |
| `arrayToString` | Presentation conversion with pipe/space/comma assumptions and `N/A` sentinel. | App-local presentation. |
| `stringToArray` | Replaces spaces with a separator and splits again; does not actually honor arbitrary token semantics cleanly. | App-local or redesign as explicit tokenizer. |
| `deepPathSet` | Large mutating recursive setter with custom path parsing, logging branch, and no prototype-pollution protection. | Reject; adopted immutable `setAtPath`. |
| `deepPathSetWorking` | Alternate mutating deep setter with overlapping behavior. | Reject duplicate; use `setAtPath`. |
| `deepSet` | Mutating path/key recursive setter with ambiguous separation between path and final key. | Reject; use known full path with `setAtPath`. |
| `deepSet2` | Fourth overlapping mutating deep setter. | Reject duplicate; use `setAtPath`. |
| `generateString` | `Math.random` character generation duplicate. | Adopted `random.randomString` with validation/injected source. |
| `setNestedValue` | Mutates nested objects, returns only a shallow root copy, and accepts unsafe path segments. | Reject; adopted immutable secure `setAtPath`. |
| `getNestedValue` | Dot reduction with truthiness short-circuit and no own-property/unsafe-key protection. | Adopted `getAtPath`. |
| `getDefaultValueForType` | Maps constructors to defaults, including current time for Date. | Defer to schema/model initialization; not a generic type predicate. |
| `getType` | Custom legacy type strings inferred from first array element. | Adopted basic `validation.typeOf`; richer inspection deferred. |
| `getValueType` | Adds Mindspace `DateTimeLocal` and form/schema-oriented capitalized labels. | App-local type adapter. |
| `getFieldType` | Maps values to HTML input concepts. | App-local form adapter. |
| `getArrayType` | References undeclared `test` for nonempty arrays. | Reject; future structured array inspection only. |
| `formatInputValue` | Reads DOM event shapes and converts form controls. | App-local UI adapter. |
| `initializeModel` | Delegates to legacy `cleanJSON`, which discards scalar values and all but first array examples. | Reject implementation; schema initialization must be explicit. |
| `arrayToEnum` | Duplicate frozen value-to-itself object builder with unsafe key ambiguity. | Defer safe `keyBy`/lookup builder if usage warrants it. |
| `typeToInitialDefault` | Form default mapper uses truthiness, so explicit false/zero defaults are lost. | App-local schema adapter; reject implementation. |
| `dataType2fieldType` | Maps data type labels to HTML input types. | App-local form adapter. |
| `generateRandom` | Type-switched fixture generator based on `Math.random`. | Merge primitive cases into adopted random APIs; schema switching stays fixture-local. |
| `createBasicUUID` | Non-cryptographic random identifier with caller-defined complexity. | Reject for identity/security; future secure IDs use Web Crypto. |
| `schemaToFormModel` | Converts Mongoose-like field definitions into UI form metadata. | App-local/schema candidate; coupled to input types and legacy helpers. |
| `schemaToModel` | Builds initialized data models from Mongoose-like schema metadata. | App-local/schema candidate pending independent contract. |
| `deepSearch` | Another first-match recursive key/predicate search without cycles. | Merge into planned canonical traversal API. |

### Client `schema.js` (3 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `validateField` | Validates/coerces a custom import schema with type/default/required/enum/nested rules. | Defer to a deliberately scoped schema category; compare with `validateJsonContract`. |
| `validateObject` | Iterates the custom schema, returns sanitized values, and logs input/schema/value details. | Reject logging in reusable code; defer pure schema behavior. |
| `validateDataArray` | Validates each import row, preserves partial successes, and logs all data. | App-local import workflow unless a generic batch-validation contract emerges. |

### Client `random.js` (15 exports)

The module imports Axios plus Mindspace `DateTimeLocal`, `Decimal`, `ObjectArray`,
and `ObjectId` classes. One switch also references undeclared `mongoose`.

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `getDefaultValueForType` | Recursively constructs defaults for Mindspace custom type constructors. | App-local schema fixture helper. |
| `generateRandomString` | Fetches an external random word, ignores requested length on success, logs failures, then falls back to base-36 `Math.random`. | Reject network-coupled semantics; adopted deterministic `randomString`. |
| `generateRandomNumber` | Inclusive integer generation. | Adopted strict `randomInt` with injectable source. |
| `generateRandomDate` | Random instant between two Dates. | Adopted validated `randomDate`. |
| `generateRandomBoolean` | `Math.random() < 0.5`. | Adopted `randomBoolean` with injectable source. |
| `generateRandomDecimal` | Produces Mindspace `Decimal` after fixed-place formatting. | App-local custom-type fixture; primitive float generation uses `randomFloat`. |
| `generateRandomDateTimeLocal` | Wraps random Date in Mindspace custom type. | App-local. |
| `generateRandomArray` | Generates schema-typed arrays asynchronously. | App-local/schema fixture engine. |
| `generateRandomObjectArray` | Generates custom `ObjectArray` fixtures. | App-local. |
| `generateRandomObject` | Recursively generates object fields from custom schema. | App-local/schema fixture engine. |
| `generateRandomObjectId` | Instantiates Mindspace `ObjectId`. | App-local custom type. |
| `generateRandomValueForType` | Dispatches custom types, references undeclared `mongoose`, and mixes async/network/random behavior. | Reject as generic API; app fixture engine may be repaired locally. |
| `generateRandomData` | Generates a custom-schema object asynchronously. | App-local/schema fixture engine. |
| `generateRandomTasks` | Builds Mindspace task/group fixtures with domain fields. | App-local. |
| `getRandomPosition` | References undeclared React/chart variables (`chartRef`, `chartSize`, `imageSize`). | Reject broken export; geometry helper must receive bounds explicitly. |

### Client `errorValidation.js` (2 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `parseValidationIssuesFromMessage` | Parses Mongoose-style `Validation failed:` text into issue records. | Defer as framework-specific error adapter; do not parse generic errors by message. |
| `extractValidationIssues` | Walks several response error shapes to depth five, merges parsed message issues, and deduplicates field/message pairs. | Defer to HTTP/framework adapter; preserve typed error causes in canonical APIs. |

## Export-level review — date selection and timestamp adapters

This pass covers 29 exports: 10 from `dateTimeSelection.js` and 19 from
`timeTimestampAdapter.js`. Both depend on `date-fns`; the timestamp adapter also
imports the large shared `time.js` module.

### Client `dateTimeSelection.js` (10 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `DATE_SELECTION_MODE` | Constants for single/range/multiple UI selection state. | App-local until a generic date-selection state API is justified. |
| `RANGE_SELECTION_TARGET` | Constants tracking which endpoint a UI click edits. | App-local UI state. |
| `coerceSafeDate` | Clones Dates, accepts range-like `{ from }`, relies on host parsing before explicit format parsing, and returns fallback/null. | Merge carefully with `date.toDate`; explicit string formats must not be masked by host ambiguity. |
| `inferDateSelectionMode` | Infers multiple from arrays and range from `from`/`to` keys. | App-local selection adapter or future explicit range type guard. |
| `sanitizeDateSelectionValue` | Clones single/multiple selections and sorts reversed range endpoints. | Defer range normalization after inclusive/boundary semantics are designed. |
| `applyDateSelectionPreset` | Interprets English preset names, date-fns offsets, endpoint toggling, and multi-day UI sequence policy. | App-local presentation/interaction policy. |
| `updateDateSelectionByClick` | Applies click state transitions for single/range/multiple selection. | App-local UI state. |
| `updateDateSelectionIndex` | Replaces an indexed multiple/range endpoint and reorders range bounds. | App-local UI state; primitive immutable replacement already exists. |
| `toDateTimeLocalInputValue` | Formats an instant for `datetime-local`, optionally using an IANA zone and falling back silently. | Defer a dedicated local-input conversion contract with DST/error policy. |
| `fromDateTimeLocalInputValue` | Converts local input to Date; zone conversion estimates offset through locale-string round trips. | Defer; algorithm is ambiguous across DST gaps/overlaps and must not silently fall back. |

### Client `timeTimestampAdapter.js` (19 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `DEFAULT_TIMESTAMP_START_FIELDS` | Mindspace heuristic field-name priority list. | App-local adapter configuration. |
| `DEFAULT_TIMESTAMP_END_FIELDS` | Mindspace heuristic end-field list. | App-local. |
| `TEMPORAL_ITEM_REQUIRED_FIELDS` | Required fields for Mindspace timeline view models. | App-local contract. |
| `TEMPORAL_ITEM_FORBIDDEN_FIELDS` | UI callback/component fields forbidden from timeline data. | App-local contract. |
| `getPathValue` | Accepts selector functions or dot paths but reads inherited/unsafe properties. | String paths use adopted secure `getAtPath`; function selectors remain direct caller code. |
| `getFirstPresentField` | Returns the first nonblank configured field/path and its source field. | Defer generic `firstPresent` only if repeated outside adapters. |
| `isTimeOnlyString` | Regex is not end-anchored, so strings with trailing junk pass. | Reject implementation; future clock parser already validates full `HH:mm`. |
| `coerceTimestampDate` | Combines Dates, time-only strings anchored to a base day, and broad date coercion; accepts `24:00`. | Defer explicit clock-plus-day composition and 24:00 policy. |
| `buildDateTimeForDay` | Thin alias for time-only/date coercion with base day. | Merge into future explicit clock/date composition. |
| `resolveTimestampRange` | Searches many app field aliases, applies overnight/default-duration policy, and returns metadata. | App-local adapter; interval normalization primitive may be extracted separately. |
| `getTimeBlockDurationMinutes` | Uses Mindspace time-block field names and requires explicit end. | App-local. |
| `buildTimelineKey` | Joins source/id/suffix with colons and fallback sentinels. | App-local identity policy. |
| `getTimelineWindow` | Builds inclusive local start/end-of-day bounds from displayed days. | Defer generic calendar-window helper after timezone/boundary design. |
| `doesTimeSpanOverlapWindow` | Inclusive interval-overlap predicate; invalid/missing end collapses to start. | Candidate for generic date-range API after boundary semantics are locked. |
| `isDateInTimelineWindow` | Inclusive instant-in-window predicate. | Candidate for generic date-range API after boundary semantics are locked. |
| `buildTimestampAdapterItem` | Converts arbitrary records to Mindspace timeline view models with source/raw references and routes. | App-local. |
| `buildTimestampAdapterItems` | Batch wrapper assigning indices and dropping unadaptable records. | App-local. |
| `filterTimestampAdapterItemsByWindow` | Filters timeline view models through overlap policy. | App-local composition. |
| `validateTemporalItemAdapterContract` | Validates Mindspace view-model required/forbidden fields and Date ordering. | App-local contract validation. |

## Export-level review — color and local text processing

This pass covers 24 exports: 18 from `color.js`, 3 from
`localTextInsights.js`, and 3 from `speechTextCleanup.js`.

### Client `color.js` (18 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `randRGBChannel` | Multiplies by 257, allowing invalid channel value 256. | Reject implementation; `randomInt(0, 255)` supplies a valid primitive. |
| `generateColorFromName` | Hashes a name to HSL but can emit negative hue. | Defer deterministic string-color API with normalized hue and collision expectations. |
| `rgbRand` | Generates three channels through broken `randRGBChannel`. | Reject; future color helper composes validated channels. |
| `rgbToHex` | Bitwise RGB-to-hex conversion without channel/type validation and without `#`. | Defer a strict color category. |
| `randomColor` | Returns unprefixed hex using invalid-channel generator. | Reject; future random color needs format and injected-source options. |
| `stringToHue` | String hash modulo can return negative hue. | Defer normalized deterministic hue helper. |
| `stringToColor` | Formats HSL from unnormalized hue and unchecked saturation/lightness. | Defer strict color API. |
| `colorByHashCode` | Interpolates unescaped caller text into an HTML string/style attribute. | Reject injection-prone presentation helper. |
| `hslToHex` | Standard HSL conversion but does not validate/wrap channel ranges. | Candidate for a separately specified `color` category. |
| `hslaToHex` | HSL conversion plus unchecked alpha-to-byte conversion. | Candidate after alpha/range policy is defined. |
| `invertColor` | Expands 3-digit hex and inverts RGB; malformed hex digits can yield NaN-derived output. | Candidate with strict hex parser. |
| `padZero` | Internal left-zero helper with off-by-one construction style. | Native `padStart`; not public. |
| `stringAsColor` | Duplicate string hash to hex/hex-alpha; alpha zero is treated as absent. | Merge only into future deterministic color API. |
| `createGradientFromColors` | Produces Tailwind/arbitrary CSS class strings with direction and fallback policy. | App-local styling. |
| `createTextGradientFromColors` | Tailwind text-gradient class builder. | App-local styling. |
| `createBorderGradientFromColors` | Tailwind border-gradient class builder. | App-local styling. |
| `interpolateColor` | Interpolates numeric RGB arrays but does not validate factor/channels. | Candidate for strict color API. |
| `interpolateColors` | Parses RGB strings by digit regex; `steps <= 1` creates invalid factors. | Defer/rewrite on top of validated color parser/interpolator. |

### Client `localTextInsights.js` (3 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `deriveMoodFromSentiment` | Maps three sentiment labels to Mindspace mood copy. | App-local product vocabulary. |
| `analyzeTextForOrganization` | English word lists infer Mindspace tags, categories, urgency, action signals, and sentiment. | App-local heuristic; generic tokenization/statistics may be extracted only with independent tests. |
| `mergeUniqueTags` | Trims string tags, deduplicates, and limits to 12 by default. | Native map/filter/Set/slice composition; default limit is app policy. |

### Client `speechTextCleanup.js` (3 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `transformSpeechTranscript` | Configurable English speech cleanup for filler words, spoken punctuation/structure/symbols/numbers, spacing, duplicates, and capitalization. | Defer as an optional English speech/text transform surface, not universal string behavior. |
| `createSpeechTextTransformer` | Curries base speech options into a transformer. | Defer with the parent transform; generic currying wrapper is unnecessary. |
| `cleanupSpeechTranscript` | Exact forwarding alias of `transformSpeechTranscript`. | Reject duplicate canonical name; compatibility alias only if a consumer requires it. |

## Export-level audit status

- [x] Universal core: array/object/string/math/sort/client+server validation.
- [x] Data/schema/random/error-validation cluster (58 exports).
- [x] Date selection and timestamp adapter cluster (29 exports).
- [x] Color/local-text/speech-cleanup cluster (24 exports).
- [x] Client/server time cluster and duplicate matrix (84 exports); see
  [`MINDSPACE_TIME.md`](./MINDSPACE_TIME.md).
- [x] Generic client candidates: export names and dispositions.
- [ ] Browser/environment client candidates: export names and dispositions.
- [x] Generic server candidates: export names and duplicate matrix.
- [x] Node/framework server candidates: primitive/framework separation across
  43 exports and one side-effect-only module; see
  [`MINDSPACE_SERVER.md`](./MINDSPACE_SERVER.md).
- [x] App-owned modules classified and excluded at module level.
- [x] Archived/defunct modules isolated from active-source decisions.
