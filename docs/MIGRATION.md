# Akashatools 2026 migration

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
- Filesystem utilities until a separate Node-only entry point and path-containment
  contract are designed.
- HTTP wrappers until cancellation, retry, timeout, body parsing, and error-shape
  contracts are specified independently of the source applications.

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

## Remaining phases

1. Add a Node-only `akashatools/node` surface for contained filesystem paths,
   file discovery, and safe file reads/writes.
2. Specify a fetch surface around `AbortSignal`, timeouts, typed HTTP errors, and
   response parsing before replacing the legacy HTTP module.
3. Consolidate the remaining date-range, timezone, schema-to-model, sort, and
   deep-search candidates after source-specific behavior tests are captured.
4. Add generated declaration files or a TypeScript build if downstream editor
   testing shows JSDoc-only types are insufficient.
5. Run compatibility fixtures in existing consumers before removing any 1.x
   alias or publishing the stable 2.0.0 release.
