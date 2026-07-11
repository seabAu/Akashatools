# COMPOSR cross-package primitive inventory

Source reviewed read-only: `_composrApp/app/packages` as of 2026-07-11.

The dedicated `@composr/utilities` package is inventoried in
`UTILITY_INVENTORY.md`. This pass searched the public `src/index.ts` surfaces of
the other 33 packages. Twenty packages expose 79 named function declarations;
`http-client` adds a utility-like error class, transport constant, and client
class. Package-level domain APIs are classified before extracting candidates.

## Public function surface classification

| Package | Functions | Classification |
| --- | ---: | --- |
| `api-workbench` | 5 | Five utility-like request/retry/redaction candidates; detailed below. |
| `browser-contracts` | 2 | COMPOSR journey/configuration validation and normalization. |
| `code-health` | 3 | COMPOSR source-analysis/report pipeline. |
| `control-plane` | 1 | Run-record summary tied to COMPOSR contracts. |
| `data-explorer` | 1 | CSV serializer candidate; class remains contract-owned. |
| `feed-ingestion` | 12 | Feed source/entry/query/health/XML domain semantics. |
| `http-client` | 0 | Three non-declaration runtime candidates detailed below. |
| `json-tools` | 3 | JSON diagnostic/formatting candidates; detailed below. |
| `lighthouse-contracts` | 4 | Lighthouse configuration, selection, aggregation, environment comparison. |
| `mention-monitor` | 6 | Mention/feed conversion, matching, retention, and digest policy. |
| `observability` | 4 | COMPOSR telemetry singleton/export/audit behavior. |
| `pipeline` | 1 | COMPOSR pipeline-definition validation. |
| `profile-store` | 1 | COMPOSR profile-envelope validation. |
| `resource-governor` | 1 | COMPOSR environment-to-quota policy. |
| `result-portability` | 2 | COMPOSR profiler-result envelope validation/building. |
| `security` | 7 | Security candidates detailed below; package also exports a DNS resolver constant. |
| `site-graph` | 8 | Site-map target/scope/canonical-ID graph semantics. |
| `site-mapper-worker` | 1 | Site-authentication header adapter. |
| `tool-registry` | 4 | AJV/filesystem tool discovery/install/read operations. |
| `transition-contracts` | 7 | Six profiler-domain functions plus one numeric summary candidate. |
| `workspace-state` | 6 | COMPOSR workspace validation/tab/migration/IndexedDB behavior. |
| **Function declaration total** | **79** | **All classified; 21 candidate runtime exports reviewed below.** |

Functions excluded at package level remain useful in COMPOSR. Their vocabulary,
types, defaults, storage, or algorithms are defined by the owning product
contract, so moving them would make Akashatools depend on COMPOSR rather than
generalize a primitive.

## `@composr/json-tools` (3 candidates)

| COMPOSR export | Finding | Akashatools disposition |
| --- | --- | --- |
| `parseJson` | Wraps `JSON.parse` with syntax locations and a custom duplicate-key tokenizer. Targeted probing proved that punctuation-like string values such as `"{"`/`"["` can make the tokenizer miss later duplicate keys. | Do not copy tokenizer; defer a JSON diagnostics/format category and evaluate a maintained parser. |
| `formatJson` | Parses then custom-serializes valid JSON with indentation, line-ending, key-order, escaping, compact-empty, and inline-array options. | Keep in COMPOSR tool package until formatting demand/category and option validation are established. |
| `minifyJson` | Returns diagnostics plus `JSON.stringify` output for valid input. | Native parse/stringify covers basic minification; diagnostics remain with future parser decision. |

The existing COMPOSR tests cover ordinary duplicate keys, syntax locations,
round trips, CRLF, Unicode escaping, and inline primitives, but not the confirmed
punctuation-token collision.

## `@composr/data-explorer` (1 candidate)

| COMPOSR export | Finding | Akashatools disposition |
| --- | --- | --- |
| `serializeCsv` | Filters COMPOSR sensitive/non-exportable columns, reads dot paths, JSON-stringifies objects, quotes CSV metacharacters, neutralizes spreadsheet formula prefixes, and emits CRLF/final newline. Path reads allow inherited properties and its columns use COMPOSR types. | Strong candidate for a future CSV/data surface after selector, delimiter, newline, formula, object, and dangerous-path contracts are set. |

This is substantially safer than the Mindspace CSV variants and supplies a
useful compatibility test, but one product column model should not become the
generic signature.

## `@composr/api-workbench` (5 candidates)

| COMPOSR export | Finding | Akashatools disposition |
| --- | --- | --- |
| `validateApiRequest` | Validates COMPOSR request definitions, variable interpolation, sensitive-header bindings, JSON bodies, and unsafe retry acknowledgement. | Keep with API-workbench contract; requirements inform future HTTP API. |
| `resolveApiRequest` | Interpolates variables/secrets, auth, params, headers, bodies, and a parallel redacted request. | COMPOSR request builder; not a generic fetch primitive. |
| `redactHeaders` | Replaces five exact case-insensitive sensitive header values. | Merge concept with security redaction only after configurable names and threat limits are designed. |
| `retryDelay` | Computes fixed/exponential delay, symmetric jitter, Retry-After floor, and zero bound with injected randomness. It does not validate policy numbers/source or cap overflow/elapsed time itself. | Defer to HTTP retry design with validated `[0,1)` source, maximum delay, and elapsed budget. |
| `shouldRetry` | Applies retry count, idempotent-method/idempotency-key acknowledgement, network-error, and status policy. | Defer with HTTP retry contract; semantics depend on attempt numbering and request definition. |

## `@composr/http-client` (3 candidates)

| COMPOSR export | Finding | Akashatools disposition |
| --- | --- | --- |
| `HttpRequestError` | Error class carries a string code and retryable flag for bounded/pinned HTTP failures. | Strong evidence for future typed `HttpError`; Akashatools also needs status, method, URL, headers, parsed body, and cause contracts. |
| `nodePinnedTransport` | Connects directly to the validated IP while preserving Host/TLS SNI, requests identity encoding, enforces declared/streamed byte limits and a timeout, and normalizes response headers. | Defer to Node HTTP surface; add `AbortSignal`, cleanup tests, and stable error metadata before adoption. |
| `SafeHttpClient` | Validates/pins every target and redirect, strips credentials/conditional headers across origins, handles redirect method rewriting/loops/limits, bounds body/response/time, and injects resolver/transport for tests. | Leading HTTP implementation evidence; adapt only after universal/Node entry boundaries, parsing, signals, and redirect policy are finalized. |

COMPOSR tests prove redirect revalidation, private-address blocking, cross-origin
credential stripping, redirect loops/limits, and transport address pinning. This
package demonstrates that target validation is meaningful only when the
transport actually connects to the validated address.

## `@composr/security` (8 candidates)

Seven are function declarations; `defaultAddressResolver` is an exported async
constant and is counted here because it participates directly in target
validation.

| COMPOSR export | Finding | Akashatools disposition |
| --- | --- | --- |
| `parseSecretEncryptionKey` | Parses exactly 32 bytes from hex/base64url using Node Buffer and names a COMPOSR environment variable in errors. | App-owned secret-vault configuration or future explicitly encoded byte parser. |
| `redactSensitiveText` | Redacts selected auth schemes/header lines/query keys and explicit secrets of at least three characters. Regexes cannot guarantee removal of every representation/encoding. | Defer security/redaction surface; document best-effort limits and test adversarial encodings first. |
| `redactSensitiveData` | Cycle-aware recursive redaction of strings/selected keys/Errors, but returns type `T` while converting Errors/classes to plain objects and omitting symbols/non-enumerables. | Defer; correct output type and supported built-ins must be explicit. |
| `materializeAuthenticationHeaders` | Builds bearer/basic/cookie/custom headers from COMPOSR binding configuration and blocks CRLF/forbidden names. | Keep with secret-binding/request contract. |
| `buildOriginEgressPolicy` | Converts COMPOSR approved-origin/subresource policy into target allowlists/ports. | App-owned egress policy. |
| `classifyAddress` | Classifies IPv4/IPv6 literals as public, loopback, private, link-local, multicast, unspecified, or reserved using Node networking. | Candidate Node security primitive only after range completeness/platform review and stable error/type contract. |
| `defaultAddressResolver` | Resolves all DNS records verbatim or returns an IP literal. | Internal default for target validation; DNS resolution alone is not a safe fetch. |
| `validateNetworkTarget` | Restricts protocol/credentials/host/port, resolves/classifies every address, and returns a selected address. | Keep in security package until redirect validation and transport-level address pinning prevent DNS rebinding/time-of-check gaps. |

Security tests cover common private/public addresses, mixed DNS results,
protocol/credential/host/port rejection, secret redaction, and vault behavior.
Akashatools will not expose an SSRF-safety claim unless the eventual HTTP
transport actually connects to the validated address and revalidates redirects.

## `@composr/transition-contracts` (1 candidate)

| COMPOSR export | Finding | Akashatools disposition |
| --- | --- | --- |
| `summarizeDistribution` | Returns count, min, max, linearly interpolated median/p75/p95, mean, and population standard deviation from a sorted copy; empty input becomes all zeros and non-finite inputs are not rejected. | Adopted as strict `number.summarizeNumbers` with finite inputs, scaled calculations, immutability, and null empty statistics. |

The remaining six functions in this package select/aggregate/project COMPOSR
transition profiler records or compare its environment fingerprint and remain
contract-owned.

## Result

- All public function declarations outside `@composr/utilities` are classified,
  along with the utility-like HTTP class/transport surface.
- Twenty-one utility-like exports receive individual dispositions; numeric
  distribution summarization is independently adopted and verified.
- CSV serialization, JSON tooling, security redaction/address checks, and the
  pinned HTTP client/retry rules remain strong evidence for future category
  designs rather than copied APIs.
- Domain packages keep their own validation, normalization, aggregation,
  storage, graph, feed, workspace, registry, and profiler behavior.
