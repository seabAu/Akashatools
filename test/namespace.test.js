import assert from "node:assert/strict";
import test from "node:test";

import akasha, * as root from "akashatools";
import * as arrayModule from "akashatools/array";
import * as validationModule from "akashatools/validation";
import { assertNamespaceIsCollisionFree } from "../src/namespace.js";

const categoryNames = [
  "array",
  "async",
  "browser",
  "collection",
  "date",
  "number",
  "object",
  "random",
  "sort",
  "string",
  "validation",
];

test("default and named Akashatools namespaces are the same frozen object", () => {
  assert.equal(akasha, root.akasha);
  assert.equal(root.default, akasha);
  assert.equal(Object.isFrozen(akasha), true);

  for (const categoryName of categoryNames) {
    assert.equal(Object.isFrozen(akasha[categoryName]), true, `${categoryName} must be frozen`);
    assert.equal(akasha[categoryName], root[categoryName]);
  }
});

test("flat, categorized, named, and subpath functions retain identity", () => {
  assert.equal(akasha.chunk, akasha.array.chunk);
  assert.equal(akasha.chunk, root.chunk);
  assert.equal(akasha.chunk, arrayModule.chunk);
  assert.equal(akasha.isEmail, akasha.validation.isEmail);
  assert.equal(akasha.isEmail, root.isEmail);
  assert.equal(akasha.isEmail, validationModule.isEmail);
});

test("every category utility is represented flat and as a named root export", () => {
  for (const categoryName of categoryNames) {
    for (const [utilityName, utility] of Object.entries(akasha[categoryName])) {
      assert.equal(akasha[utilityName], utility, `missing flat utility ${utilityName}`);
      assert.equal(root[utilityName], utility, `missing named root utility ${utilityName}`);
    }
  }
});

test("namespace collision validation rejects ambiguous categories and utilities", () => {
  const first = () => "first";
  const second = () => "second";

  assert.throws(
    () => assertNamespaceIsCollisionFree([["one", { duplicate: first }], ["two", { duplicate: second }]]),
    /Ambiguous Akashatools utility/,
  );
  assert.throws(
    () => assertNamespaceIsCollisionFree([["same", {}], ["same", {}]]),
    /Duplicate Akashatools category/,
  );
  assert.throws(
    () => assertNamespaceIsCollisionFree([["array", { array: first }]]),
    /collides with an Akashatools category/,
  );
  assert.throws(
    () => assertNamespaceIsCollisionFree([["first", { future: first }], ["future", {}]]),
    /collides with an Akashatools category/,
  );
});

test("the real public categories pass the namespace collision contract", () => {
  assert.doesNotThrow(() => assertNamespaceIsCollisionFree(
    categoryNames.map((categoryName) => [categoryName, root[categoryName]]),
  ));
});
