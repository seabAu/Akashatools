# Testing policy

Akashatools tests public behavior, not implementation shape. Category test files
own contracts for their public subpaths; dedicated integration files cover the
root namespace, export map, installed package, declarations, editor completion,
and retained 1.x compatibility paths.

## Commands

```sh
npm test
npm run test:coverage
npm run check
npm run audit:release
```

`npm test` runs the dependency-free Node test suite. `npm run check` also checks
syntax, generated artifacts, JSDoc/TypeScript declarations, JavaScript and
TypeScript consumers, editor completions, and a clean installation of the exact
packed artifact.

`npm run test:coverage` uses Node's built-in coverage support and includes only
shipped `src/**/*.js` code. Tests, scripts, benchmarks, fixtures, generated
declarations, and archival `lib` compatibility modules do not dilute or inflate
the source measurement. The enforced aggregate minimums are:

- 95% line coverage;
- 80% branch coverage;
- 90% function coverage.

The thresholds are regression floors, not targets. A line is worth testing when
it represents a supported contract, an error boundary, or a previously observed
bug. Tests should not encode private implementation details merely to increase a
percentage. The release audit runs coverage after the unified check.

## Deterministic invariants

`test/invariants.test.js` uses a fixed seed and reusable helpers from
`fixtures/test-support/contracts.js`. It exercises nested-path round trips,
integer range construction, stable sorting, deduplication, and Unix date
round-trips over 1,750 generated cases. Keep failures reproducible: record a new
seed explicitly instead of depending on ambient randomness.

## Runtime boundaries

The current package contract is ESM on Node.js 22 or newer. Browser-dependent
functions use injected DOM and URL capabilities in unit tests. Real supported
browser and Node-version matrices remain release work and are tracked in the
living checklist.
