import assert from "node:assert/strict";

import { createCollatorComparator } from "../src/sort.js";
import { collatorScenarios, createCollatorFixture } from "./fixtures.mjs";
import { measure, printEnvironment, printTable } from "./harness.mjs";

const options = { numeric: true, sensitivity: "base" };
const compareWithCollator = createCollatorComparator("en", options);
printEnvironment("Reused collators");
const rows = [];

for (const { scale, size, samples } of collatorScenarios) {
  const values = createCollatorFixture(size);
  const localeResult = values.toSorted((left, right) => left.localeCompare(right, "en", options));
  const collatorResult = values.toSorted(compareWithCollator);
  assert.deepEqual(collatorResult, localeResult);

  const locale = measure(samples, () => values.toSorted((left, right) => left.localeCompare(right, "en", options)));
  const collator = measure(samples, () => values.toSorted(compareWithCollator));
  for (const [strategy, result] of [
    ["localeCompare options", locale],
    ["reused Intl.Collator", collator],
  ]) {
    rows.push({ strategy, scale, items: size, baseline: locale.median, ...result });
  }
}

printTable(rows);
