import assert from "node:assert/strict";

import { createMembershipFixture, membershipScenarios } from "./fixtures.mjs";
import { measure, printEnvironment, printTable } from "./harness.mjs";

printEnvironment("Repeated membership checks");
const rows = [];

for (const { scale, size, samples } of membershipScenarios) {
  const { values, candidates } = createMembershipFixture(size);
  const includesResult = values.filter((value) => candidates.includes(value));
  const candidateSet = new Set(candidates);
  const setResult = values.filter((value) => candidateSet.has(value));
  const candidateMap = new Map(candidates.map((value) => [value, true]));
  const mapResult = values.filter((value) => candidateMap.has(value));
  assert.deepEqual(setResult, includesResult);
  assert.deepEqual(mapResult, includesResult);

  const includes = measure(samples, () => values.filter((value) => candidates.includes(value)));
  const set = measure(samples, () => {
    const lookup = new Set(candidates);
    return values.filter((value) => lookup.has(value));
  });
  const map = measure(samples, () => {
    const lookup = new Map(candidates.map((value) => [value, true]));
    return values.filter((value) => lookup.has(value));
  });
  for (const [strategy, result] of [
    ["Array.includes", includes],
    ["Set.has", set],
    ["Map.has", map],
  ]) {
    rows.push({ strategy, scale, items: size, baseline: includes.median, ...result });
  }
}

printTable(rows);
