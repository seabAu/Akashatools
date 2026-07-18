import assert from "node:assert/strict";
import test from "node:test";

import {
  controlTypeForType,
  controlTypeForValue,
  fieldDescriptorFor,
  fieldsFromData,
  inputTypeForType,
  inputTypeForValue,
} from "akashatools/input";

test("inputTypeForType separates scalar HTML inputs from composite controls", () => {
  assert.equal(inputTypeForType(String), "text");
  assert.equal(inputTypeForType(Number), "number");
  assert.equal(inputTypeForType(Boolean), "checkbox");
  assert.equal(inputTypeForType(Date), "datetime-local");
  assert.equal(inputTypeForType("date"), "date");
  assert.equal(inputTypeForType("DateTimeLocal"), "datetime-local");
  assert.equal(inputTypeForType("ObjectId"), "text");
  assert.equal(inputTypeForType("phone"), "tel");
  assert.equal(inputTypeForType("email"), "email");
  assert.equal(inputTypeForType(Array), undefined);
  assert.equal(inputTypeForType(Object), undefined);
});

test("input type options provide explicit dates, overrides, and fallback policies", () => {
  assert.equal(inputTypeForType(Date, { dateType: "date" }), "date");
  assert.equal(inputTypeForType(Boolean, { overrides: { boolean: "radio" } }), "radio");
  assert.equal(inputTypeForType("ObjectId", { overrides: { objectid: undefined } }), undefined);
  assert.equal(inputTypeForType("custom", { unsupported: "text" }), "text");
  assert.throws(() => inputTypeForType("custom", { unsupported: "throw" }), /No native input type/);
  assert.throws(() => inputTypeForType("date", { dateType: "local" }), /dateType must/);
  assert.throws(() => inputTypeForType("date", { unsupported: "skip" }), /unsupported must/);
  assert.throws(() => inputTypeForType("date", { overrides: new Map() }), /plain object/);

  const overrides = {};
  Object.defineProperty(overrides, "date", { enumerable: true, get: () => "text" });
  assert.throws(() => inputTypeForType("date", { overrides }), /accessors/);
});

test("inputTypeForValue uses runtime types without coercing string contents", () => {
  assert.equal(inputTypeForValue("false"), "text");
  assert.equal(inputTypeForValue("42"), "text");
  assert.equal(inputTypeForValue(false), "checkbox");
  assert.equal(inputTypeForValue(42), "number");
  assert.equal(inputTypeForValue(new Date()), "datetime-local");
  assert.equal(inputTypeForValue(new URL("https://example.com")), "url");
  assert.equal(inputTypeForValue(null), undefined);
});

test("control classification distinguishes declared composites and scalar inputs", () => {
  assert.equal(controlTypeForType(Array), "array");
  assert.equal(controlTypeForType(Object), "object");
  assert.equal(controlTypeForType(Map), "map");
  assert.equal(controlTypeForType(Set), "set");
  assert.equal(controlTypeForType(String), "input");
  assert.equal(controlTypeForType(Function), "unsupported");
  assert.equal(controlTypeForType(Function, { unsupported: "text" }), "input");
  assert.throws(() => controlTypeForType(Array, { unsupported: "skip" }), /unsupported must/);
});

test("controlTypeForValue scans complete arrays instead of trusting item zero", () => {
  assert.equal(controlTypeForValue([]), "array");
  assert.equal(controlTypeForValue([1, 2]), "scalar-array");
  assert.equal(controlTypeForValue([{ id: 1 }, { id: 2 }]), "object-array");
  assert.equal(controlTypeForValue([[1], [2]]), "nested-array");
  assert.equal(controlTypeForValue([1, { id: 2 }]), "mixed-array");
  assert.equal(controlTypeForValue({ id: 1 }), "object");
  assert.equal(controlTypeForValue(new Map()), "map");
  assert.equal(controlTypeForValue(new Set()), "set");
  assert.throws(() => controlTypeForValue([], { dateType: "local" }), /dateType must/);
});

test("fieldDescriptorFor preserves falsy defaults and exposes atomic inference", () => {
  const descriptor = fieldDescriptorFor("active", false);
  assert.deepEqual(descriptor, {
    name: "active",
    label: "active",
    path: ["active"],
    dataType: "boolean",
    inputType: "checkbox",
    controlType: "input",
    defaultValue: false,
    arrayAnalysis: undefined,
  });
  assert.equal(Object.isFrozen(descriptor), true);
  assert.equal(Object.isFrozen(descriptor.path), true);

  const overridden = fieldDescriptorFor("count", 7, {
    defaultValue: 0,
    label: "Count",
    path: ["stats", "count"],
  });
  assert.equal(overridden.defaultValue, 0);
  assert.equal(overridden.label, "Count");
  assert.deepEqual(overridden.path, ["stats", "count"]);

  const rows = fieldDescriptorFor("rows", [{ id: 1 }]);
  assert.equal(rows.controlType, "object-array");
  assert.deepEqual(rows.arrayAnalysis?.types, ["object"]);
  assert.throws(() => fieldDescriptorFor("", 1), /nonblank/);
  assert.throws(() => fieldDescriptorFor("constructor", 1), /Unsafe field name/);
  assert.throws(() => fieldDescriptorFor("value", 1, { label: 2 }), /label must/);
  assert.throws(() => fieldDescriptorFor("value", 1, { path: ["prototype"] }), /safe/);
});

test("fieldsFromData builds frozen ordered descriptors for objects and arrays", () => {
  const fields = fieldsFromData(
    { name: "Ada", count: 0, active: false, rows: [{ id: 1 }] },
    {
      labelFor: (name) => name.toUpperCase(),
      path: ["profile"],
    },
  );

  assert.deepEqual(
    fields.map(({ name, label, path, inputType, controlType, defaultValue }) => ({
      name,
      label,
      path,
      inputType,
      controlType,
      defaultValue,
    })),
    [
      {
        name: "name",
        label: "NAME",
        path: ["profile", "name"],
        inputType: "text",
        controlType: "input",
        defaultValue: "Ada",
      },
      {
        name: "count",
        label: "COUNT",
        path: ["profile", "count"],
        inputType: "number",
        controlType: "input",
        defaultValue: 0,
      },
      {
        name: "active",
        label: "ACTIVE",
        path: ["profile", "active"],
        inputType: "checkbox",
        controlType: "input",
        defaultValue: false,
      },
      {
        name: "rows",
        label: "ROWS",
        path: ["profile", "rows"],
        inputType: undefined,
        controlType: "object-array",
        defaultValue: [{ id: 1 }],
      },
    ],
  );
  assert.equal(Object.isFrozen(fields), true);

  const sparse = [];
  sparse.length = 2;
  sparse[1] = "value";
  const arrayFields = fieldsFromData(sparse);
  assert.deepEqual(
    arrayFields.map(({ name, path, defaultValue }) => ({ name, path, defaultValue })),
    [
      { name: "0", path: [0], defaultValue: undefined },
      { name: "1", path: [1], defaultValue: "value" },
    ],
  );
});

test("fieldsFromData rejects active/unsafe properties and excessive output", () => {
  let getterCalls = 0;
  const accessor = {};
  Object.defineProperty(accessor, "name", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "Ada";
    },
  });
  assert.throws(() => fieldsFromData(accessor), /accessors/);
  assert.equal(getterCalls, 0);

  assert.throws(() => fieldsFromData({ [Symbol("name")]: "Ada" }), /symbol properties/);
  const unsafe = {};
  Object.defineProperty(unsafe, "__proto__", { enumerable: true, value: "unsafe" });
  assert.throws(() => fieldsFromData(unsafe), /Unsafe field name/);

  const customArray = [];
  customArray.label = "custom";
  assert.throws(() => fieldsFromData(customArray), /custom enumerable/);
  assert.throws(() => fieldsFromData({ one: 1 }, { maximumFields: 0 }), /maximumFields/);
  assert.throws(() => fieldsFromData({ one: 1 }, { maximumFields: -1 }), /non-negative/);
  assert.throws(() => fieldsFromData({ one: 1 }, { labelFor: () => 1 }), /return a string/);
  assert.throws(() => fieldsFromData(null), /plain object or array/);
});
