import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";

import {
  camelCase,
  capitalize,
  countWords,
  escapeHtml,
  includesText,
  kebabCase,
  pascalCase,
  replaceMany,
  replaceRegex,
  safeFilename,
  sentenceCase,
  slugify,
  stableJson,
  utf8ByteLength,
} from "akashatools/string";

test("string helpers normalize identifiers and replace literal text", () => {
  assert.equal(capitalize("\u00e9lan"), "\u00c9lan");
  assert.equal(kebabCase("XMLHttp request_value"), "xml-http-request-value");
  assert.equal(camelCase("hello-world"), "helloWorld");
  assert.equal(sentenceCase("helloWorld_value"), "Hello world value");
  assert.equal(replaceMany("a.b + a.b", { "a.b": "x" }), "x + x");
  assert.equal(safeFilename("  R\u00e9sum\u00e9 / July  "), "resume-july");
  assert.equal(kebabCase("APIResponse2_value d\u00e9j\u00e0"), "api-response2-value-d\u00e9j\u00e0");
  assert.equal(camelCase("XML_HTTP response2Value"), "xmlHttpResponse2Value");
  assert.equal(pascalCase("version2-api"), "Version2Api");
  assert.throws(() => includesText("value", "v", { caseSensitive: /** @type {any} */ ("yes") }), TypeError);
});

test("literal and regular-expression replacements have separate contracts", () => {
  const pattern = /a./g;
  pattern.lastIndex = 2;
  assert.equal(replaceMany("a.b + a.b", { "a.b": "literal" }), "literal + literal");
  assert.equal(replaceRegex("ab ac", pattern, "x"), "x x");
  assert.equal(pattern.lastIndex, 2);
  assert.equal(replaceRegex("a1 b2", /([a-z])(\d)/g, (_, letter, digit) => `${digit}${letter}`), "1a 2b");
  assert.throws(() => replaceRegex("value", /** @type {any} */ ("value"), "x"), TypeError);
  assert.throws(() => replaceMany("value", /** @type {any} */ (null)), TypeError);
  assert.throws(() => replaceMany("value", new Map([["value", /** @type {any} */ (1)]])), TypeError);
});

test("utf8ByteLength matches platform UTF-8 encoding without allocating it", () => {
  const values = ["", "ASCII", "A\u00e9\ud83d\ude42", "\ud800", "\udc00", "\ud800A", "A\udc00", "\u0000"];
  for (const value of values) {
    assert.equal(utf8ByteLength(value), new TextEncoder().encode(value).byteLength);
  }
  assert.equal(utf8ByteLength("A\u00e9\ud83d\ude42"), 7);
  assert.throws(() => utf8ByteLength(/** @type {any} */ (1)), TypeError);
});

test("countWords explicitly counts Unicode-whitespace-delimited runs", () => {
  assert.equal(countWords(""), 0);
  assert.equal(countWords(" \n\t\u00a0 "), 0);
  assert.equal(countWords("one\ttwo\nthree"), 3);
  assert.equal(countWords("hello-world ... \ud83d\ude42"), 3);
  assert.throws(() => countWords(/** @type {any} */ (null)), TypeError);
});

test("slug and filename helpers normalize unsafe cross-platform names", () => {
  assert.equal(slugify("Cr\u00e8me br\u00fbl\u00e9e / API v2"), "creme-brulee-api-v2");
  assert.equal(slugify("***", { fallback: "Fallback Item" }), "fallback-item");
  assert.equal(safeFilename("CON"), "file-con");
  assert.equal(safeFilename(" report.\u0000. "), "report");
  assert.equal(safeFilename("***", { fallback: "NUL" }), "file-nul");
  assert.equal(safeFilename("abcdefgh", { maximumLength: 5 }), "abcde");
  assert.equal(escapeHtml('<script src="x">&</script>'), "&lt;script src=&quot;x&quot;&gt;&amp;&lt;/script&gt;");
  assert.equal(escapeHtml("javascript:alert(1)"), "javascript:alert(1)", "text escaping is intentionally not URL sanitization");
  assert.equal(escapeHtml("&lt;already encoded&gt;"), "&amp;lt;already encoded&amp;gt;");
});

test("stableJson orders strict plain JSON without invoking active properties", () => {
  const shared = { z: 2, a: 1 };
  assert.equal(
    stableJson({ z: shared, a: [true, null, "text"], duplicate: shared }),
    '{"a":[true,null,"text"],"duplicate":{"a":1,"z":2},"z":{"a":1,"z":2}}',
  );
  assert.equal(stableJson(runInNewContext("({ z: 2, a: 1 })")), '{"a":1,"z":2}');
  assert.equal(stableJson({ nested: { b: 2, a: 1 } }), stableJson({ nested: { a: 1, b: 2 } }));

  let getterCalls = 0;
  const active = Object.defineProperty({}, "secret", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "value";
    },
  });
  assert.throws(() => stableJson(active), TypeError);
  assert.equal(getterCalls, 0);
});

test("stableJson rejects non-JSON shapes, cycles, sparse arrays, and excessive work", () => {
  const circular = {};
  circular.self = circular;
  const customArray = [1];
  customArray.extra = true;
  const symbolObject = { [Symbol("private")]: true };

  for (const value of [
    circular,
    [, 1],
    customArray,
    symbolObject,
    { missing: undefined },
    { invalid: Number.NaN },
    new Date(),
  ]) {
    assert.throws(() => stableJson(value), TypeError);
  }
  assert.throws(() => stableJson({ nested: {} }, { maximumDepth: 0 }), RangeError);
  assert.throws(() => stableJson([1, 2], { maximumNodes: 2 }), RangeError);
  assert.throws(() => stableJson("escaped\ntext", { maximumLength: 5 }), RangeError);
  assert.throws(() => stableJson({}, /** @type {any} */ ([])), TypeError);
});
