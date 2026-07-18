# Consumer compatibility fixtures

The fixtures under `fixtures/consumers/` are executable migration evidence from
the current Mindspace, portfolio rebuild, COMPOSR, and SPLICR utility surfaces.
They import Akashatools through its public package name and export map, rather
than reaching into `src/`, so they exercise the same focused imports a consumer
would use.

The source projects remain read-only. These fixtures cover portable utility
contracts and their deliberately thin application adapters; they do not import
frameworks, databases, UI components, provider SDKs, or application state.

## Covered contracts

| Consumer | Current source evidence | Executable compatibility surface |
| --- | --- | --- |
| Mindspace client/shared | Array utilities, secure client IDs, time-grid duration labels, and relative-time presentation. | Immutable dedupe/reorder/group/page composition; compact durations; Intl relative time; app-owned ID prefixes composed with `secureRandomUuid`. |
| Mindspace server | `pick`, mutating deep merge, bounded JSON sanitation, and media-path helpers. | Bounded `cloneJson` followed by an app allowlist; immutable `deepMerge` that preserves falsy overrides; lexical Node path containment. |
| Portfolio rebuild | Expiring and keyed single-flight loaders, file-size formatting, and response-download filename tests. | Positional-to-options adapters around bounded single-flight controllers; exact current decimal size cases; encoded/quoted/path-bearing Content-Disposition cases. |
| COMPOSR | Bounded settled mapping, fulfilled projection, ID collections, canonical checkpoints, profiler summaries, and filename slugs. | Ordered settled work, immutable record updates, strict deterministic JSON, interpolated finite-number summaries, and lowercase filename slugs. |
| SPLICR | Provider-neutral Python UTF-8/word measurement, semantic chunking, and planning offsets. | Lossless JavaScript chunks with source offsets, UTF-8 and word limits, Unicode code-point fallback, provider-cost estimates, and app-owned blank-input rejection. |

## Intentional boundaries

- Mindspace Mongo/Express/Mongoose policy, key restrictions, storage-root
  selection, and prefix vocabulary remain application code.
- Portfolio retry, response streaming, session, media, and navigation behavior
  remains application code; only reusable loader/header/size primitives moved.
- COMPOSR profiler envelopes, checkpoint schemas, and transition aggregation
  records remain product contracts composed from generic primitives.
- SPLICR normalization, heading strategies, TTS markers, provider estimates,
  document import, audio, and storage remain SPLICR-owned. The generic splitter
  preserves the original text byte-for-byte when chunks are joined.
- Stricter argument failures are intentional. The fixtures do not preserve
  swallowed callback errors, silent coercion, mutation, prototype extension, or
  path traversal behavior from legacy helpers.

Run the focused evidence with:

```sh
node --test test/consumer-compatibility.test.js
```

The unified `npm test` and `npm run check` gates include the same suite. Passing
these representative fixtures does not establish whole-application drop-in
compatibility; that requires bounded migrations and application-owned tests in
each source project.

The read-only AST audits in
`docs/inventory/CONSUMER_USAGE_AUDIT_2026-07-16.md` and
`docs/inventory/CONSUMER_BEHAVIOR_AUDIT_2026-07-18.md` complement these small
fixtures with the current 1.0.2 import footprint and use shape. The refresh maps
1,981 parsed root-member reads, 1,980 calls, one proven non-call defect, eight
direct legacy-subpath calls, two unused legacy bindings, and zero dynamic root
accesses without implying that static mapping proves application behavior.

## Module-format evidence

Akashatools 2.0 remains ESM-only. Current Mindspace client/server, portfolio
server, and COMPOSR manifests declare `"type": "module"`; the portfolio web and
COMPOSR TypeScript configurations use ESNext with bundler resolution. SPLICR is
a Python application and supplies no CommonJS consumer requirement. A generated
dual build would therefore add identity, export, and release complexity without
a demonstrated active consumer.

The representative bundle comparison in `docs/IMPORTS_AND_BUNDLING.md` shows
108,945-112,442 raw bytes and 32,291-33,256 gzip bytes saved by the focused import
sets. Runtime behavior is exercised by the same compatibility tests, public
imports remain side-effect free, and no standalone import-time speed claim is
made; whole-app runtime profiling requires an authorized migration in each app.
