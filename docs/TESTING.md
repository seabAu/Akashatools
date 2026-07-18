# Testing policy

Akashatools tests public behavior, not implementation shape. Every implemented
public category has a focused test file that imports its canonical subpath;
dedicated integration files cover cross-category invariants, the root namespace,
export map, installed package, declarations, editor completion, and retained 1.x
compatibility paths. `test/consumer-compatibility.test.js` executes focused-import
adapters based on the current Mindspace, portfolio, COMPOSR, and SPLICR utility
contracts; see `docs/CONSUMER_COMPATIBILITY.md` for its scope and limits.

## Commands

```sh
npm run lint
npm run format:check
npm test
npm run test:browser:install
npm run test:browser
npm run test:coverage
npm run bundle:check
npm run check
npm run audit:release
```

`npm run lint` applies the pinned ESLint rules to maintained JavaScript, and
`npm run format:check` verifies the pinned Prettier style without changing
files. `npm test` runs the dependency-free Node test suite. `npm run check`
also checks syntax, lint and formatting, generated artifacts, JSDoc/TypeScript
declarations, JavaScript and TypeScript consumers, editor completions, and a
clean installation of the exact packed artifact.

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

The current package contract is ESM on Node.js 22.17 or newer. Browser-dependent
functions use injected DOM and URL capabilities in unit tests. The retained
`fixtures/browser/download.html` fixture also verifies native Blob/File guards,
iframe-realm Map/Set/typed-array guards, download cleanup, and browser console
health. `npm run test:browser` automates six behavior contracts in each of
Playwright's Chromium, Firefox, and WebKit engines, for 18 passing tests; install
their matching binaries once with `npm run test:browser:install`.

The GitHub Actions workflow runs the unified check, source coverage gate, and
package-content check on the currently supported Node 22 and 24 LTS lines. The
unified check includes focused/default bundle budgets and side-effect
elimination. A
separate Node 24 job installs all three browser engines and runs the browser
suite. The matrix follows the [official Node release status](https://nodejs.org/en/about/previous-releases)
and [Playwright browser support](https://playwright.dev/docs/browsers); update it
when those support windows change.

The local 2026-07-18 expanded release matrix completed the full check and
coverage gates on Node 22.18.0 and an isolated Node 24.18.0 runtime. Both passed
all 199 tests, fresh JavaScript/TypeScript tarball installation, 191-API and
231-declaration generation checks, bundle budgets, dependency audit, and package
inspection. Node 22 measured 97.41% lines, 87.76% branches, and 95.90%
functions; Node 24 measured 97.41% / 87.67% / 95.90%. Playwright separately
passed all 18 tests across Chromium, Firefox, and WebKit. The first hosted
workflow result remains a distinct release gate.
