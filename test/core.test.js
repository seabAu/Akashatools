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
  escapeHtml,
  excludeBy,
  fibonacci,
  formatDate,
  fulfilledValues,
  kebabCase,
  localDateKey,
  mapSettledWithConcurrency,
  minutesToClockTime,
  pascalCase,
  randomBoolean,
  randomDate,
  randomFloat,
  randomInt,
  randomString,
  replaceMany,
  replaceRegex,
  roundTo,
  safeFilename,
  sentenceCase,
  slugify,
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
  assert.equal(kebabCase("APIResponse2_value déjà"), "api-response2-value-déjà");
  assert.equal(camelCase("XML_HTTP response2Value"), "xmlHttpResponse2Value");
  assert.equal(pascalCase("version2-api"), "Version2Api");
});

test("literal and regular-expression replacements have separate contracts", () => {
  const pattern = /a./g;
  pattern.lastIndex = 2;
  assert.equal(replaceMany("a.b + a.b", { "a.b": "literal" }), "literal + literal");
  assert.equal(replaceRegex("ab ac", pattern, "x"), "x x");
  assert.equal(pattern.lastIndex, 2);
  assert.equal(replaceRegex("a1 b2", /([a-z])(\d)/g, (_, letter, digit) => `${digit}${letter}`), "1a 2b");
  assert.throws(() => replaceRegex("value", /** @type {any} */ ("value"), "x"), TypeError);
});

test("slug and filename helpers normalize unsafe cross-platform names", () => {
  assert.equal(slugify("Crème brûlée / API v2"), "creme-brulee-api-v2");
  assert.equal(slugify("***", { fallback: "Fallback Item" }), "fallback-item");
  assert.equal(safeFilename("CON"), "file-con");
  assert.equal(safeFilename(" report.\u0000. "), "report");
  assert.equal(safeFilename("***", { fallback: "NUL" }), "file-nul");
  assert.equal(safeFilename("abcdefgh", { maximumLength: 5 }), "abcde");
  assert.equal(escapeHtml('<script src="x">&</script>'), "&lt;script src=&quot;x&quot;&gt;&amp;&lt;/script&gt;");
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

test("random float and date helpers honor deterministic range boundaries", () => {
  assert.equal(randomFloat(10, 20, () => 0.25), 12.5);
  const start = new Date("2026-01-01T00:00:00.000Z");
  const end = new Date("2026-01-03T00:00:00.000Z");
  assert.equal(randomDate(start, end, () => 0).toISOString(), start.toISOString());
  assert.equal(randomDate(start, end, () => 0.5).toISOString(), "2026-01-02T00:00:00.000Z");
});

test("injected random sources must obey the Math.random half-open contract", () => {
  assert.throws(() => randomFloat(0, 1, () => -0.01), RangeError);
  assert.throws(() => randomInt(0, 1, { random: () => 1 }), RangeError);
  assert.throws(() => randomString(1, "a", () => Number.NaN), RangeError);
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

test("collection identity helpers keep numeric keys distinct from indices", () => {
  const source = [10, , 20];
  assert.deepEqual(upsertBy(source, 11, (value) => value, { prepend: false }), [10, undefined, 20, 11]);
  assert.deepEqual(upsertBy(source, 12, () => 10), [12, undefined, 20]);
  assert.deepEqual(excludeBy(source, new Set([0]), (value) => value), [10, undefined, 20]);
  assert.deepEqual(excludeBy(source, new Set([10]), (value) => value), [undefined, 20]);
  assert.equal(1 in source, false);
  assert.throws(() => upsertBy([], 1, undefined, { prepend: /** @type {any} */ ("yes") }), TypeError);
});
