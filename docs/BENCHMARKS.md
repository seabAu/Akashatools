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
  one-million-code-unit work limits;
- repeated serialized number values from form-style input; and
- deterministic longitude/latitude positions for repeated and batched distance
  filtering; and
- mixed primitive, built-in, function, collection, typed-array, and custom-brand
  values for runtime type classification.

Every strategy receives the same retained input and its output is asserted equal
to the baseline before timing. The shared harness performs three warmups, uses
`process.hrtime.bigint()`, and reports sample count, median, range, population
standard deviation, runtime, operating system, architecture, and processor.
Construction work is included when it would occur in the compared operation.

The results below were measured 2026-07-18 on Node.js 22.18.0, Windows
10.0.19045 x64, Intel Core Ultra 9 285K.

## Canonical runtime type dispatch

This comparison classifies the same mixed primitives, ordinary and async
functions, arrays, built-ins, typed arrays, and custom intrinsic brand through
the former dynamic-lowercase implementation and the canonical constant
dispatch used by `typeOf`. Every batch checksum is asserted equal before
timing. The small result differs by roughly four hundredths of a millisecond;
at one million calls, direct dispatch is slightly faster.

| Strategy | Scale | Calls | Samples | Median ms | Min-max ms | Std dev ms | Relative |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| dynamic lowercase brand | small | 1,000 | 21 | 0.042 | 0.026-0.329 | 0.067 | 1.0x |
| canonical constant dispatch | small | 1,000 | 21 | 0.079 | 0.077-0.190 | 0.024 | 0.5x |
| dynamic lowercase brand | medium | 100,000 | 11 | 2.856 | 2.803-3.046 | 0.074 | 1.0x |
| canonical constant dispatch | medium | 100,000 | 11 | 2.562 | 2.475-2.600 | 0.033 | 1.1x |
| dynamic lowercase brand | large | 1,000,000 | 5 | 28.939 | 28.024-29.282 | 0.476 | 1.0x |
| canonical constant dispatch | large | 1,000,000 | 5 | 25.899 | 25.613-26.198 | 0.191 | 1.1x |

Decision: use direct primitive and built-in dispatch so known results come from
`DATA_TYPES`, retain dynamic lowercase fallback for custom brands, and reject a
generic `Map` lookup that measured materially slower during refinement.

## Repeated membership checks

This comparison filters one string-ID array against another with 50% overlap.
Set/Map construction is included.

| Strategy | Scale | Items | Samples | Median ms | Min-max ms | Std dev ms | Relative |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `Array.includes` | small | 1,000 | 15 | 0.702 | 0.491-1.615 | 0.280 | 1.0x |
| `Set.has` | small | 1,000 | 15 | 0.049 | 0.039-0.718 | 0.166 | 14.2x |
| `Map.has` | small | 1,000 | 15 | 0.076 | 0.061-0.355 | 0.076 | 9.3x |
| `Array.includes` | medium | 5,000 | 7 | 17.902 | 15.772-20.409 | 1.531 | 1.0x |
| `Set.has` | medium | 5,000 | 7 | 0.450 | 0.293-0.503 | 0.067 | 39.8x |
| `Map.has` | medium | 5,000 | 7 | 0.481 | 0.384-0.677 | 0.102 | 37.2x |
| `Array.includes` | large | 20,000 | 3 | 208.459 | 198.849-227.175 | 11.762 | 1.0x |
| `Set.has` | large | 20,000 | 3 | 1.541 | 1.474-2.368 | 0.406 | 135.2x |
| `Map.has` | large | 20,000 | 3 | 4.566 | 2.375-4.705 | 1.067 | 45.7x |

Decision: retain `Set` membership for `intersection`/`excludeBy` and `Map` for
keyed grouping/counting. Do not build an index for a single lookup by default;
construction pays off when a collection is queried repeatedly.

## Reused collators

This comparison sorts the same deterministic labels using `localeCompare` with
locale/options on every call versus one comparator from
`createCollatorComparator`. Both paths copy and sort the array.

| Strategy | Scale | Items | Samples | Median ms | Min-max ms | Std dev ms | Relative |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `localeCompare` options | small | 1,000 | 15 | 38.886 | 34.619-69.872 | 8.668 | 1.0x |
| reused `Intl.Collator` | small | 1,000 | 15 | 1.196 | 1.170-1.371 | 0.054 | 32.5x |
| `localeCompare` options | medium | 10,000 | 7 | 587.822 | 534.884-1,234.193 | 231.143 | 1.0x |
| reused `Intl.Collator` | medium | 10,000 | 7 | 17.358 | 14.476-22.444 | 2.262 | 33.9x |
| `localeCompare` options | large | 50,000 | 3 | 3,237.126 | 3,061.444-3,320.553 | 107.992 | 1.0x |
| reused `Intl.Collator` | large | 50,000 | 3 | 134.772 | 113.117-142.154 | 12.322 | 24.0x |

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
| `TextEncoder.encode` | small | 3,840 | 21 | 0.006 | 0.005-0.051 | 0.012 | 1.0x |
| `utf8ByteLength` | small | 3,840 | 21 | 0.061 | 0.010-0.110 | 0.022 | 0.1x |
| `TextEncoder.encode` | medium | 100,032 | 11 | 0.148 | 0.143-0.154 | 0.003 | 1.0x |
| `utf8ByteLength` | medium | 100,032 | 11 | 0.167 | 0.142-0.257 | 0.049 | 0.9x |
| `TextEncoder.encode` | large | 1,000,000 | 5 | 1.269 | 0.969-1.362 | 0.153 | 1.0x |
| `utf8ByteLength` | large | 1,000,000 | 5 | 1.453 | 1.451-1.724 | 0.108 | 0.9x |

Decision: retain the allocation-free implementation. Its absolute small-input
cost remains about 0.06 ms, and the large-input path avoids allocating roughly
the entire encoded payload for a modest measured timing tradeoff. This also
matches the bounded text splitter's prefix-metric design.

## Compiled serialized-input parsing

This 2026-07-18 comparison parses the same complete finite numeric strings
through the one-shot `parseInputValue` wrapper and one parser returned by
`createInputValueParser`. The checksum of every batch is asserted equal before
timing. This does not compare against legacy `parseInt`, because losing decimals
and accepting trailing junk would make that a different contract.

| Strategy | Scale | Calls | Samples | Median ms | Min-max ms | Std dev ms | Relative |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| one-shot `parseInputValue` | small | 1,000 | 21 | 0.396 | 0.284-0.873 | 0.162 | 1.0x |
| reused compiled parser | small | 1,000 | 21 | 0.045 | 0.044-0.145 | 0.021 | 8.8x |
| one-shot `parseInputValue` | medium | 100,000 | 11 | 40.974 | 34.872-49.174 | 3.611 | 1.0x |
| reused compiled parser | medium | 100,000 | 11 | 4.131 | 3.779-4.825 | 0.333 | 9.9x |
| one-shot `parseInputValue` | large | 1,000,000 | 5 | 339.055 | 309.093-360.642 | 17.838 | 1.0x |
| reused compiled parser | large | 1,000,000 | 5 | 39.359 | 38.516-40.438 | 0.669 | 8.6x |

Decision: keep the one-shot wrapper for clarity and low-volume work, and use a
compiled parser in repeated input handlers. Parser compilation improves the hot
path without weakening validation or maintaining a second conversion contract.

## Batched geospatial distance filtering

This 2026-07-18 comparison filters the same positions with repeated
`isWithinGeoDistance` calls versus `filterPositionsWithinDistance`. Both use the
same Haversine unit/radius semantics, and the selected original position
references are asserted deeply equal before timing. The batch helper validates
its list bound and normalizes the shared target/options once.

| Strategy | Scale | Positions | Samples | Median ms | Min-max ms | Std dev ms | Relative |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| repeated atomic predicate | small | 100 | 21 | 0.229 | 0.195-0.529 | 0.101 | 1.0x |
| bounded batched filter | small | 100 | 21 | 0.084 | 0.080-0.235 | 0.034 | 2.7x |
| repeated atomic predicate | medium | 10,000 | 11 | 17.974 | 15.728-19.639 | 1.203 | 1.0x |
| bounded batched filter | medium | 10,000 | 11 | 9.356 | 8.603-11.804 | 0.862 | 1.9x |
| repeated atomic predicate | large | 100,000 | 5 | 179.811 | 177.310-199.398 | 9.156 | 1.0x |
| bounded batched filter | large | 100,000 | 5 | 112.085 | 101.853-121.489 | 7.740 | 1.6x |

Decision: retain both variants. The atomic predicate is the composable core;
the bounded batch wrapper is the semantically distinct high-volume path and
avoids repeated invariant setup.

No benchmark result alone justifies a readability regression. The measured
decisions use established platform data structures/APIs and leave clear
small-array or one-off compositions alone unless application profiling shows a
meaningful bottleneck.
