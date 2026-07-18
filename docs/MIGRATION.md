# Akashatools 2026 migration

The full active work plan is maintained in
[LIVING_CHECKLIST.md](LIVING_CHECKLIST.md). This document summarizes the audit
and first-alpha migration decisions; the living checklist is authoritative for
remaining work and completion criteria.

The per-export source review and migration disposition are maintained in
[UTILITY_INVENTORY.md](UTILITY_INVENTORY.md).

## Source audit

The initial audit covered four source sets:

| Source | Audited locations | Reusable themes |
| --- | --- | --- |
| Akashatools 1.0.2 | `lib/*.js` | arrays/objects, validation, strings, math, random, dates, HTTP, files, debug |
| Mindspace | `app/client/src/lib/utilities`, `app/server/utilities` | arrays, nested data, validation, local dates, sorting, random data |
| Portfolio rebuild | `client/src/utilities`, `server/utilities`, `shared/contracts` | safe field paths, own-property filtering, stable ordering, JSON contracts |
| COMPOSR | `app/packages/utilities` | bounded async work, settled-result filtering, ID collections, browser files |

The migration copies behavior, not files. Each adopted utility is reviewed for
generic applicability, duplication, failure behavior, platform dependencies,
security, and modern native equivalents before entering the public API.

The source directories were refreshed and active Akashatools usage was parsed
again on 2026-07-16. The reproducible results, parser boundaries, and remaining
manual migration cases are recorded in
[CONSUMER_USAGE_AUDIT_2026-07-16.md](inventory/CONSUMER_USAGE_AUDIT_2026-07-16.md).

## Included in alpha 1

- Array primitives from Akashatools and Mindspace were consolidated into strict,
  immutable implementations. `removeFromArray` replaces separate index, value,
  and predicate-removal variants.
- COMPOSR's `mapSettledWithConcurrency`, `fulfilledValues`, ID-based collection
  operations, and browser download behavior were generalized and documented.
- The portfolio rebuild's safe nested field paths, allowed-property filtering,
  and JSON contract checks were generalized. Nested writes and deep merges reject
  `__proto__`, `prototype`, and `constructor` path segments.
- Date and clock helpers shared by Mindspace and the portfolio were reduced to a
  small local-calendar core. Formatting delegates to `Intl.DateTimeFormat`.
- Legacy recursive Fibonacci and decimal-to-binary implementations were replaced
  with iterative Fibonacci and native integer conversion.
- Legacy JSON cloning was replaced by `structuredClone`, preserving supported
  Dates, Maps, Sets, typed arrays, and circular references.

## Deliberately excluded from the generic core

- Express response helpers, authentication cookies, Mongoose schema inspection,
  database document fetching, Socket.IO registries, and notification services.
- React hooks, DOM rendering components, navigation state, queue processors, and
  Mindspace-specific scheduling or recurrence policy.
- Portfolio admin/session behavior, storage policy, and COMPOSR profiler bundle
  contracts that depend on application-owned types.
- General file reads, writes, and deletion until their Node-only encoding,
  abort, atomicity, and operation-time containment contracts are designed.
  Lexical/realpath containment and bounded native path discovery are available.
- Application HTTP authentication, response envelopes, UI effects, SSRF policy,
  and retries. The generic bounded one-attempt transport is now `http.request`.

These are not rejected forever. They require environment-specific entry points or
clear generic contracts before becoming package APIs.

## API rules

1. Public functions have JSDoc for parameters, generics, return values, and
   observable error behavior.
2. Collection operations are immutable unless explicitly named otherwise.
3. Invalid programmer input throws; an ordinary no-match result does not.
4. Callbacks are allowed to throw. Utilities do not log and silently swallow
   callback failures.
5. Native platform functionality is preferred when it is supported by the
   package's Node/browser floor and has clearer semantics.
6. Every category is importable directly, and every public function is fronted
   by `src/index.js` as a named export.

## Namespace migration examples

Replace the legacy nested wildcard style with the default namespace when editor
dot-completion is the priority:

```js
// 1.x
import * as utils from "akashatools";
utils.val.isBlank(value);
utils.ao.flatten(values);
utils.str.toKebabCase(label);

// 2.x
import akasha from "akashatools";
akasha.validation.isBlank(value);
akasha.array.flatten(values);
akasha.string.kebabCase(label);
```

For focused imports, move directly to canonical functions or category modules:

```js
import { flatten, isBlank, kebabCase } from "akashatools";
// or
import * as array from "akashatools/array";
array.flatten(values);
// or one generated method subpath (default and named exports are identical)
import flattenMethod from "akashatools/array/flatten";
```

The old and new functions are not assumed behavior-identical. In particular,
2.x rejects invalid arguments visibly, avoids hidden mutation/coercion, and uses
explicit options for ambiguous operations. Consult
[FUNCTION_INDEX.md](FUNCTION_INDEX.md) for replacements versus related APIs.

## Important behavioral changes

| Area | 1.x behavior | 2.x behavior |
| --- | --- | --- |
| Invalid arguments | Many helpers returned fallbacks, logged, swallowed errors, or failed later. | Programmer-contract violations throw `TypeError`/`RangeError`; operational errors retain causes. |
| Array removal | Index, numeric value, and predicate selection were spread across ambiguous helpers. | `removeFromArray` is immutable and requires `mode: "value"` for numeric values. |
| Sparse arrays | Behavior varied by native method and incidental loops. | Transforms document dense-undefined semantics; `flatten` deliberately follows native hole removal. |
| Nested properties | Several helpers read inherited keys or allowed prototype-mutating paths. | Path APIs use own properties and reject `__proto__`, `prototype`, and `constructor`. |
| Cloning/merging | JSON/recursive clones lost built-ins and merge variants mutated or invoked getters. | `deepClone` uses `structuredClone`; `deepMerge` has bounded plain-data semantics. |
| Validation | `valid`/`isValid`/`isTruthy` changed meaning by type and conflated legitimate falsy values. | Explicit predicates distinguish primitive type, arrays, broad objects, plain objects, blank/empty values, finite numbers, and domain syntax; `defaultIfBlank` preserves legitimate `0` and `false` values. |
| Random numbers | `rand` accepted `(maximum, minimum)` and all randomness looked interchangeable. | `randomFloat` uses `(minimum, maximum)`; secure IDs/strings are separately named Web Crypto APIs. |
| Dates/timestamps | Some “seconds” helpers actually returned milliseconds or silently substituted now. | Unix-second and instant-range APIs use strict units and explicit boundaries. |
| HTTP | Legacy wrappers delayed, logged/swallowed, and resolved some errors as values. | `http.request` performs one bounded attempt and throws typed, redacted `HttpError` instances. |
| Side effects | Prototype-extension and logging modules could alter globals or console output. | Canonical imports are inert; browser/network effects are explicitly named. |

## Legacy path lifetime

Akashatools 2.0 retains `akashatools/lib` and `akashatools/lib/*.js` as archival
migration paths. It does not add an `akashatools/legacy` alias: another namespace
would imply a newly supported coherent API while duplicating known broken and
ambiguous behavior. The `lib` paths are eligible for removal no earlier than
3.0, only after real-consumer fixtures pass, migration data is stable, and the
removal receives explicit approval. No 2.0 codemod is planned until those
fixtures show that mechanical rewriting can preserve intent.

## Remaining phases

1. Extend the new Node-only `akashatools/node` surface only after file discovery
   and safe read/write/delete contracts address encoding, aborts, atomicity, and
   operation-time containment.
2. Exercise the adopted Fetch surface in consumer fixtures before adding any
   retry or application-client policy.
3. Consolidate the remaining date-range, timezone, schema-to-model, sort, and
   deep-search candidates after source-specific behavior tests are captured.
4. Add generated declaration files or a TypeScript build if downstream editor
   testing shows JSDoc-only types are insufficient.
5. Run compatibility fixtures in existing consumers before removing any 1.x
   alias or publishing the stable 2.0.0 release.
