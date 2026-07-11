# Changelog

## 2.0.0-alpha.1

- Added named, tree-shakeable root exports and explicit category subpaths.
- Added modern array, async, browser, collection, date, number, object, random,
  sort, string, and validation modules.
- Unified immutable array removal behind `removeFromArray`.
- Adopted native `structuredClone`, `Object.hasOwn`, `Intl.DateTimeFormat`,
  `Map`, `Set`, `String.prototype.replaceAll`, and `Math.hypot` where appropriate.
- Added prototype-pollution protection to nested paths and deep object merging.
- Added bounded concurrency mapping from COMPOSR's utility package.
- Added safe nested path and JSON contract helpers from the portfolio rebuild.
- Retained the 1.x `akashatools/lib` entry points as compatibility exports.
- Added a dependency-free Node test suite and JSDoc for public functions.
