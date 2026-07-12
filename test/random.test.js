import assert from "node:assert/strict";
import test from "node:test";

import {
  randomBoolean,
  randomDate,
  randomFloat,
  randomInt,
  randomString,
  secureRandomString,
  secureRandomUuid,
} from "akashatools/random";

test("random helpers support deterministic injected sources", () => {
  assert.equal(randomInt(10, 20, { random: () => 0 }), 10);
  assert.equal(randomInt(10, 20, { random: () => 0.999 }), 20);
  assert.equal(randomBoolean(() => 0.5), true);
  assert.equal(randomString(4, "ab", () => 0), "aaaa");
});

test("random float and date helpers honor deterministic range boundaries", () => {
  assert.equal(randomFloat(10, 20, () => 0.25), 12.5);
  const start = new Date("2026-01-01T00:00:00.000Z");
  const end = new Date("2026-01-03T00:00:00.000Z");
  assert.equal(randomDate(start, end, () => 0).toISOString(), start.toISOString());
  assert.equal(randomDate(start, end, () => 0.5).toISOString(), "2026-01-02T00:00:00.000Z");
  assert.throws(() => randomFloat(-Number.MAX_VALUE, Number.MAX_VALUE), RangeError);
  assert.throws(() => randomInt(-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER), RangeError);
});

test("injected random sources must obey the Math.random half-open contract", () => {
  assert.throws(() => randomFloat(0, 1, () => -0.01), RangeError);
  assert.throws(() => randomInt(0, 1, { random: () => 1 }), RangeError);
  assert.throws(() => randomString(1, "a", () => Number.NaN), RangeError);
  assert.throws(() => randomInt(0, 1, { inclusiveMaximum: /** @type {any} */ ("yes") }), TypeError);
});

test("secure random helpers use explicit Web Crypto contracts", () => {
  assert.match(secureRandomUuid(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  const token = secureRandomString(128, "abc");
  assert.equal(token.length, 128);
  assert.match(token, /^[abc]+$/);
  assert.equal(secureRandomString(0), "");
  assert.throws(() => secureRandomString(4, "aa"), RangeError);
  assert.throws(() => randomString(1_000_001), RangeError);
});
