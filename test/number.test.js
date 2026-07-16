import assert from "node:assert/strict";
import test from "node:test";

import { summarizeNumbers } from "akashatools";
import {
  clamp,
  distance2d,
  fibonacci,
  formatBytes,
  roundTo,
  summarizeNumbers as summarizeFromCategory,
  sum,
  toBinary,
  wrap,
} from "akashatools/number";

test("formatBytes uses explicit stable decimal and binary unit contracts", () => {
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(999), "999 B");
  assert.equal(formatBytes(1_500), "1.5 KB");
  assert.equal(formatBytes(12_000_000), "12 MB");
  assert.equal(formatBytes(1_536, { system: "binary", maximumFractionDigits: 2 }), "1.5 KiB");
  assert.equal(formatBytes(999_999, { maximumFractionDigits: 0 }), "1 MB");
  assert.throws(() => formatBytes(-1), RangeError);
  assert.throws(() => formatBytes(Number.NaN), TypeError);
  assert.throws(() => formatBytes(1, { system: /** @type {any} */ ("metric") }), TypeError);
  assert.throws(() => formatBytes(1, /** @type {any} */ ([])), TypeError);
});

test("number helpers validate ranges and avoid recursive conversions", () => {
  assert.equal(clamp(20, 0, 10), 10);
  assert.equal(wrap(-1, 0, 4), 3);
  assert.equal(roundTo(1.005, 2), 1.01);
  assert.equal(sum(1, 2, 3), 6);
  assert.equal(distance2d([0, 0], [3, 4]), 5);
  assert.equal(fibonacci(10), 55);
  assert.equal(toBinary(-5), "-101");
});

test("numeric boundaries reject coercion, overflow, and non-finite values", () => {
  assert.equal(clamp(-10, -5, 5), -5);
  assert.equal(wrap(5, 0, 5), 0);
  assert.equal(wrap(-0.5, 0, 5), 4.5);
  assert.equal(roundTo(1.005, 2), 1.01);
  assert.equal(roundTo(1.2345e-7, 10), 1.235e-7);
  assert.throws(() => clamp(/** @type {any} */ ("2"), 0, 5), TypeError);
  assert.throws(() => clamp(Number.NaN, 0, 5), TypeError);
  assert.throws(() => wrap(0, -Number.MAX_VALUE, Number.MAX_VALUE), RangeError);
  assert.throws(() => roundTo(Number.POSITIVE_INFINITY, 2), TypeError);
  assert.throws(() => roundTo(Number.MAX_VALUE, -308), RangeError);
});

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
