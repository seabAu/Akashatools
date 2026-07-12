import assert from "node:assert/strict";

const scenarios = [
  { size: 1_000, repetitions: 15 },
  { size: 5_000, repetitions: 7 },
  { size: 20_000, repetitions: 3 },
];

console.log("| Strategy | Items | Median ms | Relative |");
console.log("| --- | ---: | ---: | ---: |");

for (const { size, repetitions } of scenarios) {
  const values = Array.from({ length: size }, (_, index) => index);
  const candidates = Array.from({ length: size }, (_, index) => index + Math.floor(size / 2));

  const includesResult = values.filter((value) => candidates.includes(value));
  const candidateSet = new Set(candidates);
  const setResult = values.filter((value) => candidateSet.has(value));
  assert.deepEqual(setResult, includesResult);

  const includesMs = median(run(repetitions, () => values.filter((value) => candidates.includes(value))));
  const setMs = median(run(repetitions, () => {
    const candidatesSet = new Set(candidates);
    return values.filter((value) => candidatesSet.has(value));
  }));
  const mapMs = median(run(repetitions, () => {
    const candidatesMap = new Map(candidates.map((value) => [value, true]));
    return values.filter((value) => candidatesMap.has(value));
  }));

  row("Array.includes", size, includesMs, includesMs);
  row("Set.has", size, setMs, includesMs);
  row("Map.has", size, mapMs, includesMs);
}

/** @param {number} repetitions @param {() => unknown} operation */
function run(repetitions, operation) {
  operation();
  return Array.from({ length: repetitions }, () => {
    const start = process.hrtime.bigint();
    operation();
    return Number(process.hrtime.bigint() - start) / 1_000_000;
  });
}

/** @param {number[]} values */
function median(values) {
  const ordered = values.toSorted((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0
    ? (ordered[middle - 1] + ordered[middle]) / 2
    : ordered[middle];
}

/** @param {string} strategy @param {number} size @param {number} duration @param {number} baseline */
function row(strategy, size, duration, baseline) {
  console.log(`| ${strategy} | ${size.toLocaleString("en-US")} | ${duration.toFixed(3)} | ${(baseline / duration).toFixed(1)}x |`);
}
