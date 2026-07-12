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

Modern bundlers can remove unrelated exports. A verified esbuild 0.28.1 smoke
measurement produced the same 304-byte minified `chunk` fixture from the named
root and the array category path. That measurement is evidence for the fixture,
not a permanent size guarantee; bundle budgets will be set from reproducible
fixtures before release.

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
