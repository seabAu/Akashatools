# Active-source refresh — 2026-07-16

This delta ledger refreshes the read-only source review after the original
2026-07-11 inventories. It covers the current working copies of:

- Mindspace `app/client` and `app/server`;
- portfolio rebuild `client`, `server`, `shared`, and the newer `web` app;
- COMPOSR `app/packages`;
- SPLICR `app`, including its provider-neutral Python algorithms and browser UI.

Dirty and untracked source is intentionally included because the purpose is to
find current reusable behavior, not merely behavior present in the latest Git
commit. Histories, backups, generated output, dependency folders, caches, and
temporary document-import directories are excluded. The source projects remain
read-only and no compatibility claim follows from this inventory alone.

## High-confidence portable deltas

| Source behavior | Finding | Akashatools disposition |
| --- | --- | --- |
| Portfolio `createExpiringSingleFlight` | Coalesces concurrent loads, caches an accepted result for a TTL, and prevents an invalidated in-flight generation from repopulating the cache. It has focused concurrency/invalidation tests and several live consumers. | Adopt in `async` with final option objects, strict callback/time validation, synchronous-throw normalization, and explicit zero/infinite TTL behavior. |
| Portfolio `createKeyedExpiringSingleFlight` | Applies the same behavior per `Map` key and supports scoped/global invalidation. The app version retains every observed key and creates a missing entry during invalidation. | Adopt a bounded keyed variant that does not allocate during invalidation and documents eviction/pending-request behavior. |
| COMPOSR `canonicalJson` | Recursively orders object keys to compare checkpoint state independently of insertion order. The current one-line version accepts non-plain objects, invokes enumerable accessors, maps unsupported primitives to `null`, and has no cycle/work bounds. | Adopt a rewritten deterministic JSON serializer with strict plain-JSON semantics, accessor/cycle rejection, deterministic code-unit key order, and work limits. |
| Portfolio `formatFileSize` | Formats non-negative byte counts with decimal units. The current implementation silently turns negative/non-finite input into zero and hard-codes precision by magnitude. | Adopt `formatBytes` with strict finite/non-negative input and explicit decimal/binary and precision options. |
| Portfolio `responseDownloadFilename` | Reads encoded, quoted, or bare `Content-Disposition` filenames before a browser download. The current parser covers live cases but only partially handles quoting, charsets, path components, and invalid percent encoding. | Adopt only after defining a bounded HTTP-header parser and basename/fallback policy; compose it with the existing browser download primitive. |
| Mindspace `sanitizeBoundedJson` | Deep-clones plain JSON while enforcing byte, depth, key-count, array, key-length, and string limits. It also rejects Mongo operator/dotted keys and exposes Mindspace HTTP status/error codes. | Extract a generic bounded plain-JSON clone/validation contract; keep Mongo key policy and application error metadata in Mindspace. |
| SPLICR `utf8_size` | Measures encoded UTF-8 bytes to enforce provider transport limits. | Adopt a strict universal string byte-length helper. |
| SPLICR `SemanticChunker` and `plan_chunks` | Packs normalized text at paragraph, sentence, clause, word, then Unicode-code-point boundaries while enforcing byte/word/provider estimates; planning records normalized-source offsets. Tests cover multibyte text, blank input, custom estimators, and boundary fallback. | Strong candidate for a bounded text-chunk API. First separate transport whitespace normalization from lossless splitting and define whether offsets refer to original or normalized text. Provider controls and TTS markers stay in SPLICR. |
| Mindspace `formatDurationLabel` | Formats minutes as compact hour/minute text. The current version uses falsy input semantics and accepts negative/fractional values accidentally. | Candidate for a strict duration-format helper after rounding, sign, maximum size, and localization rules are explicit. |

## Behaviors already covered by the canonical API

| Refreshed source behavior | Existing Akashatools path |
| --- | --- |
| Mindspace `createSecureClientId` | `secureRandomUuid`; prefix normalization remains caller/application composition. |
| Mindspace local date key/start/day-difference helpers | `localDateKey`, `startOfLocalDay`, and `differenceInLocalDays`. |
| Mindspace 24-hour clock parsing and 12/24-hour presentation | `clockTimeToMinutes`, `minutesToClockTime`, `clock12To24`, and `clock24To12`. |
| Mindspace array move/insert/remove/chunk/unique/group/intersection/range helpers | Strict `array` category replacements. |
| COMPOSR settled concurrency, fulfilled projection, ID upsert/exclusion, and browser download helpers | Existing `async`, `collection`, `browser`, and `string` category implementations. |
| Portfolio stable ordering, own-property reads, field paths, slugs, network/path containment, and retry evidence | Already dispositioned in `PORTFOLIO.md`; adopted primitives remain covered by object/string/node/http contracts. |

## App-owned or deferred refreshed behavior

### Mindspace

The large new switchboard, quick-capture, update-queue, draft, workbench,
notification, navigation, input-form, freshness-manifest, and due-item modules
are valuable application infrastructure. Their record fields, routes, stores,
copy, persistence backends, recovery states, and product policy make them
Mindspace-owned rather than missing Akashatools primitives. The same applies to
feature-local habit, reflection, narrative, note, task, and dashboard adapters.

`normalizeBoundedString` deliberately coerces numbers, bigints, and
Mongoose-like identifiers, while Akashatools canonical string APIs reject
implicit coercion. `safeParseJson` collapses syntax errors into a fallback for an
authentication client. Both remain application adapters unless a result-bearing
parse API is independently designed.

### Portfolio rebuild

`runIdempotentRequest` retries every failed GET/HEAD exactly once. It does not
distinguish transport errors from HTTP/application failures or define abort,
backoff, elapsed-budget, `Retry-After`, or idempotency-key behavior. It remains
portfolio server-client policy; Akashatools' generic HTTP helper stays a single
bounded attempt.

The current `web` portfolio/search/session/snapshot/navigation/media adapters are
app-owned. `downloadResponse` is a thin composition of response parsing and DOM
download behavior; only its header-filename primitive is a general candidate.

### COMPOSR

The current `packages/utilities` exports were rechecked. The reusable async,
collection, and browser-file behaviors remain adopted; profiler bundle and
checkpoint comparison remain tied to COMPOSR records. `canonicalJson` is the new
portable primitive inside that comparison.

Later JSON-tools, bounded/pinned HTTP, source-analysis, and result-portability
work strengthens prior evidence. Full JSON formatting/duplicate-key diagnostics
remain an optional surface rather than silently expanding `prettyJson`; the
pinned Node transport and SSRF policy remain COMPOSR infrastructure rather than
a universal fetch replacement.

### SPLICR

Provider adapters, synthesis controls, nonverbal cue placement, WAV/PCM
normalization, job persistence, resumability, document import, and FastAPI/UI
behavior remain SPLICR-owned. Numeric-citation cleanup is a Markdown-aware TTS
preprocessor and should not enter a generic string category without independent
consumer demand. Document import also depends on archive/XML/office-format and
external-converter security contracts better owned by a dedicated package.

## Implementation queue from this refresh

- [x] Add and test bounded expiring single-flight helpers as
  `createSingleFlight` and `createKeyedSingleFlight`.
- [x] Add and test deterministic bounded plain-JSON serialization as
  `stableJson`.
- [x] Add and test strict byte-size formatting as `formatBytes` with decimal and
  IEC binary unit modes.
- [x] Add strict `utf8ByteLength` and `countWords` measurement primitives.
- [x] Port SPLICR's semantic chunking core as `splitTextByLimits`, with lossless
  source preservation as the generic default and no implicit normalization.
- [x] Add bounded `parseContentDispositionFilename` with deterministic extended
  parameter precedence and safe cross-platform filename normalization.
- [x] Add generic bounded `cloneJson` separately from Mongo/application key
  policy and HTTP error metadata.
- [ ] Finish the symbol-level delta audit of newly changed Mindspace
  feature-local files and COMPOSR packages; record only independently reusable
  primitives rather than domain adapters.
