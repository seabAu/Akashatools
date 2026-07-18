# Imports, discovery, and bundling

Akashatools supports four intentional ergonomics levels.

## Default namespace: maximum discovery

```js
import akasha from "akashatools";

akasha.validation.isEmail(value);
akasha.array.chunk(values, 20);
akasha.chunk(values, 20);
```

This is the closest replacement for dot-driven `utils.val.*`/`utils.ao.*`
exploration. The frozen object exposes every universal utility both flat and by
category. Because the namespace references all universal categories, consumers
should treat it as a convenience import rather than the smallest bundle choice.

## Named root import: concise and tree-shakeable

```js
import { chunk, isEmail } from "akashatools";
```

Modern bundlers can remove unrelated exports. The checked-in esbuild 0.28.1
harness produces the same 321-byte minified / 252-byte gzip `chunk` fixture from
the named root, category named import, and category namespace import. All three
are held to 400 raw / 300 gzip byte budgets.

## Category subpath: focused group boundary

```js
import { chunk } from "akashatools/array";
import { resolveContainedPath } from "akashatools/node";
```

Subpaths make runtime/category intent explicit and avoid loading namespace
construction. A wildcard category import such as
`import * as array from "akashatools/array"` preserves dot completion but may
retain the whole category depending on use and bundler analysis. Each category
subpath is backed by a generated `index.js` so its public names cannot drift from
the canonical category module.

## Granular method subpath: one explicit dependency

```js
import chunk, { chunk as namedChunk } from "akashatools/array/chunk";
import hasDeep from "akashatools/object/hasDeep";
```

Every public method has a generated category/method subpath with both a default
and same-named export. Both resolve to the same canonical function object as the
root and category exports; there is no copied implementation. Akashatools remains
one npm package rather than publishing a package per function. Node-only methods
remain under `akashatools/node/*` and outside the universal root.

## Reproducible measurements and budgets

Run:

```sh
npm run bundle:check
```

The harness uses exactly pinned esbuild 0.28.1, minified ESM, an ES2022 target,
and both raw and gzip byte counts. The 2026-07-18 measurements are:

| Fixture | Raw bytes | Gzip bytes | Raw/gzip budget |
| --- | ---: | ---: | ---: |
| Named root `chunk` | 321 | 252 | 400 / 300 |
| Category `chunk` | 321 | 252 | 400 / 300 |
| Category namespace `array.chunk` | 321 | 252 | 400 / 300 |
| Granular `akashatools/array/chunk` | 321 | 252 | 400 / 300 |
| Default flat `akasha.chunk` | 111,073 | 32,791 | 114,000 / 34,000 |
| Default category `akasha.array.chunk` | 111,079 | 32,793 | 114,000 / 34,000 |
| Side-effect-only root import | 0 | 20 | 0 / 20 |

The actual generated granular method import is byte-identical to the named-root
and category-focused styles. Export-resolution, identity, declaration, installed-
package, and generation-drift checks keep this larger ergonomic surface tied to
the canonical implementations.

The zero-byte side-effect-only output verifies that the package can be removed
when none of its values are used. Combined with the source review that public
modules only create internal functions/constants/frozen namespace objects at
import time, this keeps `sideEffects: false` truthful.

## Representative consumer import sets

Run `npm run bundle:consumers` to bundle the exact universal function sets used
by the current compatibility fixtures once as named imports and once through the
flat default namespace. The script asserts that every focused set remains
smaller in both raw and gzip output and is included in `npm run bundle:check`.

| Consumer surface | Functions | Focused raw/gzip | Default raw/gzip | Raw/gzip saved |
| --- | ---: | ---: | ---: | ---: |
| Mindspace universal | 10 | 7,388 / 2,666 | 111,192 / 32,842 | 103,804 / 30,176 |
| Portfolio rebuild | 4 | 5,806 / 2,325 | 111,161 / 32,824 | 105,355 / 30,499 |
| COMPOSR | 7 | 5,390 / 2,017 | 111,180 / 32,841 | 105,790 / 30,824 |
| SPLICR | 3 | 3,806 / 1,681 | 111,116 / 32,800 | 107,310 / 31,119 |

These 2026-07-18 esbuild 0.28.1 measurements use minified ES2022 ESM. They
isolate Akashatools dependency cost rather than claiming a whole-application
bundle result. Mindspace's Node-only containment helper has no universal-default
equivalent and correctly remains a direct `akashatools/node` import.
