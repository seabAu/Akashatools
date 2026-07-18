# Akashatools

Akashatools is a dependency-free collection of focused JavaScript utilities for
arrays, objects, strings, numbers, dates, data introspection/initialization,
validation, asynchronous workflows, collections, and browser file downloads.

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
```

The `data` category keeps related operations distinct and composable:

```js
import {
  analyzeArrayTypes,
  defaultValueForType,
  initializeLike,
  normalizeDataType,
} from "akashatools/data";

normalizeDataType("DateTimeLocal"); // "date"
analyzeArrayTypes([1, "2", 3]).types; // ["number", "string"]
defaultValueForType(Boolean); // false
initializeLike({ name: "Ada", rows: [{ id: 1 }] });
// { name: "", rows: [] }
```

Category namespaces are also available when that style is more readable:

```js
import { array, object } from "akashatools";

array.unique([1, 1, 2]);
object.hasAtPath({ user: { id: 1 } }, "user.id");
```

Node-only functions use a separate entry point so browser/shared imports never
load Node filesystem modules:

```js
import {
  resolveContainedPath,
  resolveExistingContainedPath,
} from "akashatools/node";

resolveContainedPath("/srv/media", "2026/report.pdf");
```

The first function performs lexical containment without I/O. The second
requires both paths to exist, resolves symlinks, and rejects a real target
outside the real root. A resolved string is still a point-in-time check, not
permanent authorization for a later destructive filesystem operation.

## Unified array removal

`removeFromArray` handles indices, values, and predicates without mutating the
input. In automatic mode, an integer means an index and a function means a
predicate. Select `mode: "value"` when removing a numeric value.

```js
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
[active consumer usage audit](docs/inventory/CONSUMER_USAGE_AUDIT_2026-07-16.md).
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
