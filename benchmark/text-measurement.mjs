import assert from "node:assert/strict";

import { utf8ByteLength } from "../src/string.js";
import { createTextFixture, textScenarios } from "./fixtures.mjs";
import { measure, printEnvironment, printTable } from "./harness.mjs";

const encoder = new TextEncoder();
printEnvironment("UTF-8 text measurement");
const rows = [];

for (const { scale, minimumLength, samples } of textScenarios) {
  const text = createTextFixture(minimumLength);
  const expected = encoder.encode(text).byteLength;
  assert.equal(utf8ByteLength(text), expected);

  const platform = measure(samples, () => encoder.encode(text).byteLength);
  const allocationFree = measure(samples, () => utf8ByteLength(text));
  for (const [strategy, result] of [
    ["TextEncoder.encode", platform],
    ["utf8ByteLength", allocationFree],
  ]) {
    rows.push({ strategy, scale, items: text.length, baseline: platform.median, ...result });
  }
}

printTable(rows);
