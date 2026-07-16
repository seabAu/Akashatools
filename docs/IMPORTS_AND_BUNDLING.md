# Imports, discovery, and bundling

Akashatools supports three intentional ergonomics levels.

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

## Category subpath: narrowest stable boundary

```js
import { chunk } from "akashatools/array";
import { resolveContainedPath } from "akashatools/node";
```

Subpaths make runtime/category intent explicit and avoid loading namespace
construction. A wildcard category import such as
`import * as array from "akashatools/array"` preserves dot completion but may
retain the whole category depending on use and bundler analysis.

Akashatools does not publish one npm package per function and does not currently
promise per-method subpaths. Named exports already provide the primary fine-
grained optimization. Node-only code stays outside the universal root entirely.

## Reproducible measurements and budgets

Run:

```sh
npm run bundle:check
```

The harness uses exactly pinned esbuild 0.28.1, minified ESM, an ES2022 target,
and both raw and gzip byte counts. The 2026-07-16 measurements are:

| Fixture | Raw bytes | Gzip bytes | Raw/gzip budget |
| --- | ---: | ---: | ---: |
| Named root `chunk` | 321 | 252 | 400 / 300 |
| Category `chunk` | 321 | 252 | 400 / 300 |
| Category namespace `array.chunk` | 321 | 252 | 400 / 300 |
| Default flat `akasha.chunk` | 53,877 | 16,977 | 55,000 / 18,000 |
| Default category `akasha.array.chunk` | 53,883 | 16,979 | 55,000 / 18,000 |
| Simulated `akashatools/chunk` | 321 | 252 | 400 / 300 |
| Side-effect-only root import | 0 | 20 | 0 / 20 |

The per-method simulation points directly at the same array source module a
future `akashatools/chunk` export would target. It is byte-identical to both
supported focused styles, so 2.0 will not add per-method subpaths. This avoids a
larger export/type/documentation surface without sacrificing bundle efficiency.

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
| Mindspace universal | 10 | 7,388 / 2,666 | 53,993 / 17,033 | 46,605 / 14,367 |
| Portfolio rebuild | 4 | 5,802 / 2,324 | 53,962 / 16,996 | 48,160 / 14,672 |
| COMPOSR | 7 | 5,390 / 2,019 | 53,981 / 17,028 | 48,591 / 15,009 |
| SPLICR | 3 | 3,806 / 1,681 | 53,917 / 16,998 | 50,111 / 15,317 |

These 2026-07-16 esbuild 0.28.1 measurements use minified ES2022 ESM. They
isolate Akashatools dependency cost rather than claiming a whole-application
bundle result. Mindspace's Node-only containment helper has no universal-default
equivalent and correctly remains a direct `akashatools/node` import.
