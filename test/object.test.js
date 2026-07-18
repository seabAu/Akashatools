import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";

import {
  cloneJson,
  deepClone,
  deepMerge,
  deepQuery,
  findAllDeep,
  findAllDeepMatches,
  findAllDeepParents,
  findAllDeepValues,
  findDeep,
  findDeepMatch,
  findDeepParent,
  findDeepValue,
  getAtJsonPointer,
  getAtPath,
  hasAtJsonPointer,
  hasAtPath,
  hasDeep,
  isPlainObject,
  parseJsonPointer,
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

test("JSON Pointer parsing preserves RFC 6901 root and escape semantics", () => {
  assert.deepEqual(parseJsonPointer(""), []);
  assert.deepEqual(parseJsonPointer("/profile/a~1b/m~0n/"), ["profile", "a/b", "m~n", ""]);
  assert.deepEqual(parseJsonPointer("/~01"), ["~1"]);
  assert.throws(() => parseJsonPointer("profile/name"), TypeError);
  assert.throws(() => parseJsonPointer("#/profile"), TypeError);
  assert.throws(() => parseJsonPointer("/bad~2escape"), TypeError);
  assert.throws(() => parseJsonPointer("/bad~"), TypeError);
  assert.throws(() => parseJsonPointer("/__proto__/polluted"), TypeError);
  assert.throws(() => parseJsonPointer("/constructor/prototype"), TypeError);
  assert.throws(() => parseJsonPointer("/" + "a".repeat(10_000)), RangeError);
  assert.throws(() => parseJsonPointer("/" + Array.from({ length: 101 }, () => "a").join("/")), RangeError);
});

test("JSON Pointer reads own plain-data properties and canonical array indices", () => {
  const source = {
    "a/b": { "m~n": true },
    users: [{ name: "Ember" }, undefined],
    value: undefined,
    "": "empty key",
  };
  assert.equal(getAtJsonPointer(source, ""), source);
  assert.equal(hasAtJsonPointer(undefined, ""), true);
  assert.equal(getAtJsonPointer(source, "/a~1b/m~0n"), true);
  assert.equal(getAtJsonPointer(source, "/users/0/name"), "Ember");
  assert.equal(getAtJsonPointer(source, "/users/1", "fallback"), undefined);
  assert.equal(hasAtJsonPointer(source, "/users/1"), true);
  assert.equal(getAtJsonPointer(source, "/", "fallback"), "empty key");
  assert.equal(getAtJsonPointer(source, "/missing", "fallback"), "fallback");
  assert.equal(hasAtJsonPointer(source, "/value"), true);
  assert.equal(hasAtJsonPointer(source, "/users/01"), false);
  assert.equal(hasAtJsonPointer(source, "/users/-"), false);
  assert.equal(hasAtJsonPointer(source, "/users/2"), false);
});

test("JSON Pointer traversal rejects active properties without invoking them", () => {
  let calls = 0;
  const active = Object.defineProperty({}, "computed", {
    enumerable: true,
    get() {
      calls += 1;
      return { value: true };
    },
  });
  assert.throws(() => getAtJsonPointer(active, "/computed/value"), TypeError);
  assert.equal(calls, 0);

  const inherited = runInNewContext("Object.prototype.hidden = true; ({ own: { visible: true } })");
  assert.equal(hasAtJsonPointer(inherited, "/hidden"), false);
  assert.equal(hasAtJsonPointer(inherited, "/own/visible"), true);
  assert.equal(hasAtJsonPointer(new Date(), "/getTime"), false);

  const sparse = [];
  sparse.length = 1;
  assert.equal(hasAtJsonPointer(sparse, "/0"), false);
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
  assert.throws(() => traverseObject(source, /** @type {any} */ ([])), /plain object/);
  assert.throws(() => findDeep(source, /** @type {any} */ (null)), TypeError);
});

test("deep predicate collection preserves preorder and bounds match output", () => {
  const source = { first: { id: 1 }, second: [{ id: 2 }, { other: 3 }] };
  assert.deepEqual(
    findAllDeep(source, ({ key }) => key === "id").map(({ path }) => path),
    [
      ["first", "id"],
      ["second", 0, "id"],
    ],
  );
  assert.throws(() => findAllDeep(source, ({ key }) => key === "id", { maxMatches: 1 }), /maxMatches/);
  assert.throws(() => findAllDeep(source, () => true, { maxMatches: 0 }), /positive safe integer/);
  assert.throws(() => findAllDeep(source, /** @type {any} */ (null)), /predicate/);
});

test("deep needle search has explicit match and projection return shapes", () => {
  const source = {
    status: "READY",
    nested: { status: "ready", value: 1 },
    items: [{ id: 1 }, { id: 2 }],
  };

  assert.equal(hasDeep(source, "status", { by: "key" }), true);
  assert.equal(hasDeep(source, "missing", { by: "either" }), false);
  assert.deepEqual(findDeepMatch(source, 2)?.path, ["items", 1, "id"]);
  assert.equal(findDeepValue(source, "id", { by: "key" }), 1);
  assert.equal(findDeepParent(source, 2), source.items[1]);
  assert.deepEqual(findAllDeepValues(source, "status", { by: "key" }), ["READY", "ready"]);
  assert.deepEqual(findAllDeepParents(source, "id", { by: "key" }), [source.items[0], source.items[1]]);
  assert.deepEqual(
    findAllDeepMatches(source, "ready", {
      equals: (actual, needle) =>
        typeof actual === "string" && typeof needle === "string" && actual.toLowerCase() === needle.toLowerCase(),
    }).map(({ path }) => path),
    [["status"], ["nested", "status"]],
  );

  assert.equal(findDeepMatch(source, source, { includeRoot: true })?.parent, undefined);
  assert.equal(findDeepValue(source, "missing"), undefined);
  assert.equal(findDeepParent(source, "missing"), undefined);
  assert.throws(() => hasDeep(source, 1, { by: "property" }), /by must/);
  assert.throws(() => hasDeep(source, 1, { equals: true }), /equals must/);
  assert.throws(() => findAllDeepMatches({ one: 1, two: 1 }, 1, { maxMatches: 1 }), /maxMatches/);
});

test("deepQuery provides frozen dot syntax without prototype mutation", () => {
  const originalObjectHas = Reflect.get(Object.prototype, "has");
  const originalArrayHas = Reflect.get(Array.prototype, "has");
  const source = { user: { id: 1, active: false }, rows: [{ id: 2 }] };
  const query = deepQuery(source, { maxDepth: 1 });

  assert.equal(Object.isFrozen(query), true);
  assert.equal(query.unwrap(), source);
  assert.equal(query.has("user", { by: "key" }), true);
  assert.equal(query.has("active", { by: "key" }), false);
  assert.equal(query.has("active", { by: "key", maxDepth: 2 }), true);
  assert.deepEqual(query.first(2, { maxDepth: 3 })?.path, ["rows", 0, "id"]);
  assert.equal(query.value("active", { by: "key", maxDepth: 2 }), false);
  assert.equal(query.parent(false, { maxDepth: 2 }), source.user);
  assert.deepEqual(query.values("id", { by: "key", maxDepth: 3 }), [1, 2]);
  assert.deepEqual(query.parents("id", { by: "key", maxDepth: 3 }), [source.user, source.rows[0]]);
  assert.equal(query.all(1, { maxDepth: 3 }).length, 1);
  assert.deepEqual(query.where(({ key }) => key === "active", { maxDepth: 2 })?.path, ["user", "active"]);
  assert.equal(query.allWhere(({ key }) => key === "id", { maxDepth: 3 }).length, 2);
  assert.equal(Reflect.get(Object.prototype, "has"), originalObjectHas);
  assert.equal(Reflect.get(Array.prototype, "has"), originalArrayHas);
  assert.throws(() => deepQuery(source, /** @type {any} */ ([])), /plain object/);
  assert.throws(() => query.has(1, /** @type {any} */ ([])), /plain object/);
});

test("deep needle searches retain cycle and accessor safety", () => {
  let getterCalls = 0;
  const source = { nested: { value: 1 } };
  source.self = source;
  Object.defineProperty(source.nested, "computed", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "unsafe";
    },
  });

  assert.deepEqual(findAllDeepValues(source, "value", { by: "key" }), [1]);
  assert.equal(hasDeep(source, "unsafe"), false);
  assert.equal(getterCalls, 0);
  assert.throws(() => hasDeep(source, "missing", { maxNodes: 1 }), /maxNodes/);
});
