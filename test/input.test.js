import assert from "node:assert/strict";
import test from "node:test";

import {
  controlTypeForType,
  controlTypeForValue,
  createInputValueParser,
  fieldDescriptorFor,
  fieldsFromData,
  inputTypeForType,
  inputTypeForValue,
  parseInputValue,
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

test("compiled input parsers preserve scalar meaning without loose coercion", () => {
  const parseAmount = createInputValueParser(Number);
  assert.equal(parseAmount("12.50"), 12.5);
  assert.equal(parseAmount(".25e2"), 25);
  assert.equal(parseInputValue("-4", "integer"), -4);
  assert.equal(parseInputValue("false", Boolean), false);
  assert.equal(parseInputValue(true, "checkbox"), true);
  assert.equal(parseInputValue("9007199254740993", BigInt), 9_007_199_254_740_993n);
  assert.equal(parseInputValue("", String), "");
  assert.equal(parseInputValue("", Number, { empty: "null" }), null);
  assert.equal(parseInputValue(" 12 ", Number, { trim: true }), 12);

  assert.throws(() => parseAmount("12px"), /complete finite/);
  assert.throws(() => parseAmount(""), /Empty input/);
  assert.throws(() => parseInputValue("1.5", "integer"), /safe integer/);
  assert.throws(() => parseInputValue("true ", Boolean), /Boolean input/);
  assert.throws(() => createInputValueParser(class Model {}), /Custom constructors/);
});

test("date and native temporal input parsing makes ambiguity explicit", () => {
  assert.equal(parseInputValue("2026-07-18", Date, { dateOutput: "timestamp" }), Date.UTC(2026, 6, 18));
  assert.equal(parseInputValue("2026-07-18T12:30:15.250Z", Date, { dateOutput: "string" }), "2026-07-18T12:30:15.250Z");
  assert.equal(
    parseInputValue("2026-07-18T12:30", "datetime-local", {
      dateAssumption: "utc",
      dateOutput: "timestamp",
    }),
    Date.UTC(2026, 6, 18, 12, 30),
  );
  assert.equal(parseInputValue("23:59:30.125", "time"), "23:59:30.125");
  assert.equal(parseInputValue("2024-02", "month"), "2024-02");
  assert.equal(parseInputValue("2020-W53", "week"), "2020-W53");
  assert.equal(parseInputValue("2026-07-18T12:30", Date, { dateOutput: "string" }), "2026-07-18T12:30");

  assert.throws(() => parseInputValue("2026-07-18T12:30", Date), /dateAssumption/);
  assert.throws(() => parseInputValue("2025-02-29", Date), /valid UTC/);
  assert.throws(() => parseInputValue("24:00", "time"), /Time input/);
  assert.throws(() => parseInputValue("2021-W53", "week"), /Week input/);
});

test("structured input parsers cover JSON containers and platform value types", () => {
  assert.deepEqual(parseInputValue('[1,"two",false]', Array), [1, "two", false]);
  assert.deepEqual(parseInputValue('{"active":false,"count":0}', Object), { active: false, count: 0 });
  assert.deepEqual(
    [...parseInputValue('[["one",1],["two",2]]', Map)],
    [
      ["one", 1],
      ["two", 2],
    ],
  );
  assert.deepEqual([...parseInputValue('["one","one","two"]', Set)], ["one", "two"]);
  assert.deepEqual(parseInputValue("[0,127,255]", Uint8Array), new Uint8Array([0, 127, 255]));
  assert.deepEqual([...new Uint8Array(parseInputValue("[1,2,3]", ArrayBuffer))], [1, 2, 3]);
  assert.equal(
    parseInputValue("/child", URL, { baseUrl: "https://example.com/root" }).href,
    "https://example.com/child",
  );
  assert.equal(parseInputValue("a=1&a=2", URLSearchParams).getAll("a").length, 2);
  assert.equal(parseInputValue("^item+$", RegExp, { regexpFlags: "i" }).flags, "i");
  assert.equal(parseInputValue("problem", Error).message, "problem");
});

test("structured parsing rejects lossy conversion, active data, and excess work", () => {
  assert.throws(() => parseInputValue("{}", Array), /must contain an array/);
  assert.throws(() => parseInputValue("[[1]]", Map), /two-item/);
  assert.throws(() => parseInputValue("[256]", Uint8Array), /representable range/);
  assert.throws(() => parseInputValue("[-1]", Uint8ClampedArray), /representable range/);
  assert.throws(() => parseInputValue("[1.5]", Int16Array), /must be integers/);
  assert.throws(() => parseInputValue('["18446744073709551616"]', BigUint64Array), /representable range/);
  assert.throws(() => parseInputValue("[1,2]", Array, { maximumItems: 1 }), /maximumArrayLength/);
  assert.throws(() => parseInputValue("12345", Number, { maximumLength: 4 }), /maximumLength/);

  const active = {};
  Object.defineProperty(active, "value", { enumerable: true, get: () => 1 });
  assert.throws(() => parseInputValue(active, Object), /accessors/);
});

test("non-serializable datatypes pass through only with the correct runtime brand", async () => {
  const promise = Promise.resolve(1);
  const weakMap = new WeakMap();
  const symbol = Symbol("id");
  const callback = () => 1;
  assert.equal(parseInputValue(promise, Promise), promise);
  assert.equal(parseInputValue(weakMap, WeakMap), weakMap);
  assert.equal(parseInputValue(symbol, Symbol), symbol);
  assert.equal(parseInputValue(callback, Function), callback);
  assert.equal(await parseInputValue(promise, Promise), 1);
  assert.throws(() => parseInputValue("callback", Function), /serialized reconstruction/);
  assert.throws(() => parseInputValue("id", Symbol), /serialized reconstruction/);
});

test("input parser options are validated once by the compiled factory", () => {
  assert.throws(() => createInputValueParser(Number, { empty: "zero" }), /empty must/);
  assert.throws(() => createInputValueParser(Number, { maximumLength: -1 }), /maximumLength/);
  assert.throws(() => createInputValueParser(Date, { dateOutput: "seconds" }), /dateOutput/);
  assert.throws(() => createInputValueParser(Date, { dateAssumption: "guess" }), /dateAssumption/);
  assert.throws(() => createInputValueParser(RegExp, { regexpFlags: "ii" }), /regexpFlags/);
  assert.throws(() => createInputValueParser(URL, { baseUrl: "/relative" }), /baseUrl/);
});
