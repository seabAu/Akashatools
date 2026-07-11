# Changelog

## 2.0.0-alpha.1

- Added a frozen default `akasha` namespace with both flat utility access and
  frozen categorized namespaces.
- Added build-time collision detection, namespace completeness tests, and a
  strict editor-completion fixture.
- Documented canonical API naming, arguments, errors, mutation, and compatibility
  conventions.
- Added a disposition ledger covering all 119 named Akashatools 1.0.2 exports,
  including defects, native replacements, adopted APIs, and deferred redesigns.
- Recorded all 9 runtime and 2 type exports from COMPOSR's utility package,
  separating adopted primitives from profiler-contract behavior.
- Classified all 136 active Mindspace client/server utility modules by generic,
  environment/framework, or application-owned scope.
- Added export-level dispositions for 66 Mindspace core array, object, string,
  math, sort, and client/server validation exports.
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
