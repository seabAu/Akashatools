# Akashatools

Akashatools is a dependency-free collection of focused JavaScript utilities for
arrays, objects, strings, numbers, dates, data introspection/initialization,
validation, asynchronous workflows, collections, geospatial data, hashing, HTTP
operations, and browser file downloads, with explicit function-control primitives.

Version 2 is an ES module package for Node.js 22.17+ and modern browsers. Functions
are side-effect free unless their names explicitly describe an effect.

## Install

```sh
npm install akashatools
```

## Import only what you use

For a discoverable dot-completion experience, use the frozen default namespace:

```js
import akasha from "akashatools";

akasha.array.chunk([1, 2, 3, 4, 5], 2);
akasha.validation.isEmail("person@example.com");

// Collision-free utilities are also available flat.
akasha.chunk([1, 2, 3, 4, 5], 2);
```

The namespace prioritizes convenience. Named and category imports remain the
focused option for explicit dependencies and minimal bundling.

Every universal function is a named root export, allowing modern bundlers to
tree-shake unused code:

```js
import { chunk, getAtPath, safeFilename } from "akashatools";

chunk([1, 2, 3, 4, 5], 2);
getAtPath({ user: { name: "Akasha" } }, "user.name");
safeFilename("My Report / July");
```

Category subpaths provide the smallest and clearest import boundary:

```js
import { chunk, removeFromArray } from "akashatools/array";
import { analyzeArrayTypes, initializeLike } from "akashatools/data";
import { deepClone, setAtPath } from "akashatools/object";
import { fieldsFromData, inputTypeForValue } from "akashatools/input";
import { haversineDistance, normalizeGeoPosition } from "akashatools/geo";
import { crc32, sha256Hex, sha256Json } from "akashatools/hash";
import { debounce, memoize, once, throttle } from "akashatools/function";
import { jaccardSimilarity } from "akashatools/collection";
import { toDate, toEpochMilliseconds } from "akashatools/date";
```

Date helpers accept ordinary Date-compatible values, Firestore-style
`{ seconds, nanoseconds }` records, and Protobuf-message-style
`{ seconds, nanos }` records without invoking object coercion methods or
accessors:

```js
import { toDate, toEpochMilliseconds } from "akashatools/date";

toEpochMilliseconds({ seconds: 1, nanoseconds: 500_000_000 }); // 1500
toEpochMilliseconds({ seconds: 1, nanos: 250_000_000 }); // 1250
toDate({ seconds: 1 }).toISOString(); // "1970-01-01T00:00:01.000Z"
toEpochMilliseconds("1700000000", { numericStringUnit: "seconds" });
```

`toDate` preserves Date-string parsing for integer-only strings by default;
`toEpochMilliseconds` treats them as milliseconds. Use `numericStringUnit` to
select `"date"`, `"milliseconds"`, `"seconds"`, or `"reject"` explicitly.

Geospatial helpers use GeoJSON `[longitude, latitude]` order by default and
make legacy array order explicit:

```js
import { createGeoJsonFeature, haversineDistance, normalizeGeoPosition } from "akashatools/geo";

normalizeGeoPosition({ lat: 40.7, lng: -74 }); // [-74, 40.7]
haversineDistance([-74, 40.7], [-73.99, 40.75], { unit: "kilometers" });
createGeoJsonFeature("Point", { lat: 40.7, lng: -74 }, { properties: { name: "New York" } });
```

Generated method subpaths make a dependency maximally explicit while exporting
the same canonical function as both default and named:

```js
import chunk, { chunk as namedChunk } from "akashatools/array/chunk";
import hasDeep from "akashatools/object/hasDeep";

chunk === namedChunk; // true
```

The `data` category keeps related operations distinct and composable:

```js
import { analyzeArrayTypes, defaultValueForType, initializeLike, normalizeDataType } from "akashatools/data";

normalizeDataType("DateTimeLocal"); // "date"
analyzeArrayTypes([1, "2", 3]).types; // ["number", "string"]
defaultValueForType(Boolean); // false
initializeLike({ name: "Ada", rows: [{ id: 1 }] });
// { name: "", rows: [] }
```

Input inference is a separate, framework-neutral layer:

```js
import { controlTypeForValue, fieldsFromData, inputTypeForValue } from "akashatools/input";

inputTypeForValue(new Date()); // "datetime-local"
controlTypeForValue([{ id: 1 }]); // "object-array"
fieldsFromData({ name: "Ada", active: false });
// Frozen descriptors with text/checkbox input types and literal defaults.
```

Use the frozen canonical vocabularies when datatype or control identifiers cross
function boundaries. Existing literal strings remain accepted:

```js
import { DATA_TYPES, normalizeDataType } from "akashatools/data";
import { CONTROL_TYPES, INPUT_TYPES, inputTypeForType } from "akashatools/input";

normalizeDataType(DATA_TYPES.INTEGER); // DATA_TYPES.NUMBER
inputTypeForType(DATA_TYPES.BOOLEAN); // INPUT_TYPES.CHECKBOX
CONTROL_TYPES.OBJECT_ARRAY; // "object-array"
```

TypeScript consumers can also import the `DataType`, `InputType`, and
`ControlType` string-union types. The three vocabularies remain separate because
runtime datatypes, native HTML input types, and composite form-control types are
different domains even when some values happen to match.

Serialized input conversion is strict and can be precompiled for repeated
handlers:

```js
import { createInputValueParser, parseInputValue } from "akashatools/input";

const parseAmount = createInputValueParser(Number);
parseAmount("12.50"); // 12.5
parseInputValue("false", Boolean); // false
parseInputValue("2026-07-18T12:30", Date, {
  dateAssumption: "utc",
  dateOutput: "timestamp",
});
```

Text bounds and empty-value policy apply consistently across parser families.
Host-local clock gaps are rejected, and repeated clocks default to rejection
unless `dateDisambiguation: "earlier"` or `"later"` is selected explicitly.

Browser control extraction remains a separate adapter, so repeated handlers can
reuse the compiled parser:

```js
import { inputValueFromControl, prefersColorScheme, readJsonStorage } from "akashatools/browser";
import { createInputValueParser } from "akashatools/input";

const parseAmount = createInputValueParser(Number);
const amount = inputValueFromControl(event.currentTarget, parseAmount);
const dark = prefersColorScheme("dark");
const settings = readJsonStorage(localStorage, "settings", { fallback: {} });
```

Set-style similarity remains generic and bounded:

```js
import { jaccardSimilarity } from "akashatools/collection";

jaccardSimilarity(new Set(["search", "index"]), new Set(["index", "cache"]));
// 1 / 3
```

Duplicates do not add weight, object values retain identity, and a combined
iteration limit protects generator and other iterable inputs.

Category namespaces are also available when that style is more readable:

```js
import { array, object } from "akashatools";

array.unique([1, 1, 2]);
object.hasAtPath({ user: { id: 1 } }, "user.id");
```

For bounded deep searches with dot-style discovery, wrap the data explicitly:

```js
import { deepQuery, findAllDeepValues, hasDeep } from "akashatools/object";

hasDeep({ user: { id: 1 } }, "id", { by: "key" }); // true
findAllDeepValues({ one: { id: 1 }, two: { id: 2 } }, "id", { by: "key" });
// [1, 2]

deepQuery({ user: { id: 1 } }).has("id", { by: "key" }); // true
deepQuery([{ id: 1 }]).has("id", { by: "key" }); // true
```

The wrapper is syntactic sugar over the same functions. No normal or opt-in
package entry patches built-in constructors or prototypes.

Function control keeps identity and failure policy explicit:

```js
import { debounce, memoize, once, throttle } from "akashatools/function";

const initialize = once(createApplicationState);
const loadById = memoize(loadRecord, (id) => id, { maximumSize: 500 });
const saveDraft = debounce(writeDraft, 250);
const updatePointer = throttle(renderPointer, 16);
```

`once` preserves the first exact outcome, including throws and native Promises,
unless retry behavior is selected. `memoize` requires an explicit key selector,
uses a bounded identity-safe LRU cache, and exposes local cache controls.
`debounce` and `throttle` return Promises for every call and expose `cancel`,
`flush`, and `pending` controls without orphaning superseded callers.

Node-only functions use a separate entry point so browser/shared imports never
load Node filesystem modules:

```js
import { resolveContainedPath, resolveExistingContainedPath } from "akashatools/node";

resolveContainedPath("/srv/media", "2026/report.pdf");
```

The first function performs lexical containment without I/O. The second
requires both paths to exist, resolves symlinks, and rejects a real target
outside the real root. A resolved string is still a point-in-time check, not
permanent authorization for a later destructive filesystem operation.

Portable archive/manifest names have a separate universal lexical contract:

```js
import { normalizePortableRelativePaths } from "akashatools/validation";

normalizePortableRelativePaths(["assets/", "assets/logo.svg"], { kind: "either" });
```

This rejects traversal, reserved names, normalized/case collisions, and file
prefix conflicts. It validates names only and does not authorize extraction or
a filesystem write.

## Unified array removal

`removeFromArray` handles indices, values, and predicates without mutating the
input. In automatic mode, an integer means an index and a function means a
predicate. Select `mode: "value"` when removing a numeric value.

```js
import { removeFromArray } from "akashatools/array";

removeFromArray(["a", "b", "c"], 1);
// ["a", "c"]

removeFromArray([1, 2, 1], 1, { mode: "value", all: true });
// [2]

removeFromArray([1, 2, 3, 4], (value) => value % 2 === 0, { all: true });
// [1, 3]
```

Invalid API arguments throw `TypeError` or `RangeError`. A valid operation that
finds no match returns a fresh unchanged array. Predicate errors are not hidden.

## Compatibility with 1.x

The original namespace entry points remain available during the 2.x migration:

```js
import { ao, math, str, val } from "akashatools/lib";
import * as time from "akashatools/lib/Time.js";
```

These paths are compatibility code. New development should use the named root
exports or category subpaths.

## Development

```sh
npm run lint
npm run format:check
npm test
npm run test:browser:install
npm run test:browser
npm run test:coverage
npm run benchmark
npm run bundle:check
npm run check
npm run pack:check
npm run audit:release
```

The package has no runtime dependencies. Runtime tests use Node's built-in test
runner, while TypeScript is a development dependency used to check JSDoc,
generate declarations, compile consumer fixtures, and verify editor completions.

See [docs/LIVING_CHECKLIST.md](docs/LIVING_CHECKLIST.md) for the authoritative
work plan and [docs/MIGRATION.md](docs/MIGRATION.md) for the first-alpha source
audit and migration decisions. Public naming and behavioral rules live in
[docs/API_CONVENTIONS.md](docs/API_CONVENTIONS.md), the generated function
reference is [docs/API_REFERENCE.md](docs/API_REFERENCE.md), and per-function
migration lookup is available in
[docs/FUNCTION_INDEX.md](docs/FUNCTION_INDEX.md). The complete source disposition
ledger remains [docs/UTILITY_INVENTORY.md](docs/UTILITY_INVENTORY.md).
Practical compositions live in [docs/RECIPES.md](docs/RECIPES.md), with import
and bundle tradeoffs in
[docs/IMPORTS_AND_BUNDLING.md](docs/IMPORTS_AND_BUNDLING.md).
Declaration and editor guarantees are documented in
[docs/TYPES.md](docs/TYPES.md).
Performance methodology and measured decisions are recorded in
[docs/BENCHMARKS.md](docs/BENCHMARKS.md).
Portable source-defect protections and app-owned exclusions are mapped in
[docs/SOURCE_REGRESSIONS.md](docs/SOURCE_REGRESSIONS.md).
Current Mindspace and portfolio 1.0.2 call sites are measured in the
[active consumer usage audit](docs/inventory/CONSUMER_USAGE_AUDIT_2026-07-16.md)
and its
[behavior-risk refresh](docs/inventory/CONSUMER_BEHAVIOR_AUDIT_2026-07-18.md).
Security boundaries and threat models are collected in
[docs/SECURITY.md](docs/SECURITY.md).
Test organization, invariant seeds, and coverage policy are documented in
[docs/TESTING.md](docs/TESTING.md), and the real-source representative fixture
scope is recorded in
[docs/CONSUMER_COMPATIBILITY.md](docs/CONSUMER_COMPATIBILITY.md).
The current internal evidence and remaining external release gates are summarized
in [docs/RELEASE_READINESS.md](docs/RELEASE_READINESS.md). The staged,
approval-gated publication and recovery procedure is documented in
[docs/RELEASE_RUNBOOK.md](docs/RELEASE_RUNBOOK.md).
