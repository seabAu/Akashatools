# Akashatools benchmarks

Benchmarks are decision evidence, not API performance guarantees. Results vary
by runtime, processor, data distribution, and surrounding workload. Re-run the
checked-in scripts when an implementation or supported Node version changes:

```sh
npm run benchmark
```

## Method and fixtures

`benchmark/fixtures.mjs` provides deterministic small, medium, and large inputs
derived from the active source shapes:

- stable string IDs for repeated COMPOSR/Mindspace record membership;
- natural-number task/project labels for Mindspace and portfolio sorting;
- multilingual paragraph text at SPLICR's provider-chunk, document, and generic
  one-million-code-unit work limits.

Every strategy receives the same retained input and its output is asserted equal
to the baseline before timing. The shared harness performs three warmups, uses
`process.hrtime.bigint()`, and reports sample count, median, range, population
standard deviation, runtime, operating system, architecture, and processor.
Construction work is included when it would occur in the compared operation.

The results below were measured 2026-07-16 on Node.js 22.18.0, Windows
10.0.19045 x64, Intel Core Ultra 9 285K.

## Repeated membership checks

This comparison filters one string-ID array against another with 50% overlap.
Set/Map construction is included.

| Strategy | Scale | Items | Samples | Median ms | Min-max ms | Std dev ms | Relative |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `Array.includes` | small | 1,000 | 15 | 0.557 | 0.450-1.085 | 0.155 | 1.0x |
| `Set.has` | small | 1,000 | 15 | 0.056 | 0.033-0.398 | 0.089 | 10.0x |
| `Map.has` | small | 1,000 | 15 | 0.050 | 0.040-0.168 | 0.040 | 11.2x |
| `Array.includes` | medium | 5,000 | 7 | 12.885 | 12.734-13.760 | 0.331 | 1.0x |
| `Set.has` | medium | 5,000 | 7 | 0.350 | 0.274-0.502 | 0.070 | 36.8x |
| `Map.has` | medium | 5,000 | 7 | 0.372 | 0.345-0.493 | 0.050 | 34.6x |
| `Array.includes` | large | 20,000 | 3 | 190.830 | 168.529-192.078 | 10.819 | 1.0x |
| `Set.has` | large | 20,000 | 3 | 1.429 | 1.400-2.229 | 0.384 | 133.5x |
| `Map.has` | large | 20,000 | 3 | 2.416 | 2.058-2.615 | 0.230 | 79.0x |

Decision: retain `Set` membership for `intersection`/`excludeBy` and `Map` for
keyed grouping/counting. Do not build an index for a single lookup by default;
construction pays off when a collection is queried repeatedly.

## Reused collators

This comparison sorts the same deterministic labels using `localeCompare` with
locale/options on every call versus one comparator from
`createCollatorComparator`. Both paths copy and sort the array.

| Strategy | Scale | Items | Samples | Median ms | Min-max ms | Std dev ms | Relative |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `localeCompare` options | small | 1,000 | 15 | 31.276 | 28.931-38.423 | 2.346 | 1.0x |
| reused `Intl.Collator` | small | 1,000 | 15 | 0.842 | 0.812-3.219 | 0.592 | 37.2x |
| `localeCompare` options | medium | 10,000 | 7 | 423.268 | 417.884-438.921 | 6.506 | 1.0x |
| reused `Intl.Collator` | medium | 10,000 | 7 | 12.747 | 12.642-13.243 | 0.214 | 33.2x |
| `localeCompare` options | large | 50,000 | 3 | 2,615.381 | 2,590.018-2,647.299 | 23.436 | 1.0x |
| reused `Intl.Collator` | large | 50,000 | 3 | 89.376 | 88.533-95.860 | 3.274 | 29.3x |

Decision: retain reusable collators for repeated sort comparisons. Callers with
explicit locale/options can create one comparator and pass it to
`sortBy`/`sortByMany`.

## UTF-8 text measurement

This comparison verifies that `utf8ByteLength` and `TextEncoder.encode` return
the same byte count for multilingual source text. The platform path allocates a
`Uint8Array` whose length equals the measured byte count; the Akashatools path
does not allocate a proportional encoded-byte array. Heap-delta sampling is not
reported because garbage-collection timing would make those numbers misleading;
the unavoidable output allocation is the relevant exact memory difference.

| Strategy | Scale | Code units | Samples | Median ms | Min-max ms | Std dev ms | Relative |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `TextEncoder.encode` | small | 3,840 | 21 | 0.004 | 0.004-0.043 | 0.008 | 1.0x |
| `utf8ByteLength` | small | 3,840 | 21 | 0.050 | 0.049-0.112 | 0.013 | 0.1x |
| `TextEncoder.encode` | medium | 100,032 | 11 | 0.119 | 0.110-0.257 | 0.044 | 1.0x |
| `utf8ByteLength` | medium | 100,032 | 11 | 0.143 | 0.142-0.149 | 0.002 | 0.8x |
| `TextEncoder.encode` | large | 1,000,000 | 5 | 0.987 | 0.975-1.003 | 0.009 | 1.0x |
| `utf8ByteLength` | large | 1,000,000 | 5 | 1.424 | 1.423-1.436 | 0.005 | 0.7x |

Decision: retain the allocation-free implementation. Its absolute small-input
cost remains about 0.05 ms, and the large-input path avoids allocating roughly
the entire encoded payload for a modest measured timing tradeoff. This also
matches the bounded text splitter's prefix-metric design.

No benchmark result alone justifies a readability regression. The measured
decisions use established platform data structures/APIs and leave clear
small-array or one-off compositions alone unless application profiling shows a
meaningful bottleneck.
