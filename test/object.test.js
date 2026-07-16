import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";

import {
  cloneJson,
  deepClone,
  deepMerge,
  findDeep,
  getAtPath,
  hasAtPath,
  isPlainObject,
  parsePath,
  pickAllowed,
  setAtPath,
  traverseObject,
} from "akashatools/object";

test("cloneJson safely clones strict plain JSON without invoking active properties", () => {
  const shared = { nested: [true, null, "value"] };
  const source = { left: shared, right: shared };
  const clone = cloneJson(source);
  assert.deepEqual(clone, source);
  assert.notEqual(clone, source);
  assert.notEqual(clone.left, shared);
  assert.notEqual(clone.left, clone.right, "JSON cloning duplicates shared references");

  let getterCalls = 0;
  const active = Object.defineProperty({}, "computed", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return true;
    },
  });
  assert.throws(() => cloneJson(active), TypeError);
  assert.equal(getterCalls, 0);
});

test("cloneJson preserves arbitrary JSON keys without prototype mutation", () => {
  const source = JSON.parse('{"__proto__":{"polluted":true},"constructor":1,"prototype":2}');
  const clone = cloneJson(source);
  assert.deepEqual(clone, source);
  assert.equal(Object.getPrototypeOf(clone), Object.prototype);
  assert.equal(Object.hasOwn(clone, "__proto__"), true);
  assert.equal(Object.prototype.hasOwnProperty.call(Object.prototype, "polluted"), false);
  assert.equal(/** @type {any} */ ({}).polluted, undefined);
});

test("cloneJson enforces exact encoded size and structural work limits", () => {
  const source = { escaped: '"\n\\\ud800', unicode: "\u00e9\ud83d\ude42" };
  const serializedBytes = new TextEncoder().encode(JSON.stringify(source)).byteLength;
  assert.deepEqual(cloneJson(source, { maximumBytes: serializedBytes }), source);
  assert.throws(() => cloneJson(source, { maximumBytes: serializedBytes - 1 }), RangeError);
  assert.throws(() => cloneJson({ nested: {} }, { maximumDepth: 0 }), RangeError);
  assert.throws(() => cloneJson([1, 2], { maximumArrayLength: 1 }), RangeError);
  assert.throws(() => cloneJson({ one: 1, two: 2 }, { maximumKeys: 1 }), RangeError);
  assert.throws(() => cloneJson({ long: true }, { maximumKeyLength: 3 }), RangeError);
  assert.throws(() => cloneJson("long", { maximumStringLength: 3 }), RangeError);
  assert.throws(() => cloneJson([1, 2], { maximumNodes: 2 }), RangeError);

  const circular = {};
  circular.self = circular;
  const customArray = [1];
  customArray.extra = true;
  for (const invalid of [
    circular,
    [, 1],
    customArray,
    { value: undefined },
    { value: Number.NaN },
    new Date(),
    { [Symbol("key")]: true },
  ]) {
    assert.throws(() => cloneJson(invalid), TypeError);
  }
  assert.throws(() => cloneJson({}, /** @type {any} */ ([])), TypeError);
});

test("plain-object detection accepts cross-realm and null-prototype records", () => {
  assert.equal(isPlainObject(runInNewContext("({ value: 1 })")), true);
  assert.equal(isPlainObject(Object.create(null)), true);
  assert.equal(isPlainObject(new Date()), false);
});

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
  assert.throws(() => parsePath("a".repeat(10_001)), RangeError);
  assert.throws(() => parsePath(Array.from({ length: 101 }, () => "item")), RangeError);
});

test("setAtPath structurally shares untouched branches and elides identical writes", () => {
  const source = {
    profile: { name: { first: "Akasha" }, settings: { theme: "dark" } },
    unrelated: { retained: true },
  };
  const updated = setAtPath(source, "profile.name.first", "Ember");

  assert.notEqual(updated, source);
  assert.notEqual(updated.profile, source.profile);
  assert.notEqual(updated.profile.name, source.profile.name);
  assert.equal(updated.profile.settings, source.profile.settings);
  assert.equal(updated.unrelated, source.unrelated);
  assert.equal(setAtPath(source, "profile.name.first", "Akasha"), source);
});

test("nested paths and deep merge resist prototype-pollution keys", () => {
  for (const path of [
    "__proto__.polluted",
    "constructor.prototype.polluted",
    ["safe", "prototype", "polluted"],
    ["safe", "constructor", "polluted"],
    ["safe", "__proto__", "polluted"],
  ]) {
    assert.throws(() => parsePath(path), TypeError);
    assert.throws(() => setAtPath({}, path, true), TypeError);
  }

  const unsafe = JSON.parse('{"__proto__":{"polluted":true}}');
  assert.throws(() => deepMerge(unsafe, {}), TypeError);
  assert.throws(() => deepMerge({}, unsafe), TypeError);
  assert.equal(Object.prototype.hasOwnProperty.call(Object.prototype, "polluted"), false);
  assert.equal(/** @type {any} */ ({}).polluted, undefined);
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
  assert.throws(() => pickAllowed({}, /** @type {any} */ ([1])), TypeError);
  assert.throws(() => pickAllowed({}, [], { rejectUnknown: /** @type {any} */ ("no") }), TypeError);
});

test("deep merge replaces non-plain values and rejects active property semantics", () => {
  const replacement = [1, 2];
  const merged = deepMerge({ list: [0], nested: { keep: true } }, { list: replacement, nested: { date: new Date(0) } });
  assert.equal(merged.list, replacement);
  assert.equal(merged.nested.date?.getTime(), 0);
  const nullBase = Object.assign(Object.create(null), { one: 1 });
  const nullMerged = deepMerge(nullBase, { two: 2 });
  assert.equal(Object.getPrototypeOf(nullMerged), null);
  assert.deepEqual({ ...nullMerged }, { one: 1, two: 2 });

  let getterCalls = 0;
  const accessor = {};
  Object.defineProperty(accessor, "computed", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return true;
    },
  });
  assert.throws(() => deepMerge({}, accessor), TypeError);
  assert.equal(getterCalls, 0);
  assert.throws(() => deepMerge({}, { [Symbol("key")]: true }), TypeError);

  const circularBase = {};
  const circularOverride = {};
  circularBase.self = circularBase;
  circularOverride.self = circularOverride;
  assert.throws(() => deepMerge(circularBase, circularOverride), /circular/);

  const deepBase = {};
  const deepOverride = {};
  let baseCursor = deepBase;
  let overrideCursor = deepOverride;
  for (let depth = 0; depth < 102; depth += 1) {
    baseCursor.child = {};
    overrideCursor.child = {};
    baseCursor = baseCursor.child;
    overrideCursor = overrideCursor.child;
  }
  assert.throws(() => deepMerge(deepBase, deepOverride), RangeError);
});

test("object traversal returns deterministic path-aware entries", () => {
  const source = { user: { name: "Akasha" }, items: [{ id: 1 }] };
  const entries = traverseObject(source);

  assert.deepEqual(
    entries.map(({ key, path, value }) => ({ key, path, value })),
    [
      { key: "user", path: ["user"], value: source.user },
      { key: "name", path: ["user", "name"], value: "Akasha" },
      { key: "items", path: ["items"], value: source.items },
      { key: 0, path: ["items", 0], value: source.items[0] },
      { key: "id", path: ["items", 0, "id"], value: 1 },
    ],
  );
  assert.equal(entries[1].parent, source.user);
  assert.deepEqual(traverseObject(source, { includeRoot: true, maxDepth: 0 })[0].path, []);
  assert.deepEqual(findDeep(source, ({ key }) => key === "id")?.path, ["items", 0, "id"]);
});

test("object traversal is cycle-safe, bounded, and does not invoke accessors", () => {
  let getterCalls = 0;
  const source = { child: { value: 1 }, sparse: [, "present"], map: new Map([["one", 1]]) };
  Object.defineProperty(source, "computed", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "unsafe";
    },
  });
  source.self = source;

  const entries = traverseObject(source);
  assert.equal(getterCalls, 0);
  assert.equal(
    entries.some(({ key }) => key === "computed"),
    false,
  );
  assert.equal(entries.filter(({ value }) => value === source).length, 1);
  assert.equal(
    entries.some(({ path }) => path.join(".") === "map.one"),
    false,
  );
  assert.equal(
    entries.some(({ path }) => path.join(".") === "sparse.0"),
    false,
  );
  assert.deepEqual(findDeep(source, ({ value }) => value === "present")?.path, ["sparse", 1]);
  assert.throws(() => traverseObject(source, { maxNodes: 2 }), RangeError);
  assert.throws(() => traverseObject(source, { maxDepth: -1 }), RangeError);
  assert.throws(() => findDeep(source, /** @type {any} */ (null)), TypeError);
});
