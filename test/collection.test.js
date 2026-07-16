import assert from "node:assert/strict";
import test from "node:test";

import { excludeBy, excludeIds, upsertBy, upsertById } from "akashatools/collection";

test("collection helpers upsert and exclude by derived identity", () => {
  assert.deepEqual(
    upsertBy([{ key: "one", value: 1 }], { key: "one", value: 2 }, ({ key }) => key),
    [{ key: "one", value: 2 }],
  );
  assert.deepEqual(
    excludeBy([{ key: "one" }, { key: "two" }], new Set(["one"]), ({ key }) => key),
    [{ key: "two" }],
  );
  assert.deepEqual(upsertBy([1, 2], 3), [3, 1, 2]);
  assert.deepEqual(excludeBy([1, 2], new Set()), [1, 2]);
});

test("collection identity helpers keep numeric keys distinct from indices", () => {
  const source = [10, , 20];
  assert.deepEqual(
    upsertBy(source, 11, (value) => value, { prepend: false }),
    [10, undefined, 20, 11],
  );
  assert.deepEqual(
    upsertBy(source, 12, () => 10),
    [12, undefined, 20],
  );
  assert.deepEqual(
    excludeBy(source, new Set([0]), (value) => value),
    [10, undefined, 20],
  );
  assert.deepEqual(
    excludeBy(source, new Set([10]), (value) => value),
    [undefined, 20],
  );
  assert.equal(1 in source, false);
});

test("deprecated id wrappers retain their documented compatibility behavior", () => {
  const source = [
    { id: 1, value: "old" },
    { id: 2, value: "keep" },
  ];
  assert.deepEqual(upsertById(source, { id: 1, value: "new" }), [
    { id: 1, value: "new" },
    { id: 2, value: "keep" },
  ]);
  assert.deepEqual(excludeIds(source, new Set([1])), [{ id: 2, value: "keep" }]);
  assert.deepEqual(source, [
    { id: 1, value: "old" },
    { id: 2, value: "keep" },
  ]);
});

test("collection helpers reject invalid container, selector, and option contracts", () => {
  assert.throws(() => upsertBy(/** @type {any} */ ({}), 1), TypeError);
  assert.throws(() => upsertBy([], 1, /** @type {any} */ (null)), TypeError);
  assert.throws(() => upsertBy([], 1, undefined, { prepend: /** @type {any} */ ("yes") }), TypeError);
  assert.throws(() => excludeBy(/** @type {any} */ ({}), new Set()), TypeError);
  assert.throws(() => excludeBy([], /** @type {any} */ ([])), TypeError);
  assert.throws(() => excludeBy([], new Set(), /** @type {any} */ (null)), TypeError);
});
