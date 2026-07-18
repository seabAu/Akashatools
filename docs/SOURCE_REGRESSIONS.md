# Source regression ledger

Akashatools preserves source intent, not demonstrably broken source behavior.
The regression suite names portable defects that influenced canonical contracts
and proves their replacements do not reintroduce them.

## Executable portable regressions

| Source defect family | Canonical protection | Evidence |
| --- | --- | --- |
| Array cleanup dropped meaningful falsy values; move/remove helpers silently inserted or ignored invalid data; selectors logged and swallowed failures. | Nullish-only `compact`, strict indices/options, immutable results, and propagated callback errors. | `test/source-regressions.test.js` array cases plus `test/array.test.js`. |
| Object-backed grouping and registries coerced identity keys, collapsed numeric/string keys, and could collide with prototype names. | `groupBy` and `keyBy` return Maps, preserve key identity, and make one-to-many versus duplicate-selection behavior distinct. | Source-regression grouping case, array identity/duplicate-policy tests, and the 2026-07-18 source-refresh ledger. |
| COMPOSR's line-offset lookup embedded binary-search mechanics in application logic. | Shared `lowerBound`, `upperBound`, and first-match `binarySearch` preserve logarithmic comparator work and document the sorted-input precondition. | Array duplicate-range, custom-comparator, and comparison-count tests. |
| Mindspace nested getters/setters read inherited values, mutated callers, and accepted prototype-pollution paths. | Own-property reads, immutable structural sharing, blocked unsafe segments, and work bounds. | Source-regression nested-data case, object tests, and invariant tests. |
| Server merge helpers mutated defaults, discarded `false`/`0`/empty-string overrides, recursed unsafely, and could invoke accessors. | Plain-object-only immutable `deepMerge` with exact falsy values, active-property rejection, cycle/depth/node bounds, and unsafe-key protection. | Source-regression merge case and object security tests. |
| JSON clone/canonicalization silently converted unsupported values, invoked getters, lost data, or recursed without bounds. | Strict `cloneJson` and `stableJson` plain-JSON contracts with accessor/cycle/shape/work rejection. | Source-regression JSON case plus object/string category tests. |
| Legacy multi-replacement treated caller strings as regex/replacement syntax. | Literal `replaceMany` is separate from explicit `replaceRegex`. | Source-regression replacement case and string tests. |
| Mindspace helpers named for Unix seconds actually handled milliseconds. | `toUnixSeconds` and `fromUnixSeconds` enforce the stated unit. | Source-regression time-unit case, date tests, and deterministic invariants. |
| Portfolio response filenames and legacy filesystem helpers accepted path components/unchecked traversal; COMPOSR archive names needed normalized set-level collision safety. | Bounded filename parsing, portable relative-path/set normalization, Node-only lexical/realpath containment, and deterministic native `globPaths`, each with separate authorization scope. | Source-regression boundary case, portable-path tests/contracts, and HTTP/Node threat tests. |
| Portfolio single-flight invalidation allowed older in-flight work to race cache state. | Generation isolation prevents stale repopulation. | Source-regression generation case and async concurrency tests. |
| SPLICR-style normalization/chunk fallback could obscure which source offsets a generic helper referenced. | `splitTextByLimits` is lossless, Unicode-safe, bounded, and leaves normalization/provider policy to SPLICR. | Source-regression text case and SPLICR consumer fixture. |
| SPLICR response extraction used a loose provider-bound JSON Pointer reader with implicit array parsing and retry errors. | Strict RFC 6901 parsing, own plain-data traversal, canonical array indices, accessor rejection, and separate absent/fallback semantics. | Object JSON Pointer tests and the 2026-07-18 source-refresh ledger. |
| SPLICR providers duplicated permissive retry-delay parsing and mixed standard dates with non-standard fractional values. | `parseRetryAfter` defaults to RFC integer/date syntax, isolates fractional compatibility behind an option, validates dates, bounds work, and never triggers a retry. | HTTP parser tests and the 2026-07-18 source-refresh ledger. |
| COMPOSR duplicated handwritten/native SHA-256, unsafe canonicalizers, truncated stable IDs, and archive-local CRC-32 without shared boundaries. | The `hash` category delegates SHA-256 to native Web Crypto, composes the strict bounded `stableJson` core, labels CRC-32 as non-security, snapshots binary views, and makes ID truncation explicit. | Standard hash vectors, mutation/view-range tests, JSON identity tests, and `HASH_CONTRACTS.md`. |
| Browser globals leaked into universal validation and download cleanup could be skipped on errors. | Safe runtime-global detection, injected browser capabilities, and deterministic cleanup. | `test/validation.test.js`, `test/browser.test.js`, and the six Playwright contracts. |
| Excepted Geo helpers reversed GeoJSON order, randomized coordinates, ignored nearby thresholds, and bypassed property bounds for defaults; Schema input formatting lost decimals, ignored text bounds, accepted normalized invalid dates/Float32 overflow, and guessed event/local-time behavior; DOM/LocalDB modules touched ambient globals and product state. | Canonical coordinate normalization and Haversine units; exact GeoJSON property budgets; strict one-shot/compiled datatype parsing with complete empty/range/calendar and offset-overlap policy; late-bound media/control adapters; and explicit strict-JSON Storage calls. | Named excepted-module regression, complete datatype matrix, generated ISO/geo invariants, New York/Lord Howe transition cases, browser error boundaries, benchmarks, and Playwright contracts. |
| Natural sorting rebuilt locale machinery inside hot comparisons, reread mutable criteria, violated comparator laws for mixed nullish values, or collided missing values with legitimate numeric extremes. | Reusable collators, stable copied sorts, snapshotted criteria, a deterministic mixed-type total preorder, explicit null placement, and separate numeric validity. | Exhaustive comparator-law and snapshot cases in `test/sort.test.js`, plus `benchmark/collator.mjs`. |
| Extreme numeric wrapping overflowed its shifted dividend; rounding erased negative zero; random float ranges accepted emptiness or could round to the excluded maximum. | Overflow-safe finite wrapping, signed-zero-preserving rounding, strict nonempty ranges, and an IEEE-754 predecessor guard preserve the documented contracts. | Numeric boundary tests and 1,000 deterministic floating-range invariants. |
| HTTP automatic parsing used a `json` substring test, malformed exponential `Content-Length` values were numerically trusted, and invalid custom secret-header names could silently miss redaction. | Exact JSON/structured-suffix media recognition, canonical decimal length preflight plus unconditional stream bounds, and HTTP-token validation for sensitive names. | `test/http.test.js` media, length, option, and redaction boundary cases. |
| Datatype, native-input, and composite-control identifiers were repeated as loosely related string literals across source families. | Frozen, domain-specific `DATA_TYPES`, `INPUT_TYPES`, and `CONTROL_TYPES` vocabularies preserve compatible wire values while centralizing semantic comparisons, returns, documentation, and TypeScript unions. | Data, input, validation, namespace, declaration, editor-completion, granular-import, installed-package, and equal-output dispatch benchmark evidence. |

## Rejected and application-owned defects

Some discovered bugs do not belong in an Akashatools executable regression
because their surrounding behavior was intentionally not migrated. Their
dispositions remain in the source inventories, including:

- JWT millisecond/day confusion and Express cookie policy;
- Mongoose schema/ObjectId reflection and response envelopes;
- unrestricted or false-success file deletion and provider I/O wrappers;
- notification, SMS, email, retry, auth, session, route, and queue error policy;
- React hooks/components, browser storage globals, and import-time prototype
  extensions;
- portfolio search/navigation/media/session behavior, COMPOSR envelopes and
  checkpoint schemas, and SPLICR provider/document/audio/storage policy.

The source projects are read-only. Fixing an application-owned defect requires
separate authorization and that application's own regression suite; copying it
here merely to test it would incorrectly expand Akashatools' contract.
