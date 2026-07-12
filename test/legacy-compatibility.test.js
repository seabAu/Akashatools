import assert from "node:assert/strict";
import test from "node:test";

import { ao, math, rand, str, time, val } from "akashatools/lib";
import * as directAo from "akashatools/lib/AO.js";
import * as directVal from "akashatools/lib/Val.js";

test("representative 1.x namespace and direct-module behavior remains executable", () => {
  assert.equal(ao.uniqueArray, directAo.uniqueArray);
  assert.equal(val.isDefined, directVal.isDefined);

  assert.deepEqual(ao.arrayToEnum(["draft", "done"]), { draft: "draft", done: "done" });
  assert.equal(Object.isFrozen(ao.arrayToEnum(["draft"])), true);
  assert.equal(ao.isOneOf("done", ["draft", "done"]), true);
  assert.deepEqual(ao.uniqueArray([1, 1, 2]), [1, 2]);
  assert.deepEqual(ao.mergeArray([1], [1, 2], true), [1, 2]);
  assert.equal(ao.replaceIfInvalid("", "fallback"), "fallback");
  assert.deepEqual(ao.removeEmpty([0, false, "", null, undefined]), [0, false]);

  assert.equal(val.isDefined(0), true);
  assert.equal(val.isTruthy(false), true);
  assert.equal(val.isString("text"), true);
  assert.equal(val.isNumber(Number.NaN), true);
  assert.equal(val.isSafeInt(42), true);

  assert.equal(str.toCapitalCase("akasha"), "Akasha");
  assert.equal(str.toKebabCase("someValue"), "some-value");
  assert.equal(str.toUpperCamelCase("some-value"), "SomeValue");
  assert.equal(str.subStringSearch("Akasha Tools", "tools"), true);

  assert.equal(math.clamp(12, 0, 10), 10);
  assert.equal(math.wrap(11, 0, 10), 1);
  assert.equal(math.add(1, 2, 3), 6);
  assert.equal(math.sub(5, 2), -7, "legacy sub negates every argument rather than subtracting from the first");
  assert.equal(math.distance2({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
  assert.ok([1, -1].includes(math.boolRand()));

  assert.match(rand.randString(12), /^[0-9A-Za-z]{12}$/);
  const randomValue = rand.rand(5, 2);
  assert.ok(randomValue >= 2 && randomValue < 5);

  assert.equal(time.convertDate(new Date(2020, 0, 2)), "Thu, 2 January 2020");
  assert.equal(time.elapsed(1_000, 3_000), 2);

  assert.throws(() => val.valid("defined"), ReferenceError, "known 1.x reference defect remains isolated to legacy code");
  assert.throws(() => time.timeElapsed(0, 1_000), ReferenceError, "known 1.x reference defect remains isolated to legacy code");
});
