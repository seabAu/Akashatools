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
| `flattenArray` | Delegates to native `flat` with legacy fallback and silently normalizes depth. | Add planned strict `array.flatten`; use native `flat` meanwhile. |
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

## Export-level audit status

- [x] Universal core: array/object/string/math/sort/client+server validation.
- [ ] Generic client candidates: export names and dispositions.
- [ ] Browser/environment client candidates: export names and dispositions.
- [ ] Generic server candidates: export names and duplicate matrix.
- [ ] Node/framework server candidates: primitive/framework separation.
- [x] App-owned modules classified and excluded at module level.
- [x] Archived/defunct modules isolated from active-source decisions.
