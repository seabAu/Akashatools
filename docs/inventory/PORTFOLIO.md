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
| Copied/derived server legacy and app modules | 71 | Pending detailed ledger. |
| **Total** | **120** | **49 complete; 71 pending.** |

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
| `resolveContainedPath` | Resolves a nonempty relative storage key and rejects null bytes, absolute paths, different drives/shares, and lexical traversal outside a root. It supports injected POSIX/Windows path APIs in tests. | Defer to planned `akashatools/node`; preserve this lexical contract with stronger types and platform tests. |
| `resolveExistingContainedPath` | Applies lexical containment, resolves root/target symlinks with `realpath`, then rejects an existing target outside the real root. | Defer to Node surface; document existence requirement and that resolution alone cannot eliminate a later symlink/TOCTOU race. |

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

- Ten functions were adopted/generalized across `object`, `sort`, and
  `validation`; one blocked-key helper remains internal.
- Four network/field-coercion exports remain app-owned.
- Two contained-path exports are the leading candidates for the future Node-only
  entry point and are deferred until its security and error contracts are set.
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

## Remaining portfolio audit

- [x] Client `DOM.js`, `Data.js`, and `Debug.js` (32 exports); empty
  `buildNav.js` is classified and has no public surface.
- [ ] Copied server `file.js`, `time.js`, `utils.js`, and `validation.js` (58 exports).
- [ ] Scheduler/recurrence, socket, auth-cookie, and SMS modules (13 exports).
- [ ] Replace remaining group totals with a verified per-module completion table.
