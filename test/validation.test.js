import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";

import { DATA_TYPES } from "akashatools/data";
import {
  assertJsonContract,
  defaultIfBlank,
  formatNanpPhone,
  isArray,
  isBlank,
  isBlob,
  isBoolean,
  isDefined,
  isEmail,
  isEmpty,
  isFile,
  isFiniteNonInteger,
  isFiniteNumber,
  isJson,
  isMap,
  isNonArrayObject,
  isNumber,
  isPlainObjectArray,
  isSafeInteger,
  isSet,
  isString,
  isTypedArray,
  normalizePortableRelativePath,
  normalizePortableRelativePaths,
  typeOf,
  validateJsonContract,
} from "akashatools/validation";

test("portable relative paths normalize separators, Unicode, and directory intent", () => {
  assert.equal(normalizePortableRelativePath("reports/2026.json"), "reports/2026.json");
  assert.equal(normalizePortableRelativePath("cafe\u0301/menu.txt"), "caf\u00e9/menu.txt");
  assert.equal(normalizePortableRelativePath("folder\\report.txt", { allowBackslash: true }), "folder/report.txt");
  assert.equal(normalizePortableRelativePath("assets", { kind: "directory" }), "assets/");
  assert.equal(normalizePortableRelativePath("assets/", { kind: "either" }), "assets/");
  assert.equal(normalizePortableRelativePath("assets", { kind: "either" }), "assets");
  assert.equal(normalizePortableRelativePath("folder\uff0ffile.txt", { normalization: "NFKC" }), "folder/file.txt");
});

test("portable relative paths reject traversal, absolute, reserved, and active-looking names", () => {
  for (const value of [
    "../secret",
    "folder/./file",
    "/absolute/file",
    "C:/drive/file",
    "//server/share",
    "folder//file",
    "folder/CON.txt",
    "folder/file. ",
    "folder/name?.txt",
    "folder/name\u202e.txt",
    "folder\\file.txt",
    "folder/",
  ]) {
    assert.throws(() => normalizePortableRelativePath(value), TypeError, value);
  }
  assert.throws(() => normalizePortableRelativePath(""), TypeError);
  assert.throws(() => normalizePortableRelativePath(/** @type {any} */ (1)), TypeError);
});

test("portable path collections reject normalized, case, and file-prefix collisions", () => {
  assert.throws(() => normalizePortableRelativePaths(["Files/A.txt", "files/a.TXT"]), RangeError);
  assert.throws(() => normalizePortableRelativePaths(["caf\u00e9.txt", "cafe\u0301.txt"]), RangeError);
  assert.throws(() => normalizePortableRelativePaths(["\uff21.txt", "A.txt"], { normalization: "NFKC" }), RangeError);
  assert.throws(() => normalizePortableRelativePaths(["folder/item.txt", "folder"], { kind: "either" }), RangeError);
  assert.throws(() => normalizePortableRelativePaths(["folder", "folder/item.txt"], { kind: "either" }), RangeError);
  assert.throws(() => normalizePortableRelativePaths(["folder/", "folder"], { kind: "either" }), RangeError);

  const normalized = normalizePortableRelativePaths(["Folder/", "folder/item.txt"], { kind: "either" });
  assert.deepEqual(normalized, ["Folder/", "folder/item.txt"]);
  assert.equal(Object.isFrozen(normalized), true);
  assert.deepEqual(normalizePortableRelativePaths(["Files/A.txt", "files/a.TXT"], { caseSensitive: true }), [
    "Files/A.txt",
    "files/a.TXT",
  ]);
});

test("portable path policies validate literal options and bounded dense input", () => {
  assert.throws(() => normalizePortableRelativePath("a", /** @type {any} */ ([])), TypeError);
  assert.throws(() => normalizePortableRelativePath("a", { kind: /** @type {any} */ ("link") }), TypeError);
  assert.throws(() => normalizePortableRelativePath("a", { normalization: /** @type {any} */ ("NFD") }), TypeError);
  assert.throws(() => normalizePortableRelativePath("a", { allowBackslash: /** @type {any} */ (1) }), TypeError);
  assert.throws(() => normalizePortableRelativePath("abc", { maximumLength: 2 }), RangeError);
  assert.throws(() => normalizePortableRelativePath("a/b", { maximumSegments: 1 }), RangeError);
  assert.throws(() => normalizePortableRelativePath("abc", { maximumSegmentLength: 2 }), RangeError);
  assert.throws(() => normalizePortableRelativePaths(/** @type {any} */ (null)), TypeError);
  assert.throws(() => normalizePortableRelativePaths([], { maximumPaths: 0 }), RangeError);
  assert.throws(() => normalizePortableRelativePaths(["a", "b"], { maximumPaths: 1 }), RangeError);
  assert.throws(() => normalizePortableRelativePaths([], { caseSensitive: /** @type {any} */ (1) }), TypeError);
  assert.throws(() => normalizePortableRelativePaths(["a", , "b"]), TypeError);
});

test("validation helpers distinguish blank, empty, invalid, and falsy", () => {
  const record = {};
  assert.equal(isDefined(0), true);
  assert.equal(isBlank("  "), true);
  assert.equal(isBlank(0), false);
  assert.equal(defaultIfBlank("  ", "fallback"), "fallback");
  assert.equal(defaultIfBlank(null, "fallback"), "fallback");
  assert.equal(defaultIfBlank(0, 1), 0);
  assert.equal(defaultIfBlank(false, true), false);
  assert.equal(defaultIfBlank(record, null), record);
  assert.equal(isEmpty({}), true);
  assert.equal(isEmpty(false), false);
  assert.equal(isEmpty(new Date()), false);
  const foreignCollections = runInNewContext("({ map: new Map([['key', 1]]), set: new Set([1]) })");
  assert.equal(isEmpty(foreignCollections.map), false);
  assert.equal(isEmpty(foreignCollections.set), false);
  assert.equal(typeOf(new Uint8Array()), DATA_TYPES.UINT8_ARRAY);
  assert.equal(typeOf(false), DATA_TYPES.BOOLEAN);
  assert.equal(typeOf(new Map()), DATA_TYPES.MAP);
  assert.equal(typeOf(undefined), DATA_TYPES.UNDEFINED);

  const runtimeTypeCases = [
    [null, DATA_TYPES.NULL],
    [[], DATA_TYPES.ARRAY],
    [Number.NaN, DATA_TYPES.NAN],
    [0, DATA_TYPES.NUMBER],
    ["", DATA_TYPES.STRING],
    [0n, DATA_TYPES.BIGINT],
    [Symbol("value"), DATA_TYPES.SYMBOL],
    [() => undefined, DATA_TYPES.FUNCTION],
    [{}, DATA_TYPES.OBJECT],
    [Object(false), DATA_TYPES.BOOLEAN],
    [Object(0), DATA_TYPES.NUMBER],
    [Object(""), DATA_TYPES.STRING],
    [Object(0n), DATA_TYPES.BIGINT],
    [Object(Symbol("value")), DATA_TYPES.SYMBOL],
    [new ArrayBuffer(0), DATA_TYPES.ARRAY_BUFFER],
    [new DataView(new ArrayBuffer(0)), DATA_TYPES.DATA_VIEW],
    [new Date(0), DATA_TYPES.DATE],
    [new Error("message"), DATA_TYPES.ERROR],
    [/value/u, DATA_TYPES.REGEXP],
    [new Map(), DATA_TYPES.MAP],
    [new Set(), DATA_TYPES.SET],
    [new WeakMap(), DATA_TYPES.WEAK_MAP],
    [new WeakSet(), DATA_TYPES.WEAK_SET],
    [Promise.resolve(), DATA_TYPES.PROMISE],
    [new Blob(), DATA_TYPES.BLOB],
    [new File([], "empty.txt"), DATA_TYPES.FILE],
    [new FormData(), DATA_TYPES.FORM_DATA],
    [new URL("https://example.com"), DATA_TYPES.URL],
    [new URLSearchParams(), DATA_TYPES.URL_SEARCH_PARAMS],
    [new Int8Array(), DATA_TYPES.INT8_ARRAY],
    [new Int16Array(), DATA_TYPES.INT16_ARRAY],
    [new Int32Array(), DATA_TYPES.INT32_ARRAY],
    [new Uint8Array(), DATA_TYPES.UINT8_ARRAY],
    [new Uint8ClampedArray(), DATA_TYPES.UINT8_CLAMPED_ARRAY],
    [new Uint16Array(), DATA_TYPES.UINT16_ARRAY],
    [new Uint32Array(), DATA_TYPES.UINT32_ARRAY],
    [new Float32Array(), DATA_TYPES.FLOAT32_ARRAY],
    [new Float64Array(), DATA_TYPES.FLOAT64_ARRAY],
    [new BigInt64Array(), DATA_TYPES.BIGINT64_ARRAY],
    [new BigUint64Array(), DATA_TYPES.BIGUINT64_ARRAY],
    [new SharedArrayBuffer(0), DATA_TYPES.SHARED_ARRAY_BUFFER],
  ];
  for (const [value, expected] of runtimeTypeCases) assert.equal(typeOf(value), expected);

  const customBrand = { [Symbol.toStringTag]: "AkashaRecord" };
  assert.equal(typeOf(customBrand), "akasharecord");
  assert.equal(
    typeOf(async () => undefined),
    "asyncfunction",
  );
  assert.equal(isJson("false"), true);
  assert.equal(isJson("undefined"), false);
  assert.equal(isEmail("person@example.com"), true);
  assert.equal(formatNanpPhone("+1 555 123 4567"), "(555) 123-4567");
});

test("email and NANP helpers enforce bounded syntax without identity claims", () => {
  assert.equal(isEmail("first.last+tag@example-domain.com"), true);
  assert.equal(isEmail(".first@example.com"), false);
  assert.equal(isEmail("first..last@example.com"), false);
  assert.equal(isEmail("first@-example.com"), false);
  assert.equal(isEmail(`first@${"a".repeat(64)}.com`), false);
  assert.equal(isEmail(`${"a".repeat(100_000)}@example.com`), false);
  assert.equal(formatNanpPhone("555.123.4567"), "(555) 123-4567");
  assert.equal(formatNanpPhone("call 555-123-4567"), null);
  assert.equal(formatNanpPhone("1".repeat(100_000)), null);
  assert.equal(formatNanpPhone(Number.MAX_VALUE), null);
});

test("type guards are literal, cross-realm aware, and browser-global safe", () => {
  const foreign = runInNewContext(
    "({ array: [], date: new Date(), map: new Map(), object: {}, set: new Set(), typed: new Uint16Array(2) })",
  );
  assert.equal(isArray([]), true);
  assert.equal(isArray(foreign.array), true);
  assert.equal(isArray({}), false);
  assert.equal(isString("value"), true);
  assert.equal(isString(new String("value")), false);
  assert.equal(isNumber(Number.NaN), true);
  assert.equal(isNumber(Number.POSITIVE_INFINITY), true);
  assert.equal(isNumber(new Number(1)), false);
  assert.equal(isBoolean(false), true);
  assert.equal(isBoolean(0), false);
  assert.equal(isNonArrayObject(foreign.object), true);
  assert.equal(isNonArrayObject(foreign.date), true);
  assert.equal(isNonArrayObject(foreign.map), true);
  assert.equal(isNonArrayObject([]), false);
  assert.equal(isNonArrayObject(null), false);
  assert.equal(
    isNonArrayObject(() => {}),
    false,
  );
  assert.equal(isFiniteNumber(0), true);
  assert.equal(isFiniteNumber(Number.POSITIVE_INFINITY), false);
  assert.equal(isFiniteNonInteger(1.5), true);
  assert.equal(isFiniteNonInteger(1), false);
  assert.equal(isFiniteNonInteger(Number.NaN), false);
  assert.equal(isFiniteNonInteger(Number.POSITIVE_INFINITY), false);
  assert.equal(isSafeInteger(1), true);
  assert.equal(isSafeInteger(1.5), false);
  assert.equal(isMap(foreign.map), true);
  assert.equal(isSet(foreign.set), true);
  assert.equal(isTypedArray(foreign.typed), true);
  assert.equal(isTypedArray(new DataView(new ArrayBuffer(1))), false);
  assert.equal(isPlainObjectArray([{}, Object.create(null)]), true);
  assert.equal(isPlainObjectArray([{}, new Date()]), false);
  assert.equal(isBlob(new Blob(["data"])), true);
  assert.equal(isFile(new File(["data"], "data.txt")), true);
  assert.equal(isBlob({}), false);
  assert.equal(isFile({}), false);
});

test("JSON contract validation reports paths and supports local references", () => {
  const schema = {
    definitions: { id: { type: DATA_TYPES.INTEGER } },
    type: DATA_TYPES.OBJECT,
    required: ["id", "name"],
    additionalProperties: false,
    properties: { id: { $ref: "#/definitions/id" }, name: { type: DATA_TYPES.STRING } },
  };
  assert.deepEqual(validateJsonContract({ id: 1, name: "Akasha" }, schema), []);
  assert.deepEqual(validateJsonContract({ id: "1", extra: true }, schema), [
    "$: missing name",
    "$: unexpected extra",
    "$.id: expected integer",
  ]);
  assert.equal(assertJsonContract({ id: 1, name: "Akasha" }, schema).id, 1);
  assert.throws(() => assertJsonContract({}, schema), TypeError);
});

test("JSON contract validation rejects undeclared schema behavior and non-JSON values", () => {
  assert.throws(
    () => validateJsonContract("short", { type: "string", minLength: 10 }),
    /unsupported keyword minLength/,
  );
  assert.throws(() => validateJsonContract(1, { type: "decimal" }), /unsupported JSON type/);
  assert.throws(() => validateJsonContract(1, { enum: [] }), /non-empty array/);
  assert.throws(() => validateJsonContract({}, { properties: { value: null } }), /plain schema object/);
  assert.deepEqual(validateJsonContract(new Date(), { type: "object" }), ["$: expected object"]);
  assert.deepEqual(validateJsonContract(Number.NaN, { type: "number" }), ["$: expected number"]);
  assert.deepEqual(validateJsonContract([, 1], { type: "array", items: { type: "integer" } }), [
    "$[0]: expected integer",
  ]);
  assert.equal(isJson("false"), true);
  assert.equal(isJson("null"), true);
  assert.equal(isJson("1"), true);
});
