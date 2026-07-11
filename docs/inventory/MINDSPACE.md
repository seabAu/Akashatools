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

## Export-level audit status

- [ ] Generic client candidates: export names and dispositions.
- [ ] Browser/environment client candidates: export names and dispositions.
- [ ] Generic server candidates: export names and duplicate matrix.
- [ ] Node/framework server candidates: primitive/framework separation.
- [x] App-owned modules classified and excluded at module level.
- [x] Archived/defunct modules isolated from active-source decisions.
