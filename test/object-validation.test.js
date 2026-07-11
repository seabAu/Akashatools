import assert from "node:assert/strict";
import test from "node:test";

import {
  assertJsonContract,
  deepClone,
  deepMerge,
  formatNanpPhone,
  getAtPath,
  hasAtPath,
  isBlank,
  isDefined,
  isEmail,
  isEmpty,
  isJson,
  parsePath,
  pickAllowed,
  setAtPath,
  typeOf,
  validateJsonContract,
} from "akashatools";

test("nested paths are safe, own-property based, and immutable", () => {
  const source = { profile: { names: [{ first: "Sean" }] } };
  assert.deepEqual(parsePath("profile.names[0].first"), ["profile", "names", 0, "first"]);
  assert.equal(getAtPath(source, "profile.names[0].first"), "Sean");
  assert.equal(hasAtPath({ value: undefined }, "value"), true);

  const updated = setAtPath(source, "profile.names[0].first", "Ember");
  assert.equal(getAtPath(updated, "profile.names.0.first"), "Ember");
  assert.equal(getAtPath(source, "profile.names.0.first"), "Sean");
  assert.notEqual(updated.profile, source.profile);
  assert.throws(() => parsePath("__proto__.polluted"), TypeError);
  assert.throws(() => setAtPath({}, ["constructor", "prototype", "polluted"], true), TypeError);
});

test("deep clone and deep merge use modern safe semantics", () => {
  const source = { date: new Date("2026-07-11T00:00:00Z"), map: new Map([["one", 1]]) };
  source.self = source;
  const clone = deepClone(source);
  assert.notEqual(clone, source);
  assert.equal(clone.self, clone);
  assert.equal(clone.date.toISOString(), source.date.toISOString());
  assert.deepEqual(deepMerge({ nested: { one: 1 }, keep: true }, { nested: { two: 2 } }), {
    nested: { one: 1, two: 2 },
    keep: true,
  });
  assert.deepEqual(pickAllowed({ one: 1, two: 2 }, ["one"], { rejectUnknown: false }), { one: 1 });
});

test("validation helpers distinguish blank, empty, invalid, and falsy", () => {
  assert.equal(isDefined(0), true);
  assert.equal(isBlank("  "), true);
  assert.equal(isBlank(0), false);
  assert.equal(isEmpty({}), true);
  assert.equal(isEmpty(false), false);
  assert.equal(typeOf(new Uint8Array()), "uint8array");
  assert.equal(isJson("false"), true);
  assert.equal(isJson("undefined"), false);
  assert.equal(isEmail("person@example.com"), true);
  assert.equal(formatNanpPhone("+1 555 123 4567"), "(555) 123-4567");
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
