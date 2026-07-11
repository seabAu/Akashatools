import assert from "node:assert/strict";
import test from "node:test";

import { summarizeNumbers } from "akashatools";
import { summarizeNumbers as summarizeFromCategory } from "akashatools/number";

test("summarizeNumbers reports interpolated percentiles and population deviation", () => {
  const source = [40, 10, 30, 20];
  const summary = summarizeNumbers(source);

  assert.deepEqual(source, [40, 10, 30, 20]);
  assert.equal(summarizeNumbers, summarizeFromCategory);
  assert.deepEqual(summary, {
    count: 4,
    minimum: 10,
    maximum: 40,
    median: 25,
    p75: 32.5,
    p95: 38.5,
    mean: 25,
    standardDeviation: Math.sqrt(125),
  });
});

test("summarizeNumbers distinguishes an empty sample from observed zero", () => {
  assert.deepEqual(summarizeNumbers([]), {
    count: 0,
    minimum: null,
    maximum: null,
    median: null,
    p75: null,
    p95: null,
    mean: null,
    standardDeviation: null,
  });
  assert.deepEqual(summarizeNumbers([0]), {
    count: 1,
    minimum: 0,
    maximum: 0,
    median: 0,
    p75: 0,
    p95: 0,
    mean: 0,
    standardDeviation: 0,
  });
});

test("summarizeNumbers scales calculations for extreme finite values", () => {
  const summary = summarizeNumbers([-Number.MAX_VALUE, Number.MAX_VALUE]);
  assert.equal(summary.mean, 0);
  assert.equal(summary.median, 0);
  assert.equal(summary.standardDeviation, Number.MAX_VALUE);
  assert.equal(Number.isFinite(summary.p75), true);
});

test("summarizeNumbers rejects invalid samples", () => {
  assert.throws(() => summarizeNumbers(/** @type {any} */ (new Set([1, 2]))), TypeError);
  assert.throws(() => summarizeNumbers([1, Number.NaN]), /values\[1\]/);
  assert.throws(() => summarizeNumbers([Number.POSITIVE_INFINITY]), TypeError);
});
