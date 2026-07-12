import assert from "node:assert/strict";
import test from "node:test";

import {
  createCollatorComparator,
  sortBy,
  sortByMany,
  sortByNumericOrder,
} from "akashatools/sort";

test("sorting returns stable copies and handles missing order fields", () => {
  const source = [{ name: "ten", rank: 10 }, { name: "two", rank: 2 }, { name: "none" }];
  assert.deepEqual(sortBy(source, ({ rank }) => rank).map(({ name }) => name), ["two", "ten", "none"]);
  assert.deepEqual(sortByNumericOrder([{ id: "b", order: 2 }, { id: "a", order: 1 }, { id: "x" }]).map(({ id }) => id), ["a", "b", "x"]);
  assert.equal(source[0].name, "ten");
});

test("sorting supports explicit null placement and reusable natural collators", () => {
  const collate = createCollatorComparator("en", { numeric: true, sensitivity: "base" });
  const values = ["item10", undefined, "Item2", null, "item1"];
  assert.deepEqual(sortBy(values, (value) => value, { compare: collate }), ["item1", "Item2", "item10", undefined, null]);
  assert.deepEqual(sortBy(values, (value) => value, { direction: "desc", nulls: "first", compare: collate }), [undefined, null, "item10", "Item2", "item1"]);
  assert.deepEqual(sortBy([, 2, 1], (value) => value), [1, 2, undefined]);
});

test("multi-key sorting evaluates selectors once and preserves stable ties", () => {
  const values = [
    { group: "b", rank: 1, id: "third" },
    { group: "a", rank: 2, id: "second" },
    { group: "a", rank: 2, id: "first" },
    { group: "a", rank: 1, id: "top" },
  ];
  let calls = 0;
  const sorted = sortByMany(values, [
    { toKey: ({ group }) => { calls += 1; return group; } },
    { toKey: ({ rank }) => { calls += 1; return rank; }, direction: "desc" },
  ]);
  assert.deepEqual(sorted.map(({ id }) => id), ["second", "first", "top", "third"]);
  assert.equal(calls, values.length * 2);
  assert.throws(() => sortByMany(values, []), TypeError);
  assert.throws(() => sortBy(values, ({ rank }) => rank, { compare: () => Number.NaN }), TypeError);
});
