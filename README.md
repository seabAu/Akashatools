# Akashatools

Akashatools is a dependency-free collection of focused JavaScript utilities for
arrays, objects, strings, numbers, dates, validation, asynchronous workflows,
collections, and browser file downloads.

Version 2 is an ES module package for Node.js 22+ and modern browsers. Functions
are side-effect free unless their names explicitly describe an effect.

## Install

```sh
npm install akashatools
```

## Import only what you use

Every function is a named root export, allowing modern bundlers to tree-shake
unused code:

```js
import { chunk, getAtPath, safeFilename } from "akashatools";

chunk([1, 2, 3, 4, 5], 2);
getAtPath({ user: { name: "Akasha" } }, "user.name");
safeFilename("My Report / July");
```

Category subpaths provide the smallest and clearest import boundary:

```js
import { chunk, removeFromArray } from "akashatools/array";
import { deepClone, setAtPath } from "akashatools/object";
```

Category namespaces are also available when that style is more readable:

```js
import { array, object } from "akashatools";

array.unique([1, 1, 2]);
object.hasAtPath({ user: { id: 1 } }, "user.id");
```

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
npm test
npm run check
npm run pack:check
```

The test suite uses Node's built-in test runner, so the package has no runtime or
development dependencies. `jsconfig.json` enables strict JavaScript checking in
VS Code. Public functions include JSDoc parameter, return, and generic annotations
for editor IntelliSense.

See [docs/MIGRATION.md](docs/MIGRATION.md) for the source audit, inclusion rules,
and remaining migration phases.
