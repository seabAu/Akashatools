# Akashatools 2026 migration

The full active work plan is maintained in
[LIVING_CHECKLIST.md](LIVING_CHECKLIST.md). This document summarizes the audit
and current alpha migration decisions; the living checklist is authoritative for
remaining work and completion criteria.

The per-export source review and migration disposition are maintained in
[UTILITY_INVENTORY.md](UTILITY_INVENTORY.md).

## Source audit

The audit covers the current working copies of six source sets:

| Source | Audited locations | Reusable themes |
| --- | --- | --- |
| Akashatools 1.0.2 | `lib/*.js` | arrays/objects, validation, strings, math, random, dates, HTTP, files, debug |
| Mindspace | `app/client/src/lib/utilities`, `app/server/utilities` | arrays, nested data, validation, local dates, sorting, random data |
| Portfolio rebuild | `client/src/utilities`, `server/utilities`, `shared/contracts` | safe field paths, own-property filtering, stable ordering, JSON contracts |
| COMPOSR | `app/packages/utilities` | bounded async work, settled-result filtering, ID collections, browser files |
| SPLICR | `app` utility sources | bounded text work, provider-neutral text metrics, offsets, similarity helpers |
| Excepted modules | repository-level `(excepted modules)` | geospatial data, datatype parsing, form controls, media queries, strict JSON storage |

The migration copies behavior, not files. Each adopted utility is reviewed for
generic applicability, duplication, failure behavior, platform dependencies,
security, and modern native equivalents before entering the public API.

The source directories were refreshed and active Akashatools usage was parsed
again on 2026-07-16. The reproducible results, parser boundaries, and remaining
manual migration cases are recorded in
[CONSUMER_USAGE_AUDIT_2026-07-16.md](inventory/CONSUMER_USAGE_AUDIT_2026-07-16.md).
The subsequent current-working-copy regression delta is recorded in
[SOURCE_REFRESH_2026-07-18.md](inventory/SOURCE_REFRESH_2026-07-18.md); it
includes dirty and untracked source without modifying any consumer project.

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
- The excepted `Geo.js` behavior became a provider-neutral `geo` category with
  canonical GeoJSON coordinate order, range validation, Haversine distance,
  bounded searches, and deterministic Feature/FeatureCollection construction.
- The unfinished `Schema.js` input formatter became strict pure parsing through
  `createInputValueParser` and `parseInputValue`; browser control extraction is
  separately available as `inputValueFromControl`.
- Portable `DOM.js` and `LocalDB.js` behavior became late-bound media-query
  helpers and strict JSON storage helpers that require an explicit Storage
  implementation. React rendering and product database layouts remain excluded.

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
| Random numbers | `rand` accepted `(maximum, minimum)`, empty ranges, and all randomness looked interchangeable. | `randomFloat` uses a strict nonempty half-open `(minimum, maximum)` range that cannot return the maximum; secure IDs/strings are separately named Web Crypto APIs. |
| Dates/timestamps | Some “seconds” helpers actually returned milliseconds or silently substituted now. | Unix-second and instant-range APIs use strict units and explicit boundaries. |
| HTTP | Legacy wrappers delayed, logged/swallowed, resolved some errors as values, and used loose response/header parsing. | `http.request` performs one bounded attempt, recognizes exact JSON media types, bounds decoded bodies independently of declared length, and throws typed, redacted `HttpError` instances. |
| Sorting | Legacy comparators rebuilt locale state, reread mutable criteria, and left mixed or invalid numeric values inconsistently ordered. | Stable copied sorts snapshot criteria, provide a deterministic mixed-type comparison order, and place invalid numeric-order values after every valid finite number. |
| Geospatial data | Mapbox-oriented helpers mixed coordinate orders, random jitter, HTML, degree boxes, and broken array validation. | `geo` uses canonical `[longitude, latitude]`, strict normalization, real spherical distance, explicit units, bounded searches, and deterministic GeoJSON. |
| Serialized input values | `formatInputValue` mixed event extraction with lossy `parseInt`, truthiness, and incomplete datatype branches. | Pure parsing supports strict scalar, date/time, JSON, collection, URL, RegExp, binary, typed-array, error, and branded-value policies; compiled parsers avoid repeated setup. |
| Type identifiers | Datatype, HTML input, and composite-control strings were repeated across helpers and applications. | Frozen `DATA_TYPES`, `INPUT_TYPES`, and `CONTROL_TYPES` vocabularies provide canonical references and exact TypeScript unions; compatible literal strings remain accepted. |
| Browser controls and storage | Helpers depended on ambient browser globals, event shapes, or product database names and sometimes swallowed or broke writes. | Browser work is late-bound; semantic controls are extracted explicitly and JSON storage requires a caller-provided Storage object with visible failures and work bounds. |
| Side effects | Prototype-extension and logging modules could alter globals or console output. | Canonical imports are inert; browser/network effects are explicitly named. |

## Excepted-module replacements

The repository-level source files were not copied into the package. Their
portable intent maps to composed APIs as follows:

```js
import {
  createGeoJsonFeature,
  createGeoJsonFeatureCollection,
  createInputValueParser,
  filterPositionsWithinDistance,
} from "akashatools";
import {
  inputValueFromControl,
  prefersColorScheme,
  readJsonStorage,
  writeJsonStorage,
} from "akashatools/browser";

const parseCount = createInputValueParser("number");
const count = parseCount(inputValueFromControl(numberInput));

const nearby = filterPositionsWithinDistance(center, points, 5, {
  unit: "kilometers",
});
const collection = createGeoJsonFeatureCollection(
  nearby.map((position) => createGeoJsonFeature("Point", position)),
);

const theme = prefersColorScheme() ? "dark" : "light";
const settings = readJsonStorage(localStorage, "settings", { fallback: {} });
writeJsonStorage(localStorage, "settings", { ...settings, theme });
```

Legacy latitude-first arrays must opt in with the documented `arrayOrder`
option. Date/time parsing similarly requires explicit policy whenever converting
a local wall-clock value into an instant. Offset gaps are rejected, and repeated
host-local times require `dateDisambiguation: "earlier"` or `"later"`; rejection
is the default. These choices prevent silent axis swaps and host-timezone-dependent
results.

## Legacy path lifetime

Akashatools 2.0 retains `akashatools/lib` and `akashatools/lib/*.js` as archival
migration paths. It does not add an `akashatools/legacy` alias: another namespace
would imply a newly supported coherent API while duplicating known broken and
ambiguous behavior. The `lib` paths are eligible for removal no earlier than
3.0, only after real-consumer fixtures pass, migration data is stable, and the
removal receives explicit approval. No 2.0 codemod is planned until those
fixtures show that mechanical rewriting can preserve intent.

## Remaining external phases

1. Capture the configured hosted Node 22, Node 24, and three-engine browser
   workflow result from a clean checkout after a push is explicitly authorized.
2. With explicit authorization, migrate bounded real application areas and run
   their complete integration suites; repository fixtures cannot prove every
   dependency on historical coercion, mutation, or swallowed failures.
3. Remove no 1.x compatibility path before real migrations support that decision
   and the removal is separately approved.
4. Publish, tag, push, or change release automation only after explicit approval
   of the exact commit, version, npm dist-tag, and provenance setup.
