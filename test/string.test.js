import assert from "node:assert/strict";
import test from "node:test";

import {
  camelCase,
  capitalize,
  escapeHtml,
  kebabCase,
  pascalCase,
  replaceMany,
  replaceRegex,
  safeFilename,
  sentenceCase,
  slugify,
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
