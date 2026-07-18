# Active-consumer behavior-risk audit — 2026-07-18

This is a read-only behavioral refresh of the current Mindspace, portfolio
rebuild, COMPOSR, and SPLICR working copies. It extends the 2026-07-16 legacy
member inventory from “which utility is read?” to “how is that utility used?”
No consumer file was changed.

The scanner now records static namespace calls, non-call references, argument
counts, result contexts, calls lexically inside a `try` block, direct legacy
subpath bindings, unused subpath bindings, dynamic namespace access, and
potential legacy-shaped reads in files that Babel cannot parse. The result is
reproducible with:

```sh
node scripts/audit-legacy-consumers.mjs --summary "<consumer-source-root>"
node scripts/audit-legacy-consumers.mjs --counts-only "<consumer-source-root>"
```

Backups, dependencies, generated output, caches, build artifacts, virtual
environments, and retired-code directories remain excluded. Static syntax
describes use shape; it cannot prove runtime values, UI behavior, or application
intent.

## Current source results

| Source | Parsed source files | Parse failures / recoverable diagnostics | Root namespace files | Static root reads | Calls / non-call references | Legacy subpath bindings / calls |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mindspace client `src` | 1,066 | 3 / 30 | 262 | 1,526 | 1,526 / 0 | 6 / 5 |
| Mindspace server | 473 | 0 / 10 | 0 | 0 | 0 / 0 | 0 / 0 |
| Portfolio rebuild | 1,385 | 2 / 4 | 61 | 455 | 454 / 1 | 2 / 3 |
| COMPOSR `packages` | 186 | 0 / 1 | 0 | 0 | 0 / 0 | 0 / 0 |
| SPLICR JavaScript/TypeScript | 1 | 0 / 0 | 0 | 0 | 0 / 0 | 0 / 0 |
| **Total** | **3,111** | **5 / 45** | **323** | **1,981** | **1,980 / 1** | **8 / 8** |

The eight subpath calls come from six used bindings: `getType` and
`getFieldType` in both clients plus two Mindspace date formatters. Two
`handleFetch` imports in Mindspace are unused. There are no computed/dynamic
reads from an imported Akashatools root namespace.

The five unrecoverable files were inspected through the scanner's conservative
text fallback. Only Mindspace's malformed and already `_unused`
`lib/hooks/_unused/useApi.js` contains legacy-shaped reads: undeclared
`utils.val.isObject` and `utils.ao.filterKeys`. The other four contain no such
candidate. These two reads remain evidence of an ambient-global defect, not
part of the 1,981 successfully parsed imported-member reads.

## Result-use evidence

Every one of the 1,980 parsed namespace calls consumes its result; none is a
standalone discarded expression. The scanner classifies the immediate semantic
container after transparent `await`/TypeScript wrappers:

| Result context | Calls |
| --- | ---: |
| Condition | 975 |
| Logical/conditional composition | 598 |
| Unary, binary, or template transformation | 166 |
| Variable or assignment target | 117 |
| Argument to another call | 66 |
| JSX rendering | 32 |
| Returned or yielded | 19 |
| Collected into an object, array, or spread | 7 |
| **Total** | **1,980** |

Fifty-six calls are lexically inside a `try` block; 1,924 are not. None of the
eight direct-subpath calls is inside a `try` block. This is syntax evidence only:
it does not prove that an outer catch handles an asynchronous rejection or that
the application intends a fallback.

The only non-call reference is portfolio
`client/src/utilities/Debug.js:57`, where `utils.val.isObjectArray` is used as a
truthy function object instead of being called. That branch is a proven source
defect, not a legacy contract that 2.0 should preserve.

## Mutation findings

- No active legacy call relies *only* on a discarded return value, so the scan
  finds no call site whose sole observable contract is an internal side effect.
- Both active `ao.findAndSetObject` calls pass a shallow-spread object into a
  state setter and consume the returned object. That protects the root object,
  but the legacy recursive implementation can still mutate aliased nested
  objects. A bounded migration must verify nested identity rather than replacing
  it textually.
- All 17 `ao.deepFindSet` results are consumed: 11 are assigned and six are
  passed onward. The legacy recursion is incomplete and often returns
  `undefined`; callers do not establish a sound mutation contract.
- All seven `ao.flattenObjArray` results are consumed. Three export paths pass
  table data directly, while four table-render paths first add indices. Its
  nested `flattenObj` implementation writes `"-"` into nullish input slots, so
  source aliasing remains a runtime migration check even though the result is
  used.

Canonical 2.0 transforms stay immutable unless their names and documentation
explicitly say otherwise. These findings support that policy, but they do not
prove that every application view tolerates the identity change.

## Swallowed-error findings

- The two imports of legacy `http.handleFetch`—whose implementation converts
  fetch failures into response-shaped fallbacks—have zero references. Current
  parsed source therefore has no active call-site dependency on that swallowed
  network-error behavior.
- `ao.getObjKeys` catches any `Object.keys` error and returns a sentinel row. Its
  three active results are assigned. Each caller first establishes a nonempty
  table array, but static syntax cannot prove the first item is always a record
  or that the sentinel is never rendered.
- The representative compatibility fixtures deliberately assert strict thrown
  failures and rejected Promises. They do not turn the three application table
  paths into runtime evidence.

## Loose-coercion and argument findings

| Legacy contract | Active calls | Static evidence requiring an explicit migration choice |
| --- | ---: | --- |
| `val.isValidArray` | 773 | 749 calls pass the legacy length flag and 24 omit it. The old helper also rejects arrays whose first slot is `undefined`; `isNonEmptyArray` intentionally tests length instead. |
| `val.isValid` | 40 | 36 use the umbrella default and four request “empty” checking. Callers must choose defined, blank, empty, or domain-specific semantics. |
| `val.isTruthy` | 16 | The old name means “defined and not an empty string,” not JavaScript truthiness. |
| `rand.rand` | 47 | 35 calls pass two arguments and 12 pass a third boolean that legacy silently ignores. The callers generally use intuitive `(minimum, maximum)` order; canonical `randomFloat` uses that order, but the ignored third argument must be removed rather than reinterpreted as a random-source function. |
| `file.checkImageURL` | 3 | This is an extension regex whose `RegExp.test` path coerces non-strings; it does not validate an image resource. Keep the presentation heuristic local or adopt an explicitly named syntax check. |

These are the highest-volume drift risks, not permission to preserve ambiguous
aliases. The migration manifest retains the per-member canonical direction.

## Environment findings

- No parsed consumer performs a computed access through an imported Akashatools
  root namespace.
- There are no active `utils.val.isFile` or `utils.val.isBlob` reads, the legacy
  predicates that directly require `window`, `File`, and `Blob`.
- Both browser/network-global `handleFetch` bindings are unused.
- The only ambient `utils` evidence is the two-read malformed `_unused`
  Mindspace hook described above.

This materially narrows the environment-global risk, while still leaving
browser rendering and real request behavior to application-owned tests.

## Gate conclusion

The static gate now proves complete use-shape coverage for all 1,981 parsed root
member reads, eight direct-subpath calls, unused legacy bindings, dynamic access,
try containment, and malformed-file candidates in the current working copies.
It also proves specific mutation/error/global defects that must not be copied.

It does **not** prove whole-application drop-in compatibility. Runtime values,
nested alias identity, rendered table fallbacks, random-output expectations, and
the `isValidArray` first-slot distinction require an authorized bounded migration
with each application's own tests. The Phase 9 runtime gate therefore remains
open without blocking local Akashatools engineering.
