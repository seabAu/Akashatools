import assert from "node:assert/strict";
import test from "node:test";

import {
  asArray,
  chunk,
  compact,
  countBy,
  flatten,
  groupBy,
  insertItem,
  intersection,
  moveItem,
  partition,
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

test("move, insert, and removal treat sparse slots as undefined sequence items", () => {
  const sparse = ["a", , "c"];
  assert.deepEqual(moveItem(sparse, 1, 2), ["a", "c", undefined]);
  assert.deepEqual(insertItem(sparse, -10, "start"), ["start", "a", undefined, "c"]);
  assert.deepEqual(insertItem(sparse, 99, "end"), ["a", undefined, "c", "end"]);
  assert.deepEqual(removeFromArray(sparse, "missing"), ["a", undefined, "c"]);

  /** @type {Array<[unknown, number]>} */
  const visited = [];
  assert.deepEqual(removeFromArray(sparse, (value, index) => {
    visited.push([value, index]);
    return false;
  }), ["a", undefined, "c"]);
  assert.deepEqual(visited, [["a", 0], [undefined, 1], ["c", 2]]);
});

test("array movement and removal options reject invalid contracts", () => {
  const source = [1, 2];
  assert.notEqual(moveItem(source, 0, 0), source);
  assert.throws(() => insertItem([], 0.5, "x"), TypeError);
  assert.throws(() => removeFromArray([1], 1, { mode: /** @type {any} */ ("unknown") }), TypeError);
  assert.throws(() => removeFromArray([1], 1, { all: /** @type {any} */ ("yes") }), TypeError);
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

test("countBy preserves key identity and treats sparse slots as undefined", () => {
  const objectKey = {};
  const sparse = [objectKey, , objectKey, undefined];
  const counts = countBy(sparse);

  assert.deepEqual([...counts.entries()], [[objectKey, 2], [undefined, 2]]);
  assert.deepEqual([...countBy(["one", "two", "four"], (value) => value.length).entries()], [[3, 2], [4, 1]]);
});

test("partition is immutable, ordered, dense for sparse input, and fail-fast", () => {
  const sparse = [1, , 2, 3];
  /** @type {Array<[unknown, number]>} */
  const visited = [];
  const result = partition(sparse, (value, index) => {
    visited.push([value, index]);
    return typeof value === "number" && value % 2 === 1;
  });

  assert.deepEqual(result, [[1, 3], [undefined, 2]]);
  assert.deepEqual(visited, [[1, 0], [undefined, 1], [2, 2], [3, 3]]);
  assert.equal(1 in sparse, false);
  assert.throws(() => partition([1], () => { throw new Error("predicate failed"); }), /predicate failed/);
});

test("array callbacks and random sources reject invalid contracts", () => {
  assert.throws(() => countBy([1], /** @type {any} */ ("id")), TypeError);
  assert.throws(() => partition([1], /** @type {any} */ (null)), TypeError);
  assert.throws(() => shuffle([1, 2], () => 1), RangeError);
  assert.throws(() => shuffle([1, 2], () => Number.NaN), RangeError);
});

test("flatten follows native depth semantics without mutating its input", () => {
  const source = [1, [2, [3, [4]]]];
  assert.deepEqual(flatten(source), [1, 2, 3, 4]);
  assert.deepEqual(flatten(source, 1), [1, 2, [3, [4]]]);
  assert.deepEqual(flatten(source, 0), source);
  assert.notEqual(flatten(source, 0), source);
  assert.deepEqual(source, [1, [2, [3, [4]]]]);
});

test("flatten documents native sparse-slot removal and rejects invalid depth", () => {
  const sparse = [1, , [2, , 3]];
  assert.deepEqual(flatten(sparse, 1), [1, 2, 3]);
  assert.throws(() => flatten([], -1), RangeError);
  assert.throws(() => flatten([], 1.5), TypeError);
  assert.throws(() => flatten([], Number.MAX_SAFE_INTEGER + 1), TypeError);
});

test("array transforms apply the documented sparse-slot policy", () => {
  const sparse = ["a", , "c"];
  assert.equal(asArray(sparse), sparse);
  assert.equal(1 in asArray(sparse), false);
  assert.deepEqual(compact(sparse), ["a", "c"]);
  assert.deepEqual(chunk(sparse, 2), [["a", undefined], ["c"]]);
  assert.deepEqual(unique(["a", , undefined]), ["a", undefined]);
  assert.deepEqual(groupBy(sparse, (value) => value === undefined ? "missing" : "value").get("missing"), [undefined]);
  assert.deepEqual(intersection([, "a"], [undefined, "b"]), [undefined]);
  assert.deepEqual(zip([, "a"], [1, 2]), [[undefined, 1], ["a", 2]]);
  assert.deepEqual(shuffle([, "a"], () => 0), ["a", undefined]);
});

test("invalid array arguments fail visibly", () => {
  assert.throws(() => chunk([], 0), RangeError);
  assert.throws(() => moveItem([1], 2, 0), RangeError);
  assert.throws(() => range(0, 4, 0), RangeError);
  assert.deepEqual(range(0, 4, -1), []);
});
