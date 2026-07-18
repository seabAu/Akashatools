import assert from "node:assert/strict";

import { filterPositionsWithinDistance, isWithinGeoDistance } from "../src/geo.js";
import { createInputValueParser, parseInputValue } from "../src/input.js";
import { measure, printEnvironment, printTable } from "./harness.mjs";

const parsingScenarios = Object.freeze([
  Object.freeze({ scale: "small", calls: 1_000, samples: 21 }),
  Object.freeze({ scale: "medium", calls: 100_000, samples: 11 }),
  Object.freeze({ scale: "large", calls: 1_000_000, samples: 5 }),
]);
const geoScenarios = Object.freeze([
  Object.freeze({ scale: "small", size: 100, samples: 21 }),
  Object.freeze({ scale: "medium", size: 10_000, samples: 11 }),
  Object.freeze({ scale: "large", size: 100_000, samples: 5 }),
]);
const numericInputs = ["12.50", "-4", "0.125e2", "0", "9000.0001"];

printEnvironment("Compiled serialized-input parsing");
const parsingRows = [];
const compiledNumberParser = createInputValueParser(Number);

for (const { scale, calls, samples } of parsingScenarios) {
  const oneShotOperation = () => parseNumberBatch(calls, (value) => parseInputValue(value, Number));
  const compiledOperation = () => parseNumberBatch(calls, compiledNumberParser);
  const expected = oneShotOperation();
  assert.equal(compiledOperation(), expected);

  const oneShot = measure(samples, oneShotOperation);
  const compiled = measure(samples, compiledOperation);
  for (const [strategy, result] of [
    ["one-shot parseInputValue", oneShot],
    ["reused compiled parser", compiled],
  ]) {
    parsingRows.push({ strategy, scale, items: calls, baseline: oneShot.median, ...result });
  }
}

printTable(parsingRows);

printEnvironment("Batched geospatial distance filtering");
const geoRows = [];
const target = [-74, 40.7];
const maximumDistance = 12;
const distanceOptions = { unit: "kilometers" };

for (const { scale, size, samples } of geoScenarios) {
  const positions = createGeoPositions(size);
  const repeatedOperation = () =>
    positions.filter((position) => isWithinGeoDistance(target, position, maximumDistance, distanceOptions));
  const batchedOperation = () =>
    filterPositionsWithinDistance(target, positions, maximumDistance, {
      ...distanceOptions,
      maximumPositions: size,
    });
  const expected = repeatedOperation();
  assert.deepEqual(batchedOperation(), expected);

  const repeated = measure(samples, repeatedOperation);
  const batched = measure(samples, batchedOperation);
  for (const [strategy, result] of [
    ["repeated atomic predicate", repeated],
    ["bounded batched filter", batched],
  ]) {
    geoRows.push({ strategy, scale, items: size, baseline: repeated.median, ...result });
  }
}

printTable(geoRows);

/** @param {number} calls @param {(value: string) => unknown} parser */
function parseNumberBatch(calls, parser) {
  let total = 0;
  for (let index = 0; index < calls; index += 1) {
    total += /** @type {number} */ (parser(numericInputs[index % numericInputs.length]));
  }
  return total;
}

/** @param {number} size */
function createGeoPositions(size) {
  return Array.from({ length: size }, (_, index) => {
    const longitude = -74 + ((index * 7_919) % 4_000) / 10_000;
    const latitude = 40.7 + ((index * 3_571) % 3_000) / 10_000;
    return [longitude, latitude];
  });
}
