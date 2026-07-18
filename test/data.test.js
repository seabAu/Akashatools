import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeArrayTypes,
  defaultValueFor,
  defaultValueForType,
  initializeLike,
  normalizeDataType,
} from "akashatools/data";

test("normalizeDataType unifies constructors, aliases, and collection descriptors", () => {
  class CustomType {}

  assert.equal(normalizeDataType(String), "string");
  assert.equal(normalizeDataType(CustomType), "object");
  assert.equal(normalizeDataType(" DateTime_Local "), "date");
  assert.equal(normalizeDataType("INTEGER"), "number");
  assert.equal(normalizeDataType("[String]"), "array");
  assert.equal(normalizeDataType("Object[]"), "array");
  assert.equal(normalizeDataType("Array<Object>"), "array");
  assert.equal(normalizeDataType("Custom Widget"), "customwidget");
  assert.throws(() => normalizeDataType("  "), /nonblank type string/);
  assert.throws(() => normalizeDataType(1), /type string or constructor/);
});

test("analyzeArrayTypes scans all slots and returns a frozen type distribution", () => {
  const values = [1, "two", 3, , undefined, Number.NaN];
  const analysis = analyzeArrayTypes(values);

  assert.deepEqual(analysis.types, ["number", "string", "undefined", "nan"]);
  assert.deepEqual({ ...analysis.counts }, { number: 2, string: 1, undefined: 2, nan: 1 });
  assert.equal(analysis.length, 6);
  assert.equal(analysis.empty, false);
  assert.equal(analysis.homogeneous, false);
  assert.equal(analysis.primaryType, "number");
  assert.equal(Object.isFrozen(analysis), true);
  assert.equal(Object.isFrozen(analysis.types), true);
  assert.equal(Object.isFrozen(analysis.counts), true);

  assert.deepEqual(analyzeArrayTypes([]), {
    length: 0,
    empty: true,
    homogeneous: true,
    primaryType: undefined,
    types: [],
    counts: Object.create(null),
  });
  assert.throws(() => analyzeArrayTypes({}), /must be an array/);
});

test("defaultValueForType returns fresh defaults without losing falsy values", async () => {
  assert.equal(defaultValueForType(Boolean), false);
  assert.equal(defaultValueForType("number"), 0);
  assert.equal(defaultValueForType("bigint"), 0n);
  assert.equal(defaultValueForType("string"), "");
  assert.equal(defaultValueForType("null"), null);
  assert.equal(defaultValueForType("void"), undefined);
  assert.equal(defaultValueForType("nan"), 0);
  assert.equal(typeof defaultValueForType("symbol"), "symbol");
  assert.equal(defaultValueForType("function")(), undefined);
  assert.deepEqual(defaultValueForType(Array), []);
  assert.deepEqual(defaultValueForType(Object), {});
  assert.deepEqual([...defaultValueForType(Map)], []);
  assert.deepEqual([...defaultValueForType(Set)], []);
  assert.equal(await defaultValueForType(Promise), undefined);
  assert.equal(defaultValueForType(Date).getTime(), 0);
  assert.equal(defaultValueForType("date", { date: "now" }) instanceof Date, true);
  assert.equal(defaultValueForType(Uint8Array) instanceof Uint8Array, true);
  assert.equal(defaultValueForType(Uint8Array).length, 0);

  const first = defaultValueForType(Array);
  const second = defaultValueForType(Array);
  assert.notEqual(first, second);
});

test("default factories support canonical types and exact custom constructors", () => {
  class Identifier {}
  const factories = new Map([
    [Identifier, () => new Identifier()],
    ["boolean", () => 0],
  ]);

  assert.equal(defaultValueForType(Identifier, { factories }) instanceof Identifier, true);
  assert.equal(defaultValueForType(Boolean, { factories }), 0);
  assert.equal(defaultValueForType("unknown", { unsupported: "undefined" }), undefined);
  assert.throws(() => defaultValueForType("unknown"), /No default value/);
  assert.throws(() => defaultValueForType("date", { date: "today" }), /date must/);
  assert.throws(() => defaultValueForType("date", { unsupported: "skip" }), /unsupported must/);
  assert.throws(() => defaultValueForType("date", { factories: { date: 1 } }), /plain object of functions/);
});

test("defaultValueFor selects defaults from runtime values", () => {
  assert.deepEqual(defaultValueFor({ populated: true }), {});
  assert.deepEqual(defaultValueFor([1, 2]), []);
  assert.equal(defaultValueFor(false), false);
  assert.equal(defaultValueFor(new Date(123)).getTime(), 0);
});

test("initializeLike creates an initialized plain-data shape", () => {
  const source = {
    name: "Ada",
    count: 3,
    active: true,
    missing: null,
    created: new Date(123),
    nested: { label: "value" },
    rows: [{ id: 1 }, { id: 2 }],
  };

  assert.deepEqual(initializeLike(source), {
    name: "",
    count: 0,
    active: false,
    missing: null,
    created: new Date(0),
    nested: { label: "" },
    rows: [],
  });
  assert.deepEqual(source.rows, [{ id: 1 }, { id: 2 }]);
  assert.deepEqual(initializeLike(source, { arrays: "sample" }).rows, [{ id: 0 }]);
  assert.deepEqual(initializeLike(source, { arrays: "items" }).rows, [{ id: 0 }, { id: 0 }]);
  assert.deepEqual(initializeLike(source, { objects: "empty" }), {});
});

test("initializeLike preserves null prototypes and recreates cycles", () => {
  const source = Object.create(null);
  source.value = "text";
  source.self = source;

  const initialized = initializeLike(source);
  assert.equal(Object.getPrototypeOf(initialized), null);
  assert.equal(initialized.value, "");
  assert.equal(initialized.self, initialized);
});

test("initializeLike rejects unsafe active properties and enforces work bounds", () => {
  let getterCalls = 0;
  const accessor = {};
  Object.defineProperty(accessor, "active", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return true;
    },
  });
  assert.throws(() => initializeLike(accessor), /accessors/);
  assert.equal(getterCalls, 0);

  const unsafe = {};
  Object.defineProperty(unsafe, "__proto__", { enumerable: true, value: {}, writable: true });
  assert.throws(() => initializeLike(unsafe), /Unsafe property/);

  const symbolData = { [Symbol("field")]: true };
  assert.throws(() => initializeLike(symbolData), /symbol properties/);

  const customArray = [];
  customArray.label = "unsafe";
  assert.throws(() => initializeLike(customArray, { arrays: "items" }), /custom enumerable/);
  assert.throws(() => initializeLike({ nested: { value: 1 } }, { maxDepth: 1 }), /maxDepth/);
  assert.throws(() => initializeLike({ one: 1, two: 2 }, { maxNodes: 2 }), /maxNodes/);
  assert.throws(() => initializeLike({}, { arrays: "all" }), /arrays must/);
  assert.throws(() => initializeLike({}, { objects: "keys" }), /objects must/);
});
