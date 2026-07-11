# Mindspace browser/environment utility inventory

Source reviewed read-only:
`_Compass/Mindspace App/app/client/src/lib/utilities` as of 2026-07-11.
The applicable Mindspace app/client agent instructions were read before this
export-level pass.

## Coverage map

The 21 browser/environment candidate modules expose 77 ESM exports. Four files
have no public ESM surface but still require side-effect/provenance
classification. Export-list re-exports and anonymous default exports are counted
in addition to named declarations.

| Group | Runtime exports | Status |
| --- | ---: | --- |
| Browser/UI/React/runtime helpers | 37 | Complete below. |
| Storage, credential crypto, and service-worker queue | 15 | Pending. |
| Fetch, import/export, and I/O | 25 | Pending. |
| `markdown.js`, `prototypes.js`, `sentence.js` | 0 | Pending side-effect/provenance review. |
| **Total** | **77** | **37 complete; 40 pending.** |

## `browser.js` (5 exports)

This module depends on Mindspace Firebase/FCM services. Only browser-name
display is independent of those application contracts.

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `getBrowserName` | Uses a short user-agent substring order to return one of five display labels; UA reduction/spoofing and Chromium variants make it unsuitable for capability decisions. | App-local display hint; use feature detection for behavior. |
| `isNotificationSupported` | Delegates to Mindspace's FCM support snapshot and requires both Notifications and service workers. | App-owned notification contract. |
| `getNotificationPermission` | Delegates to the Firebase notification-permission service. | App-owned adapter; native permission is only one part of FCM readiness. |
| `registerTokenOnBackend` | Compatibility wrapper mapping FCM token/device fields into a Mindspace service; logs invalid input and collapses results to boolean. | App-owned/deprecated compatibility path. |
| `unregisterTokenOnBackend` | Compatibility wrapper around Mindspace FCM token removal; logs and collapses result shapes. | App-owned. |

## `browserTextToSpeech.js` (2 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `getBrowserSpeechSynthesis` | Safely returns `window.speechSynthesis` or null. | Native feature detection; no wrapper needed unless a larger cancellable speech API is designed. |
| `buildSpeakableText` | Heuristically removes HTML/Markdown punctuation and normalizes whitespace before speech; regex HTML stripping is not parsing/sanitization. | Defer as explicit speech presentation transform, not universal string cleanup. |

## `click.js` (1 export)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `useOnClickOutside` | React hook registers document mouse/touch listeners and tests a ref's containment. | Keep in React UI code/package; Akashatools core has no React hook surface. |

## `confirm.js` (6 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `confirmAction` | Enqueues Mindspace confirm-store UI copy and resolves a Promise from dialog interaction. | App-owned interaction contract. |
| `confirmDelete` | Adds Mindspace destructive-action defaults and English copy. | App-owned presentation policy. |
| `confirmAndUndo` | Commits synchronously, catches/logs commit errors, and creates a Sonner undo toast. | App-owned; swallowing commit failures is not a generic transaction contract. |
| `isConfirmDialogReady` | Re-export from Mindspace confirm store. | App-owned store state. |
| `waitForConfirmDialogReady` | Re-export from Mindspace confirm store. | App-owned lifecycle behavior. |
| `useConfirmStore` | Default store re-export under a named export. | App-owned React/Zustand surface. |

## `contextMenuLayer.js` (6 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `createLayerMenuItem` | Shallow-copies a menu configuration. | Native object spread; menu shape is app-owned. |
| `createLayerMenuSeparator` | Creates Mindspace `{ type: "separator" }` records. | App-owned menu contract. |
| `withLayerMenuVisibility` | Shallow-copies an item and assigns `visible` without interpreting it. | App-owned immutable adapter/native spread. |
| `withLayerMenuDisabled` | Shallow-copies an item and assigns `disabled`. | App-owned/native spread. |
| `withLayerMenuChildren` | Shallow-copies an item and assigns the original children array. | App-owned/native spread. |
| default export | Object containing the five named functions. | Reject duplicate surface; canonical modules should prefer named exports. |

## `DOM.js` (2 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `addUniqueKeys` | Imports selected React APIs but references undeclared `React`; random UUID keys also change across calls and defeat stable reconciliation. | Reject broken/unstable React helper. |
| `isValidComponent` | Thin `isValidElement` wrapper with extra string-`"undefined"` handling. | Use React's native `isValidElement` in React code. |

## `floatingUtilityPositions.js` (6 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `FLOATING_UTILITY_SLOTS` | Mindspace floating-widget identifiers. | App-owned layout contract. |
| `FLOATING_UTILITY_SLOT_CLASS_NAMES` | Tailwind positioning classes keyed by those slots. | App-owned styling. |
| `FLOATING_UTILITY_SLOT_ORDER` | Product-specific widget ordering. | App-owned. |
| `FLOATING_UTILITY_DEFAULT_RECTS` | Default size/position for a Mindspace companion widget. | App-owned layout. |
| `getFloatingUtilitySlotClassName` | Joins configured slot classes with caller classes. | App-owned composition; generic class merging is addressed separately. |
| `getFloatingUtilityDefaultRect` | Returns the shared configured rectangle or caller fallback without cloning. | App-owned; mutation expectations belong to layout state. |

## `mergeButtonRefs.js` (1 export)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `mergeButtonRefs` | Returns a callback assigning a value to function refs or mutable `.current` refs; assumes iterable input and React ref shapes. | Keep in React utilities or defer a typed `mergeRefs` add-on; do not add React types to universal core. |

## `plainTextDictation.js` (3 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `normalizePlainTextDictationValue` | Converts scalar fragments or arrays to newline text while dropping unsupported/empty entries. | App-owned dictation payload normalization; generic coercion would need different naming/options. |
| `resolvePlainTextDraftTitle` | Selects trimmed draft/fallback text or English `Untitled`. | App-owned product copy. |
| `buildPlainTextLineArrayPayload` | Normalizes CRLF, whole-value/line trimming, empty-line dropping, and configurable empty-array fallback. | Defer an explicit line-splitting utility only if cross-project use defines bare-CR and whitespace semantics. |

## `style.js` (4 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `cn` | Composes `clsx` and `tailwind-merge`. | Keep in Tailwind/React UI code; adding both dependencies is not justified for universal string behavior. |
| `getAllStyleVariables` | Scans same-origin/root stylesheet rules via global document/window but can still throw on inaccessible rules and returns duplicates. | Defer a tested browser CSS-custom-property API with injected document/style sheets. |
| `getAllCSSVariableNames` | Scans supplied/global stylesheets, deduplicates linearly, and silently swallows every rule-access error. | Defer/rewrite with `Set` and explicit inaccessible-sheet policy. |
| `getElementCSSVariables` | Reads computed custom-property values from a global/default element. | Candidate only with injected environment and explicit whitespace/empty-value behavior. |

## `window.js` (1 export)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `isLocalhost` | Reads global location and recognizes localhost, bracketed IPv6 loopback, and the full IPv4 `127/8` range. | Defer a security-reviewed hostname predicate shared with portfolio network evidence; app can call it locally meanwhile. |

## UI/runtime result

- No function in this group is adopted immediately. Most encode Firebase,
  Zustand, Sonner, React, Tailwind, or Mindspace layout/copy contracts.
- CSS custom-property enumeration, loopback recognition, speakable-text cleanup,
  line splitting, and React-ref merging remain explicit candidates rather than
  promised APIs.
- Importing universal Akashatools must never read `window`, `document`, user
  agent, permissions, stylesheets, or React state. Browser effects remain
  call-time operations under environment-specific entry points.
