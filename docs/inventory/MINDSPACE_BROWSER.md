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
| Storage, credential crypto, and service-worker queue | 15 | Complete below. |
| Fetch, import/export, and I/O | 25 | Pending. |
| `markdown.js`, `prototypes.js`, `sentence.js` | 0 | Pending side-effect/provenance review. |
| **Total** | **77** | **52 complete; 25 pending.** |

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

## `credentialCrypto.js` (3 exports)

The module derives AES-256-GCM keys with PBKDF2-SHA-256 at 250,000 iterations,
uses random 16-byte salts and 12-byte IVs, and serializes an envelope with
base64 fields. Those are reasonable building blocks, but a generic credential
format needs a stricter and independently reviewed contract.

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `encryptCredentialSecret` | Encrypts nonblank string secrets with a passphrase of at least eight code units and returns a versioned-looking envelope. The version/algorithm fields are informational only and no associated data binds the metadata. | Keep app/security-owned; do not advertise generic credential safety without format review, test vectors, migration/rotation, and threat model. |
| `decryptCredentialSecret` | Trusts envelope salt/IV/ciphertext and uses `Number(iterations) || default`, allowing negative, fractional, or resource-exhausting iteration values before Web Crypto rejects/works. It does not validate version, algorithm, KDF, base64, or expected byte lengths. | Reject as generic decryption API; harden locally before handling untrusted envelopes. |
| `isCredentialEncryptionSupported` | Checks only `window.crypto.subtle`, while encryption also needs `getRandomValues`, `btoa`, `atob`, `TextEncoder`, and `TextDecoder`. | Reject incomplete capability predicate; future API feature-detects every required operation or attempts the operation. |

## `draftPersistenceStorage.js` (7 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `DRAFT_STORAGE_BACKENDS` | Mutable constants for Mindspace session/local/IndexedDB policy. | App-owned; freeze locally if mutation is not intended. |
| `normalizeDraftPersistenceOptions` | Accepts a TTL number or options and silently falls back to session storage/default TTL; finite negative/zero TTLs are accepted. | App-owned draft policy; a generic TTL API must state bounds and fallback behavior. |
| `readDraftMapSync` | Reads session/local storage and silently converts absent/malformed/non-object JSON to `{}`; accessing storage itself can throw a browser security/quota error. | Defer browser storage adapter with injected storage and explicit parse/access failure policy. |
| `writeDraftMapSync` | JSON-stringifies and writes a draft map, returning false only for unavailable backend/key; serialization, quota, and access errors throw. | App-owned until storage error/result contract is unified. |
| `readDraftMap` | Async facade over sync storage or IndexedDB; the IndexedDB path resolves on request success and never closes its database connection. | Reject implementation for generic use; future IndexedDB helper settles/cleans up at transaction completion. |
| `writeDraftMap` | IndexedDB path resolves true on request success before transaction completion and never closes the database, so a later transaction abort can follow reported success. | Reject implementation; transaction commit defines success. |
| `pruneDraftMap` | Keeps entries with positive numeric `savedAt` and age strictly below TTL; future timestamps remain valid and input/TTL shapes are not validated. | App-owned draft expiration policy or future explicit timestamp-map filter. |

## `local.js` (3 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `SetLocal` | Thin global `localStorage.setItem` wrapper that logs keys and values. | Reject logging/data-exposure behavior; use native Storage or future injected adapter. |
| `GetLocal` | Logs stored values and returns null for missing/empty-string values, collapsing a meaningful stored empty string into absence. | Reject; native `getItem` already returns string or null. |
| `DeleteLocal` | Logs then delegates to global `removeItem`. | Native Storage API; no wrapper needed. |

## `serviceWorkerDebugQueue.js` (2 exports)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `readQueuedServiceWorkerEvents` | Reads an app-specific IndexedDB store, sorts by `createdAt`, and converts every unavailable/open/read/transaction failure to an empty queue. | App-owned diagnostics; do not hide operational failure in a generic storage API. |
| `removeQueuedServiceWorkerEvents` | Deletes truthy IDs in one transaction and resolves on transaction completion, with Mindspace database/store names. | App-owned service-worker debug queue. |

## Storage/security result

- Credential encryption remains outside Akashatools until its envelope parser,
  iteration bounds, API capability checks, threat model, test vectors, key
  rotation, and failure taxonomy are specified.
- Storage utilities must be injectable/testable and must distinguish unavailable,
  absent, malformed, serialization, quota, request, and transaction failures.
- Akashatools will not log storage values, credentials, tokens, or imported data.
- IndexedDB success is transaction completion, not merely one request's success;
  opened connections require deterministic cleanup.
