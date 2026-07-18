import assert from "node:assert/strict";
import test from "node:test";

import { excludeBy, excludeIds, jaccardSimilarity, upsertBy, upsertById } from "akashatools/collection";

test("Jaccard similarity compares distinct iterable values with explicit empty semantics", () => {
  assert.equal(jaccardSimilarity(new Set(["a", "b"]), new Set(["b", "c"])), 1 / 3);
  assert.equal(jaccardSimilarity([1, 1, 2], [2, 2, 3]), 1 / 3);
  assert.equal(jaccardSimilarity("ab", "bc"), 1 / 3);
  assert.equal(jaccardSimilarity([], []), 1);
  assert.equal(jaccardSimilarity([], [1]), 0);

  const shared = {};
  assert.equal(jaccardSimilarity([shared, NaN, -0], [shared, NaN, 0]), 1);
  assert.equal(jaccardSimilarity([{}], [{}]), 0);
});

test("Jaccard similarity consumes iterables once and bounds yielded work", () => {
  let iterations = 0;
  let iteratorReads = 0;
  const iterable = {
    get [Symbol.iterator]() {
      iteratorReads += 1;
      return function* iterate() {
        iterations += 1;
        yield 1;
        yield 2;
      };
    },
  };

  assert.equal(jaccardSimilarity(iterable, iterable), 1);
  assert.equal(iterations, 2);
  assert.equal(iteratorReads, 2);
  assert.equal(jaccardSimilarity([], [], { maximumItems: 0 }), 1);

  let closed = false;
  function* excessive() {
    try {
      yield 1;
      yield 2;
    } finally {
      closed = true;
    }
  }

  assert.throws(() => jaccardSimilarity(excessive(), [], { maximumItems: 1 }), RangeError);
  assert.equal(closed, true);
  assert.throws(() => jaccardSimilarity([1], [2], { maximumItems: 1 }), RangeError);
});

test("Jaccard similarity rejects ambiguous input and option contracts", () => {
  assert.throws(() => jaccardSimilarity(/** @type {any} */ (null), []), TypeError);
  assert.throws(() => jaccardSimilarity([], /** @type {any} */ ({})), TypeError);
  assert.throws(() => jaccardSimilarity([], [], /** @type {any} */ ([])), TypeError);
  assert.throws(() => jaccardSimilarity([], [], { maximumItems: -1 }), RangeError);
  assert.throws(() => jaccardSimilarity([], [], { maximumItems: 1.5 }), RangeError);
});

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
