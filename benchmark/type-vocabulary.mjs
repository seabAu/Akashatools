import assert from "node:assert/strict";

import { typeOf } from "../src/validation.js";
import { measure, printEnvironment, printTable } from "./harness.mjs";

const scenarios = Object.freeze([
  Object.freeze({ scale: "small", calls: 1_000, samples: 21 }),
  Object.freeze({ scale: "medium", calls: 100_000, samples: 11 }),
  Object.freeze({ scale: "large", calls: 1_000_000, samples: 5 }),
]);
const customBrand = Object.freeze({ [Symbol.toStringTag]: "AkashaRecord" });
const values = Object.freeze([
  undefined,
  null,
  false,
  1,
  Number.NaN,
  "text",
  1n,
  Symbol("value"),
  () => undefined,
  async () => undefined,
  [],
  new Date(0),
  new Map(),
  new Uint8Array(2),
  {},
  customBrand,
]);

printEnvironment("Canonical runtime type dispatch");
const rows = [];

for (const { scale, calls, samples } of scenarios) {
  const legacyOperation = () => classifyBatch(calls, legacyTypeOf);
  const canonicalOperation = () => classifyBatch(calls, typeOf);
  const expected = legacyOperation();
  assert.equal(canonicalOperation(), expected);

  const legacy = measure(samples, legacyOperation);
  const canonical = measure(samples, canonicalOperation);
  for (const [strategy, result] of [
    ["dynamic lowercase brand", legacy],
    ["canonical constant dispatch", canonical],
  ]) {
    rows.push({ strategy, scale, items: calls, baseline: legacy.median, ...result });
  }
}

printTable(rows);

/** @param {number} calls @param {(value: unknown) => string} classifier */
function classifyBatch(calls, classifier) {
  let checksum = 0;
  for (let index = 0; index < calls; index += 1) {
    checksum += classifier(values[index % values.length]).length;
  }
  return checksum;
}

/** Historic implementation retained only as an equal-output benchmark baseline. */
function legacyTypeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isNaN(value)) return "nan";
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}
