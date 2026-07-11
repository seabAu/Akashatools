import assert from "node:assert/strict";
import test from "node:test";

import {
  array,
  camelCase,
  capitalize,
  clamp,
  clock12To24,
  clock24To12,
  clockTimeToMinutes,
  date,
  differenceInLocalDays,
  distance2d,
  excludeBy,
  fibonacci,
  formatDate,
  fulfilledValues,
  kebabCase,
  localDateKey,
  mapSettledWithConcurrency,
  minutesToClockTime,
  randomBoolean,
  randomInt,
  randomString,
  replaceMany,
  roundTo,
  safeFilename,
  sentenceCase,
  sortBy,
  sortByNumericOrder,
  sum,
  toBinary,
  upsertBy,
  wrap,
} from "akashatools";

test("root API exposes named functions and category namespaces", () => {
  assert.equal(array.chunk, array.chunk);
  assert.equal(typeof date.formatDate, "function");
  assert.equal(typeof formatDate, "function");
});

test("string helpers normalize identifiers and replace literal text", () => {
  assert.equal(capitalize("élan"), "Élan");
  assert.equal(kebabCase("XMLHttp request_value"), "xml-http-request-value");
  assert.equal(camelCase("hello-world"), "helloWorld");
  assert.equal(sentenceCase("helloWorld_value"), "Hello world value");
  assert.equal(replaceMany("a.b + a.b", { "a.b": "x" }), "x + x");
  assert.equal(safeFilename("  Résumé / July  "), "resume-july");
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

test("sorting returns stable copies and handles missing order fields", () => {
  const source = [{ name: "ten", rank: 10 }, { name: "two", rank: 2 }, { name: "none" }];
  assert.deepEqual(sortBy(source, ({ rank }) => rank).map(({ name }) => name), ["two", "ten", "none"]);
  assert.deepEqual(sortByNumericOrder([{ id: "b", order: 2 }, { id: "a", order: 1 }, { id: "x" }]).map(({ id }) => id), ["a", "b", "x"]);
  assert.equal(source[0].name, "ten");
});

test("random helpers support deterministic injected sources", () => {
  assert.equal(randomInt(10, 20, { random: () => 0 }), 10);
  assert.equal(randomInt(10, 20, { random: () => 0.999 }), 20);
  assert.equal(randomBoolean(() => 0.5), true);
  assert.equal(randomString(4, "ab", () => 0), "aaaa");
});

test("date helpers handle local calendar and clock operations", () => {
  const local = new Date(2026, 6, 11, 23, 30);
  assert.equal(localDateKey(local), "2026-07-11");
  assert.equal(differenceInLocalDays(new Date(2026, 6, 12), new Date(2026, 6, 10)), 2);
  assert.equal(clockTimeToMinutes("23:59"), 1439);
  assert.equal(minutesToClockTime(-1), "23:59");
  assert.equal(clock12To24("12:05 AM"), "00:05");
  assert.equal(clock24To12("14:05"), "2:05 PM");
});

test("bounded async mapping preserves order and failures", async () => {
  let active = 0;
  let maximum = 0;
  const results = await mapSettledWithConcurrency([1, 2, 3, 4], 2, async (value) => {
    active += 1;
    maximum = Math.max(maximum, active);
    await new Promise((resolve) => setTimeout(resolve, 2));
    active -= 1;
    if (value === 3) throw new Error("three");
    return value * 2;
  });
  assert.equal(maximum, 2);
  assert.deepEqual(fulfilledValues(results), [2, 4, 8]);
});

test("collection helpers upsert and exclude by derived identity", () => {
  assert.deepEqual(upsertBy([{ key: "one", value: 1 }], { key: "one", value: 2 }, ({ key }) => key), [{ key: "one", value: 2 }]);
  assert.deepEqual(excludeBy([{ key: "one" }, { key: "two" }], new Set(["one"]), ({ key }) => key), [{ key: "two" }]);
});
