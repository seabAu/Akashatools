import assert from "node:assert/strict";

import { createCollatorComparator } from "../src/sort.js";

const scenarios = [
  { size: 1_000, repetitions: 15 },
  { size: 10_000, repetitions: 7 },
  { size: 50_000, repetitions: 3 },
];
const options = { numeric: true, sensitivity: "base" };
const compareWithCollator = createCollatorComparator("en", options);

console.log("| Strategy | Items | Median ms | Relative |");
console.log("| --- | ---: | ---: | ---: |");

for (const { size, repetitions } of scenarios) {
  const values = Array.from({ length: size }, (_, index) => `Item-${(index * 7_919) % size}`);
  const localeResult = values.toSorted((left, right) => left.localeCompare(right, "en", options));
  const collatorResult = values.toSorted(compareWithCollator);
  assert.deepEqual(collatorResult, localeResult);

  const localeMs = median(run(repetitions, () => values.toSorted((left, right) => left.localeCompare(right, "en", options))));
  const collatorMs = median(run(repetitions, () => values.toSorted(compareWithCollator)));

  row("localeCompare options", size, localeMs, localeMs);
  row("reused Intl.Collator", size, collatorMs, localeMs);
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
