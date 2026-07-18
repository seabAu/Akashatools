# Akashatools API conventions

This document defines the default rules for Akashatools 2.x. A public function
may differ only when its domain requires different behavior and its JSDoc clearly
explains the exception.

## Import and namespace conventions

Akashatools provides four first-class styles:

```js
import akasha from "akashatools";
akasha.array.chunk(values, 10);
akasha.chunk(values, 10);

import { chunk } from "akashatools";
import { chunk as chunkArray } from "akashatools/array";
import granularChunk from "akashatools/array/chunk";
```

- `akasha` is the canonical default-import name in documentation. A consumer may
  rename a default import locally.
- The default object exposes both flat utilities and categorized namespaces.
- The default object and nested categories are frozen.
- Flat properties and their categorized/named equivalents must share identity.
- Flat-name collisions are build-breaking errors. A function must be renamed,
  retained only in a category, or given an explicit unambiguous alias.
- Named root, category, and granular method imports are preferred when bundle
  size and explicit dependencies matter. The default namespace prioritizes
  editor discovery. Granular wrappers expose the canonical function as both a
  default and named export and never contain a second implementation.
- A current esbuild smoke measurement produces identical focused bundles for a
  named-root `chunk` import and an `akashatools/array` import. Bundle behavior is
  a release gate and must be rechecked as the namespace grows.
- Canonical categories use full words. Abbreviations such as `val`, `str`, `rand`,
  and `ao` belong only to documented legacy compatibility surfaces.
- Akashatools 2.0 does not provide an implicit chain or callable wrapper.

## Canonical categories

| Category | Status for 2.0 | Scope |
| --- | --- | --- |
| `array` | implemented | Array-specific immutable transforms and queries. |
| `async` | implemented | Promise coordination, delay, and bounded async work. |
| `browser` | implemented | Browser effects that are safe to import universally. |
| `collection` | implemented | Identity-based operations shared across collection shapes. |
| `data` | implemented | Runtime type analysis and initialized data defaults/shapes. |
| `date` | implemented | Instants, local calendar dates, clocks, and formatting. |
| `hash` | implemented | Native cryptographic digests, checksums, and deterministic strict-JSON identifiers. |
| `http` | implemented | Bounded Fetch, cancellation, parsing, redaction, and typed HTTP errors. |
| `input` | implemented | Framework-neutral input/control inference and field descriptors. |
| `number` | implemented | Finite-number arithmetic and numeric transforms. |
| `object` | implemented | Plain objects, paths, copies, selection, and merging. |
| `random` | implemented | Explicitly non-cryptographic pseudo-random operations. |
| `sort` | implemented | Stable comparison and immutable ordering. |
| `string` | implemented | Case, replacement, escaping, and serialization helpers. |
| `validation` | implemented | Literal predicates, normalization, and contract checks. |
| `function` | implemented | Receiver-preserving once, memoization, and timer control with explicit outcome policy. |
| `node` | implemented subpath | Node-only filesystem, path, and runtime operations; never flattened into the universal root. |

`schema` and `debug` are explicitly not 2.0 categories. The reviewed schema
languages are app/framework contracts, and reviewed diagnostics are console
wrappers or application coordinators. The generic JSON-contract subset remains
under `validation`; detailed rationale is in
[`OPTIONAL_SURFACE_DECISIONS.md`](./OPTIONAL_SURFACE_DECISIONS.md). Environment-
specific code must be safe to import: browser globals are resolved only when an
effect runs, and Node-only modules stay under `akashatools/node`.

## Naming

- Functions use `camelCase`; categories and package subpaths use lowercase words.
- Predicates begin with `is`, `has`, or `can` and return booleans.
- Conversions use `toX` when they return a different representation and
  `fromX` when the input representation is the important part of the contract.
- Formatting uses `formatX`; parsing uses `parseX` when invalid syntax throws and
  a domain-specific name when invalid input deliberately returns `null`.
- Mutating functions include a clear mutation signal in the name. Collection
  utilities are immutable by default.
- Security-relevant strength is explicit. A `randomString` based on `Math.random`
  must never be described as secure; cryptographic helpers include `secure` in
  their names.
- Canonical public names avoid source-project vocabulary unless the behavior is
  independently meaningful to all consumers.

## Arguments and option objects

- Required data arguments come first. An optional configuration object is last.
- Prefer an option object over positional booleans.
- Callback names are consistent:
  - `predicate(value, index, collection)` decides inclusion or a match;
  - `mapper(value, index, collection)` transforms a value;
  - `toKey(value, index)` derives identity or a grouping key;
  - `compare(left, right)` returns a negative, zero, or positive number.
- Options are read without mutation. Reusable option objects remain valid.
- Cancellable asynchronous functions accept `signal` in the final option object.
- Randomized functions accept an injectable random source when deterministic
  testing or seeded behavior is useful. The source must follow `Math.random` and
  return a finite value in the half-open interval `[0, 1)`.

## Validation and coercion

- Programmer-contract violations throw instead of being silently corrected.
- Akashatools does not coerce strings to numbers or booleans unless conversion is
  the function's explicit purpose.
- Nullish means only `null` and `undefined`.
- Falsy values `0`, `false`, and `""` remain valid values unless the function is
  explicitly checking blank or empty input.
- `NaN` and infinite values are rejected by finite-number contracts.
- Primitive-type predicates are deliberately literal: `isString`, `isNumber`,
  and `isBoolean` reject boxed values, while `isNumber` accepts `NaN` and
  infinities because it answers a type question. Use `isFiniteNumber` for
  arithmetic contracts.
- `isNonArrayObject` is the broad object-shape predicate and includes Dates,
  Maps, Sets, and class instances. Use `isPlainObject` when prototypes and
  enumerable data semantics matter.
- `isArray` intentionally mirrors `Array.isArray`. Its public wrapper is retained
  because the active consumers use the validation namespace as their editor-
  discoverable predicate vocabulary and because it works across realms.
- The explicitly named legacy numeric-order comparator may coerce number-like
  ordering fields; general numeric helpers never do.
- BigInt arithmetic stays native until consumer evidence justifies a separate
  BigInt-specific contract. Number range and rounding helpers do not accept both
  numeric domains under one signature.
- Browser-only values are checked through safe `globalThis` feature detection or
  runtime injection; importing a universal module must not require a browser.

## Ranges, indices, and boundaries

- Numeric ranges are start-inclusive and end-exclusive by default.
- A function with inclusive end behavior states so in its name or options.
- Array indices are zero-based safe integers.
- Negative indexing is unsupported unless explicitly documented.
- Date-range boundaries must identify whether they represent instants, local
  calendar dates, or zoned times and whether each boundary is inclusive.

## Return and not-found behavior

- Pure collection transforms return fresh collections, including valid no-op
  results, unless structural sharing is part of the documented contract.
- Predicates return `false` for ordinary non-matches and throw for invalid API
  usage.
- Parsers return `null` only when invalid user syntax is an expected result;
  programming errors still throw.
- Lookup functions return `undefined` for absent JavaScript properties unless a
  caller-provided fallback is part of the signature.
- Functions that need removal/update metadata use a result object rather than
  changing return type through a boolean flag.
- Asynchronous batch functions document whether failures reject the whole call or
  appear as per-item results.

## Errors

- Use `TypeError` for wrong argument kinds or invalid structural contracts.
- Use `RangeError` for valid kinds outside supported numeric/index ranges.
- Operational errors retain their original `cause` when wrapped.
- Domain errors expose stable named properties rather than forcing callers to
  parse message text.
- Utilities do not log errors, swallow callback exceptions, or silently return a
  fallback unless that behavior is their explicit contract.
- Error messages identify the invalid argument or operation but do not include
  secrets, tokens, passwords, or unrestricted response bodies.

## Mutation and side effects

- Arrays and objects supplied by callers are not mutated by default.
- Names and JSDoc explicitly identify unavoidable mutation.
- File, network, storage, download, timer, and logging functions are categorized
  as effects and document cleanup/cancellation behavior.
- Importing a module performs no I/O, logging, global mutation, prototype changes,
  timer creation, or environment probing with observable effects.
- `sideEffects: false` remains valid for every published module.

## Sparse arrays

- Array transforms treat a sparse slot as an `undefined` sequence item and
  return dense arrays by default. This keeps callbacks, indices, and output
  length consistent across iterator and index-based implementations.
- `array.flatten` deliberately follows native `Array.prototype.flat` semantics,
  which remove sparse slots at flattened levels.
- `array.asArray` deliberately returns an array input unchanged, so it preserves
  both identity and sparsity. Its fallback copy is dense.
- A utility that differs from these rules must state the exception in JSDoc and
  include sparse-input tests.

## Arrays and generic iterables

- Array-category functions require arrays when their contracts expose indices,
  sparse-slot behavior, bounded insertion, or array return types.
- The reviewed Mindspace, portfolio, and COMPOSR consumers do not pass Sets,
  Maps, generators, or other iterables to these positions. Generic iterable
  overloads are therefore deferred until a real consumer benefits without a
  surprising return type or one-shot-consumption rule.
- APIs that naturally consume another collection kind name and type it directly,
  such as the `Set` accepted by `collection.excludeBy`.

## Public JSDoc

Every public utility includes:

- a concise behavioral summary;
- `@template` declarations for useful generics;
- every `@param`, including callback and option shapes;
- an accurate `@returns` annotation;
- `@throws` for observable contract failures;
- an `@example` when the contract is not obvious from the signature;
- `@deprecated` with a replacement for compatibility aliases;
- important mutation, boundary, security, locale, or environment notes.

The source remains strict-checkable JavaScript. Type assertions may support the
checker internally, but they must not hide an inaccurate public contract.

## Compatibility aliases

- A canonical function has one primary name.
- Aliases call or reference the canonical implementation and are tested for
  behavioral compatibility.
- Aliases do not emit unconditional runtime warnings.
- Compatibility names are listed in the migration guide and machine-readable
  alias manifest.
- The `akashatools/lib/*` surface is temporary. Its removal version will be set
  only after real consumer fixtures establish a safe migration path.
