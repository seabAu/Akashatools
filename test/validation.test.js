import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";

import {
  assertJsonContract,
  formatNanpPhone,
  isBlank,
  isBlob,
  isDefined,
  isEmail,
  isEmpty,
  isFile,
  isFiniteNumber,
  isJson,
  isMap,
  isPlainObjectArray,
  isSafeInteger,
  isSet,
  isTypedArray,
  typeOf,
  validateJsonContract,
} from "akashatools/validation";

test("validation helpers distinguish blank, empty, invalid, and falsy", () => {
  assert.equal(isDefined(0), true);
  assert.equal(isBlank("  "), true);
  assert.equal(isBlank(0), false);
  assert.equal(isEmpty({}), true);
  assert.equal(isEmpty(false), false);
  assert.equal(isEmpty(new Date()), false);
  const foreignCollections = runInNewContext("({ map: new Map([['key', 1]]), set: new Set([1]) })");
  assert.equal(isEmpty(foreignCollections.map), false);
  assert.equal(isEmpty(foreignCollections.set), false);
  assert.equal(typeOf(new Uint8Array()), "uint8array");
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
  const foreign = runInNewContext("({ map: new Map(), set: new Set(), typed: new Uint16Array(2) })");
  assert.equal(isFiniteNumber(0), true);
  assert.equal(isFiniteNumber(Number.POSITIVE_INFINITY), false);
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
    definitions: { id: { type: "integer" } },
    type: "object",
    required: ["id", "name"],
    additionalProperties: false,
    properties: { id: { $ref: "#/definitions/id" }, name: { type: "string" } },
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
