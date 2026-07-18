import assert from "node:assert/strict";
import test from "node:test";

import {
  createInputValueParser,
  fromUnixSeconds,
  getAtPath,
  haversineDistance,
  normalizeGeoPosition,
  range,
  setAtPath,
  sortBy,
  toUnixSeconds,
  unique,
} from "akashatools";
import { assertDoesNotMutate, assertInvalidCallsThrow } from "../fixtures/test-support/contracts.js";

const random = createDeterministicRandom(0xa5a5_2026);

test("randomized safe paths round-trip values without mutating their roots", () => {
  for (let iteration = 0; iteration < 250; iteration += 1) {
    const segments = Array.from({ length: randomInteger(1, 8) }, (_, index) =>
      random() < 0.35 ? randomInteger(0, 4) : `field_${index}_${randomInteger(0, 20)}`,
    );
    const root = { retained: { iteration } };
    const value = { iteration, token: randomInteger(0, 1_000_000) };
    const updated = assertDoesNotMutate(root, (input) => setAtPath(input, segments, value));
    assert.deepEqual(getAtPath(updated, segments), value);
    assert.equal(updated.retained, root.retained);
  }

  assertInvalidCallsThrow([
    () => setAtPath({}, ["safe", "__proto__", "value"], true),
    () => setAtPath({}, ["constructor", "value"], true),
  ]);
});

test("randomized integer ranges preserve half-open length and step invariants", () => {
  for (let iteration = 0; iteration < 500; iteration += 1) {
    const start = randomInteger(-10_000, 10_000);
    const count = randomInteger(0, 200);
    const magnitude = randomInteger(1, 20);
    const step = random() < 0.5 ? magnitude : -magnitude;
    const values = range(start, start + count * step, step);
    assert.equal(values.length, count);
    assert.equal(values[0], count === 0 ? undefined : start);
    assert.equal(values.at(-1), count === 0 ? undefined : start + (count - 1) * step);
    for (let index = 1; index < values.length; index += 1) assert.equal(values[index] - values[index - 1], step);
  }

  assertInvalidCallsThrow([() => range(0, 10, Number.NaN)], RangeError);
});

test("randomized stable sorting orders keys, preserves ties, and does not mutate", () => {
  for (let iteration = 0; iteration < 200; iteration += 1) {
    const input = Array.from({ length: randomInteger(0, 100) }, (_, index) => ({
      key: randomInteger(-5, 5),
      index,
    }));
    const sorted = assertDoesNotMutate(input, (values) => sortBy(values, ({ key }) => key));
    for (let index = 1; index < sorted.length; index += 1) {
      assert.ok(sorted[index - 1].key <= sorted[index].key);
      if (sorted[index - 1].key === sorted[index].key) assert.ok(sorted[index - 1].index < sorted[index].index);
    }
  }
});

test("randomized deduplication retains exactly the first occurrence of each key", () => {
  for (let iteration = 0; iteration < 300; iteration += 1) {
    const input = Array.from({ length: randomInteger(0, 200) }, () => randomInteger(-20, 20));
    const result = assertDoesNotMutate(input, (values) => unique(values));
    assert.deepEqual(result, [...new Set(input)]);
  }
});

test("randomized whole-second dates round-trip through strict Unix seconds", () => {
  const minimum = Date.UTC(1970, 0, 1) / 1_000;
  const maximum = Date.UTC(2100, 0, 1) / 1_000;
  for (let iteration = 0; iteration < 500; iteration += 1) {
    const seconds = randomInteger(minimum, maximum);
    const date = new Date(seconds * 1_000);
    assert.equal(toUnixSeconds(date), seconds);
    assert.equal(fromUnixSeconds(seconds).getTime(), date.getTime());
  }
});

test("generated ISO calendar boundaries parse without native date normalization", () => {
  const parseTimestamp = createInputValueParser(Date, { dateOutput: "timestamp" });
  for (let year = 1996; year <= 2032; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      const finalDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      for (const day of [1, finalDay]) {
        const source = `${year}-${padTwo(month)}-${padTwo(day)}T23:59:59.999Z`;
        assert.equal(parseTimestamp(source), Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      }
      const invalid = `${year}-${padTwo(month)}-${padTwo(finalDay + 1)}T12:00:00Z`;
      assert.throws(() => parseTimestamp(invalid), /valid ISO/);
    }
  }
});

test("generated geospatial distances remain symmetric across world boundaries", () => {
  const geoRandom = createDeterministicRandom(0x6e6f_7274);
  for (let iteration = 0; iteration < 400; iteration += 1) {
    const left = [geoRandom() * 360 - 180, geoRandom() * 180 - 90];
    const right = [geoRandom() * 360 - 180, geoRandom() * 180 - 90];
    const forward = haversineDistance(left, right);
    const reverse = haversineDistance(right, left);
    assert.ok(Math.abs(forward - reverse) <= Math.max(1, forward) * Number.EPSILON * 8);
    assert.equal(haversineDistance(left, left), 0);
    assert.deepEqual(normalizeGeoPosition({ longitude: left[0], latitude: left[1] }), left);
  }

  const acrossAntimeridian = haversineDistance([179.9, 0], [-179.9, 0]);
  assert.ok(acrossAntimeridian > 22_000 && acrossAntimeridian < 23_000);
  assert.ok(
    Math.abs(haversineDistance([0, 0], [0, 1]) / 1_000 - haversineDistance([0, 0], [0, 1], { unit: "kilometers" })) <
      1e-9,
  );
});

function createDeterministicRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function randomInteger(minimum, maximum) {
  return Math.floor(random() * (maximum - minimum + 1)) + minimum;
}

function padTwo(value) {
  return String(value).padStart(2, "0");
}
