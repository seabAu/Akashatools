# Active consumer legacy-usage audit — 2026-07-16

This audit measures current Akashatools 1.0.2 imports and member reads in the
read-only Mindspace, portfolio rebuild, COMPOSR, and SPLICR working copies. It
answers a different question from the symbol inventories: not merely which
utilities exist, but which legacy contracts current application code actually
invokes.

No consumer source was changed. The reproducible scanner is
`scripts/audit-legacy-consumers.mjs`; it parses JavaScript, JSX, TypeScript, and
TSX with Babel error recovery, associates namespace aliases with static package
imports, records direct and subpath imports, and correlates every member with
`docs/LEGACY_MANIFEST.json`.

```sh
node scripts/audit-legacy-consumers.mjs --summary "<consumer-source-root>"
node scripts/audit-legacy-consumers.mjs --counts-only "<consumer-source-root>"
```

Backups, generated output, dependencies, virtual environments, coverage, and
retired-code directories are excluded. The portfolio command was run through
its required `rtk` wrapper.

## Results

| Source | Parsed source files | Root namespace import files | Legacy subpath imports | Member reads | Unique members | Direct / related / no canonical reference |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mindspace client `src` | 1,055 | 263 | 5 | 1,527 | 37 | 1,352 / 159 / 16 |
| Mindspace server | 470 | 0 | 0 | 0 | 0 | 0 / 0 / 0 |
| Portfolio rebuild | 938 | 61 | 1 | 455 | 39 | 305 / 130 / 20 |
| COMPOSR `packages` | 150 | 0 | 0 | 0 | 0 | 0 / 0 / 0 |
| SPLICR JavaScript/TypeScript | 1 | 0 | 0 | 0 | 0 | 0 / 0 / 0 |

“Direct” means the manifest has a canonical reference marked as a replacement;
it does not mean a blind textual rewrite is safe. “Related” requires explicit
composition or policy selection. All 1,982 parsed member reads resolve to a
reviewed legacy-manifest entry; none is an unknown export.

SPLICR is primarily Python. Its portable chunking and measurement algorithms are
covered by the separate source refresh and executable JavaScript compatibility
fixture rather than by JavaScript namespace imports.

### Parser boundary evidence

- Babel recovered an AST while reporting 30 Mindspace-client and 4 portfolio
  diagnostics. These files remain included in the counts.
- Three Mindspace files were unrecoverable. Two contain no Akashatools access.
  The third, `lib/hooks/_unused/useApi.js`, contains two undeclared `utils` reads
  but no package import; it is evidence of an ambient-global defect and is not
  included in the 1,527 imported-member count.
- Two portfolio files were unrecoverable; targeted text inspection found no
  Akashatools import or `utils.*` read in either.
- Mindspace server diagnostics were recoverable and yielded no package imports.

## Highest-volume migration contracts

| Legacy member | Combined reads | Canonical direction | Required migration decision |
| --- | ---: | --- | --- |
| `val.isValidArray` | 777 | `array.isNonEmptyArray` | Legacy rejects arrays whose first item is undefined; verify whether callers mean nonempty or that accidental sentinel rule. |
| `val.isObject` | 409 | `validation.isNonArrayObject` or `object.isPlainObject` | The new non-array guard preserves the broad Date/Map/class-instance shape; record-like consumers should deliberately choose the plain-object guard. |
| `val.isDefined` | 167 | `validation.isDefined` | Direct strict non-nullish replacement. |
| `ao.has` | 132 | `object.hasAtPath` or `object.findDeep` | Select known-path versus bounded recursive-key semantics per call site. |
| `val.isString` | 60 | `validation.isString` | Primitive-only replacement; boxed String objects intentionally stop passing. |
| `str.toCapitalCase` | 49 | `string.capitalize` | Verify whether each caller expects only the first Unicode code point changed. |
| `val.isArray` | 48 | `validation.isArray` | Direct cross-realm array replacement; native `Array.isArray` is also valid. |
| `rand.rand` | 47 | `random.randomFloat` | Apply the documented breaking correction to minimum/maximum argument order. |
| `val.isValid` | 40 | Explicit validation predicate | Choose `isDefined`, `isBlank`, `isEmpty`, or domain validation; the umbrella legacy meaning is intentionally rejected. |
| `ao.deepGetKey` | 32 | `object.findDeep(... )?.value` | Accept bounded plain-data traversal and undefined for no match instead of legacy null/unsafe traversal. |
| `ao.filterKeys` | 29 | `object.pick` | Direct immutable own-property replacement. |
| `ao.cleanJSON` | 14 | Application/schema policy | The legacy function creates type-default examples rather than cleaning JSON; no universal replacement is appropriate. |
| `ao.replaceIfInvalid` | 10 | `validation.defaultIfBlank` | New behavior treats every whitespace-only string as blank rather than only exactly one space. |

## Canonical APIs added from live usage

The call-site evidence justified seven small strict validation utilities rather
than repeated native checks or ambiguous aliases:

| Canonical utility | Legacy reads addressed | Contract |
| --- | ---: | --- |
| `isArray` | 48 | Cross-realm array predicate. |
| `isString` | 60 | Primitive string predicate. |
| `isNumber` | 23, including `isNum` | Primitive number predicate; NaN and infinities remain numbers. |
| `isBoolean` | 6 | Primitive boolean predicate. |
| `isNonArrayObject` | 409 | Non-null object excluding arrays and functions. |
| `isFiniteNonInteger` | 3 | Finite number with a fractional part. |
| `defaultIfBlank` | 10 | Preserve zero/false; replace nullish or whitespace-only input. |

The residual 36 reads without a canonical reference are intentional: schema
example generation (`cleanJSON`), collision-prone object flattening, custom
query/UI adapters, operations better written with native array methods, and two
provably broken time-estimate functions. They do not justify expanding the
universal API.

## Why the whole-app gate remains open

Static evidence proves the import footprint and maps every named operation, but
it cannot prove runtime intent for ambiguous predicates, mutation, swallowed
errors, argument order, browser globals, or app-owned fallback policy. The first
authorized migration should therefore start with direct validation replacements
in one bounded Mindspace surface, run that application’s focused tests, and only
then proceed to recursive AO helpers. Until that happens, Akashatools must not
claim drop-in compatibility.

