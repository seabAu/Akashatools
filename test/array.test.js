import assert from "node:assert/strict";
import test from "node:test";

import {
  chunk,
  compact,
  groupBy,
  insertItem,
  intersection,
  moveItem,
  range,
  removeFromArray,
  shuffle,
  unique,
  zip,
} from "akashatools/array";

test("array transforms are immutable and preserve meaningful falsy values", () => {
  const source = [0, null, false, undefined, ""];
  assert.deepEqual(compact(source), [0, false, ""]);
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(moveItem(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
  assert.deepEqual(insertItem([1, 3], 1, 2), [1, 2, 3]);
  assert.deepEqual(source, [0, null, false, undefined, ""]);
});

test("removeFromArray unifies index, value, and predicate removal", () => {
  assert.deepEqual(removeFromArray(["a", "b", "c"], 1), ["a", "c"]);
  assert.deepEqual(removeFromArray([1, 2, 1], 1, { mode: "value", all: true }), [2]);
  assert.deepEqual(removeFromArray([1, 2, 3, 4], (value) => value % 2 === 0, { all: true }), [1, 3]);
  assert.deepEqual(removeFromArray([1, 2], 10), [1, 2]);
});

test("array set, grouping, range, zip, and shuffle helpers are deterministic", () => {
  assert.deepEqual(unique([{ id: 1 }, { id: 1 }, { id: 2 }], ({ id }) => id).map(({ id }) => id), [1, 2]);
  assert.deepEqual(intersection([1, 1, 2, 3], [3, 2], [2, 4]), [2]);
  assert.deepEqual(range(4), [0, 1, 2, 3]);
  assert.deepEqual(range(4, 0, -2), [4, 2]);
  assert.deepEqual(zip([1, 2], ["a", "b", "c"]), [[1, "a"], [2, "b"]]);
  assert.deepEqual(groupBy([1, 2, 3], (value) => value % 2).get(1), [1, 3]);
  assert.deepEqual(shuffle([1, 2, 3], () => 0), [2, 3, 1]);
});

test("invalid array arguments fail visibly", () => {
  assert.throws(() => chunk([], 0), RangeError);
  assert.throws(() => moveItem([1], 2, 0), RangeError);
  assert.throws(() => range(0, 4, 0), RangeError);
  assert.deepEqual(range(0, 4, -1), []);
});
