# Testing policy

Akashatools tests public behavior, not implementation shape. Every implemented
public category has a focused test file that imports its canonical subpath;
dedicated integration files cover cross-category invariants, the root namespace,
export map, installed package, declarations, editor completion, and retained 1.x
compatibility paths. `test/consumer-compatibility.test.js` executes focused-import
adapters based on the current Mindspace, portfolio, COMPOSR, and SPLICR utility
contracts; see `docs/CONSUMER_COMPATIBILITY.md` for its scope and limits.
`test/legacy-consumer-audit.test.js` separately verifies the read-only source
scanner's static/dynamic access distinction, call result and `try` contexts,
direct and unused legacy subpath bindings, manifest correlation, and conservative
fallback for malformed source.

## Commands

```sh
npm run lint
npm run format:check
npm run check:hygiene
npm run check:markdown
npm run check:readme
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

`npm run test:package` first validates npm's exact 536-file pack manifest:
selected portable roots only, no hidden, development-only, credential-like, or
executable paths, no bundled dependencies, consistent file-count and unpacked
size totals, and 400,000-byte packed/1,500,000-byte unpacked ceilings. It then
installs that same tarball into fresh JavaScript and TypeScript consumers and
exercises modern, granular, Node-only, and retained compatibility imports.

`npm run check:hygiene` rejects unfinished markers in maintained source/tests,
focused or disabled tests, production console/debugger calls, runtime dependency
fields, npm package lifecycle scripts, unexpected packaged roots, incomplete
publish metadata, and package-lock root drift. The unified check runs it before
the more expensive generated, bundle, package, and test gates.

`npm run check:markdown` decodes every packaged Markdown document as strict
UTF-8, requires a final newline, rejects forbidden control text, and verifies
that local links stay inside the package, select shipped files, resolve to real
files, and name existing GitHub-style heading fragments. Links displayed inside
inline or fenced code examples are intentionally ignored.

`npm run check:readme` parses all JavaScript-fenced README examples, resolves
every documented `akashatools` specifier through the actual package export map,
and verifies every default and named binding. It currently covers 19 examples,
31 package imports, and 69 bindings; a focused missing-binding fixture verifies
the failure path. Registry-installed example execution remains a distinct
post-publication gate.

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

`test/invariants.test.js` uses fixed seeds and reusable helpers from
`fixtures/test-support/contracts.js`. It exercises nested-path round trips,
integer range construction, stable sorting, deduplication, Unix date round-trips,
strict ISO calendar boundaries, and world-spanning geospatial symmetry over more
than 13,600 generated or enumerated cases. The current set includes 1,000
floating-range probes and all 9,261 triples from a 21-value mixed-type comparator
matrix. Keep failures reproducible: record a new seed explicitly instead of
depending on ambient randomness.

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
elimination. A separate Node 24 job installs all three browser engines and runs
the browser suite. Contract tests require the exact reviewed
`actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10` and
`actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38` identities, not
merely an arbitrary 40-character reference. The matrix follows the
[official Node release status](https://nodejs.org/en/about/previous-releases)
and [Playwright browser support](https://playwright.dev/docs/browsers); update it
when those support windows change.

The local 2026-07-19 expanded release matrix completed the full check and
coverage gates on Node 22.18.0 and an isolated Node 24.18.0 runtime. Both passed
all 221 tests, exact artifact safety plus fresh JavaScript/TypeScript tarball
installation, 195-API and 237-declaration generation checks, bundle budgets,
dependency audit, and package inspection. The latest exact runs measured 98.25%
lines, 89.82% branches, and 97.26% functions on Node 22, and 98.25% / 89.77% /
97.26% on Node 24. Node's experimental branch counter can vary slightly between
executions and runtimes while exercising asynchronous host paths. Playwright
separately passed all 18 tests across Chromium, Firefox, and WebKit. The first
hosted workflow result remains a distinct release gate.
