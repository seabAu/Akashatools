# Akashatools benchmarks

Benchmarks are decision evidence, not API performance guarantees. Results vary
by runtime, processor, data distribution, and surrounding workload. Re-run the
checked-in scripts when an implementation or supported Node version changes.

## Repeated membership checks

Run with:

```sh
npm run benchmark:membership
```

The benchmark filters one numeric array against another with 50% overlap. It
compares repeated `Array.prototype.includes` calls with `Set.has` and `Map.has`.
Set/Map construction time is included, every strategy returns the same verified
result, each scenario is warmed once, and the table reports the median elapsed
time. Larger scenarios use fewer repetitions to keep the development check fast.

Measured 2026-07-11 on Node.js 22.18.0, Windows 10.0.19045, Intel64 Family 6
Model 198:

| Strategy | Items | Median ms | Relative to `includes` |
| --- | ---: | ---: | ---: |
| `Array.includes` | 1,000 | 0.264 | 1.0x |
| `Set.has` | 1,000 | 0.058 | 4.6x |
| `Map.has` | 1,000 | 0.060 | 4.4x |
| `Array.includes` | 5,000 | 5.186 | 1.0x |
| `Set.has` | 5,000 | 0.355 | 14.6x |
| `Map.has` | 5,000 | 0.481 | 10.8x |
| `Array.includes` | 20,000 | 90.623 | 1.0x |
| `Set.has` | 20,000 | 1.651 | 54.9x |
| `Map.has` | 20,000 | 2.888 | 31.4x |

Decision: retain `Set` membership for `intersection`/`excludeBy` and `Map` for
keyed grouping/counting. Do not build an index for a single lookup by default;
construction pays off when the collection is queried repeatedly, as in this
benchmark. Small-array code should still favor the clearest contract unless
profiling identifies it as meaningful work.

## Reused collators

Run with:

```sh
npm run benchmark:collator
```

The benchmark sorts the same deterministic natural-number strings using
`localeCompare` with locale/options on every comparison versus one comparator
created by `createCollatorComparator`. Both outputs are asserted identical,
each scenario is warmed once, and median time includes the array copy/sort.

Measured in the same 2026-07-11 Node.js 22.18.0 environment:

| Strategy | Items | Median ms | Relative to `localeCompare` |
| --- | ---: | ---: | ---: |
| `localeCompare` options | 1,000 | 35.691 | 1.0x |
| reused `Intl.Collator` | 1,000 | 0.813 | 43.9x |
| `localeCompare` options | 10,000 | 499.450 | 1.0x |
| reused `Intl.Collator` | 10,000 | 12.345 | 40.5x |
| `localeCompare` options | 50,000 | 2,834.256 | 1.0x |
| reused `Intl.Collator` | 50,000 | 90.005 | 31.5x |

Decision: `compareValues` lazily retains its default numeric/base collator, and
callers with explicit locale/options can create one comparator and pass it to
`sortBy`/`sortByMany`. Avoid option-heavy `localeCompare` inside hot comparator
callbacks when the same policy is used repeatedly.
