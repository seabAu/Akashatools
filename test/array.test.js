import assert from "node:assert/strict";
import test from "node:test";

import {
  asArray,
  binarySearch,
  chunk,
  compact,
  countBy,
  flatten,
  groupBy,
  insertItem,
  intersection,
  keyBy,
  lowerBound,
  moveItem,
  partition,
  range,
  removeFromArray,
  shuffle,
  unique,
  upperBound,
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
  assert.deepEqual(
    removeFromArray([1, 2, 3, 4], (value) => value % 2 === 0, { all: true }),
    [1, 3],
  );
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
  assert.deepEqual(
    removeFromArray(sparse, (value, index) => {
      visited.push([value, index]);
      return false;
    }),
    ["a", undefined, "c"],
  );
  assert.deepEqual(visited, [
    ["a", 0],
    [undefined, 1],
    ["c", 2],
  ]);
});

test("array movement and removal options reject invalid contracts", () => {
  const source = [1, 2];
  assert.notEqual(moveItem(source, 0, 0), source);
  assert.throws(() => asArray(null, /** @type {any} */ ("fallback")), TypeError);
  assert.throws(() => insertItem([], 0.5, "x"), TypeError);
  assert.throws(() => removeFromArray([1], 1, /** @type {any} */ ("options")), TypeError);
  assert.throws(() => removeFromArray([1], 1, /** @type {any} */ (null)), TypeError);
  assert.throws(() => removeFromArray([1], 1, { mode: /** @type {any} */ ("unknown") }), TypeError);
  assert.throws(() => removeFromArray([1], 1, { all: /** @type {any} */ ("yes") }), TypeError);
});

test("array set, grouping, range, zip, and shuffle helpers are deterministic", () => {
  assert.deepEqual(
    unique([{ id: 1 }, { id: 1 }, { id: 2 }], ({ id }) => id).map(({ id }) => id),
    [1, 2],
  );
  assert.deepEqual(intersection([1, 1, 2, 3], [3, 2], [2, 4]), [2]);
  assert.deepEqual(range(4), [0, 1, 2, 3]);
  assert.deepEqual(range(4, 0, -2), [4, 2]);
  assert.deepEqual(zip([1, 2], ["a", "b", "c"]), [
    [1, "a"],
    [2, "b"],
  ]);
  assert.deepEqual(groupBy([1, 2, 3], (value) => value % 2).get(1), [1, 3]);
  assert.deepEqual(
    shuffle([1, 2, 3], () => 0),
    [2, 3, 1],
  );
});

test("countBy preserves key identity and treats sparse slots as undefined", () => {
  const objectKey = {};
  const sparse = [objectKey, , objectKey, undefined];
  const counts = countBy(sparse);

  assert.deepEqual(
    [...counts.entries()],
    [
      [objectKey, 2],
      [undefined, 2],
    ],
  );
  assert.deepEqual(
    [...countBy(["one", "two", "four"], (value) => value.length).entries()],
    [
      [3, 2],
      [4, 1],
    ],
  );
});

test("keyBy preserves key identity and makes duplicate policy explicit", () => {
  const objectKey = {};
  const symbolKey = Symbol("record");
  const records = [
    { key: objectKey, value: "object" },
    { key: symbolKey, value: "first" },
    { key: symbolKey, value: "last" },
    { key: 1, value: "number" },
    { key: "1", value: "string" },
  ];

  const last = keyBy(records, ({ key }) => key);
  assert.equal(last.get(objectKey)?.value, "object");
  assert.equal(last.get(symbolKey)?.value, "last");
  assert.equal(last.get(1)?.value, "number");
  assert.equal(last.get("1")?.value, "string");

  const first = keyBy(records, ({ key }) => key, { onDuplicate: "first" });
  assert.equal(first.get(symbolKey)?.value, "first");
  assert.throws(() => keyBy(records, ({ key }) => key, { onDuplicate: "error" }), RangeError);
});

test("keyBy uses the dense callback contract and rejects invalid options", () => {
  const sparse = ["a", , "c"];
  /** @type {Array<[unknown, number, readonly unknown[]]>} */
  const calls = [];
  const index = keyBy(sparse, (value, itemIndex, values) => {
    calls.push([value, itemIndex, values]);
    return itemIndex;
  });

  assert.deepEqual([...index.values()], ["a", undefined, "c"]);
  assert.equal(calls.length, 3);
  assert.equal(calls[0][2], calls[1][2]);
  assert.deepEqual(calls[0][2], ["a", undefined, "c"]);
  assert.equal(1 in sparse, false);
  assert.throws(() => keyBy([], /** @type {any} */ (null)), TypeError);
  assert.throws(() => keyBy([], () => 1, /** @type {any} */ (null)), TypeError);
  assert.throws(() => keyBy([], () => 1, /** @type {any} */ ([])), TypeError);
  assert.throws(() => keyBy([], () => 1, { onDuplicate: /** @type {any} */ ("merge") }), TypeError);
});

test("binary-search bounds find duplicate ranges and absent insertion points", () => {
  const values = [1, 2, 2, 2, 4, 8];
  assert.equal(lowerBound(values, 2), 1);
  assert.equal(upperBound(values, 2), 4);
  assert.equal(binarySearch(values, 2), 1);
  assert.equal(lowerBound(values, 3), 4);
  assert.equal(upperBound(values, 3), 4);
  assert.equal(binarySearch(values, 3), -1);
  assert.equal(lowerBound([], 1), 0);
  assert.equal(upperBound(values, 10), values.length);
});

test("binary-search functions support heterogeneous needles and logarithmic work", () => {
  const values = Array.from({ length: 1_024 }, (_, id) => ({ id }));
  let comparisons = 0;
  const compare = (value, id) => {
    comparisons += 1;
    return value.id - id;
  };

  assert.equal(binarySearch(values, 513, compare), 513);
  assert.ok(comparisons <= 12);
  assert.equal(lowerBound(values, 512.5, compare), 513);
  assert.equal(upperBound(values, 512.5, compare), 513);
});

test("binary-search contracts reject invalid comparators and their results", () => {
  assert.throws(() => lowerBound(/** @type {any} */ (null), 1), TypeError);
  assert.throws(() => upperBound([], 1, /** @type {any} */ (null)), TypeError);
  assert.throws(() => binarySearch([1], 1, () => Number.NaN), TypeError);
  assert.throws(() => lowerBound([1], 1, () => Number.POSITIVE_INFINITY), TypeError);
  assert.throws(
    () =>
      binarySearch([1], 1, () => {
        throw new Error("comparison failed");
      }),
    /comparison failed/,
  );
});

test("partition is immutable, ordered, dense for sparse input, and fail-fast", () => {
  const sparse = [1, , 2, 3];
  /** @type {Array<[unknown, number]>} */
  const visited = [];
  const result = partition(sparse, (value, index) => {
    visited.push([value, index]);
    return typeof value === "number" && value % 2 === 1;
  });

  assert.deepEqual(result, [
    [1, 3],
    [undefined, 2],
  ]);
  assert.deepEqual(visited, [
    [1, 0],
    [undefined, 1],
    [2, 2],
    [3, 3],
  ]);
  assert.equal(1 in sparse, false);
  assert.throws(
    () =>
      partition([1], () => {
        throw new Error("predicate failed");
      }),
    /predicate failed/,
  );
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
  assert.deepEqual(groupBy(sparse, (value) => (value === undefined ? "missing" : "value")).get("missing"), [undefined]);
  assert.deepEqual(intersection([, "a"], [undefined, "b"]), [undefined]);
  assert.deepEqual(zip([, "a"], [1, 2]), [
    [undefined, 1],
    ["a", 2],
  ]);
  assert.deepEqual(
    shuffle([, "a"], () => 0),
    ["a", undefined],
  );
});

test("invalid array arguments fail visibly", () => {
  assert.throws(() => chunk([], 0), RangeError);
  assert.throws(() => moveItem([1], 2, 0), RangeError);
  assert.throws(() => range(0, 4, 0), RangeError);
  assert.deepEqual(range(0, 4, -1), []);
  assert.throws(() => range(0, 1_000_001), RangeError);
});
