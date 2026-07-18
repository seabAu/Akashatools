import assert from "node:assert/strict";
import test from "node:test";

import { memoize, once } from "akashatools/function";

test("once preserves the first receiver, arguments, return identity, and thrown error", () => {
  let calls = 0;
  const firstReceiver = { offset: 10 };
  const secondReceiver = { offset: 100 };
  const create = once(function (value) {
    calls += 1;
    return { total: this.offset + value };
  });
  const first = create.call(firstReceiver, 2);
  assert.equal(create.call(secondReceiver, 50), first);
  assert.deepEqual(first, { total: 12 });
  assert.equal(calls, 1);

  const failure = new Error("expected");
  let failures = 0;
  const fail = once(() => {
    failures += 1;
    throw failure;
  });
  assert.throws(fail, (error) => error === failure);
  assert.throws(fail, (error) => error === failure);
  assert.equal(failures, 1);
});

test("once retries only the explicitly selected failure modes", async () => {
  let throwCalls = 0;
  const retryThrow = once(
    () => {
      throwCalls += 1;
      if (throwCalls === 1) throw new Error("retry");
      return "ready";
    },
    { retryOnThrow: true },
  );
  assert.throws(retryThrow, /retry/);
  assert.equal(retryThrow(), "ready");
  assert.equal(retryThrow(), "ready");

  let promiseCalls = 0;
  const retryRejection = once(
    () => {
      promiseCalls += 1;
      return promiseCalls === 1 ? Promise.reject(new Error("retry")) : Promise.resolve("ready");
    },
    { retryOnRejection: true },
  );
  const rejected = retryRejection();
  assert.equal(retryRejection(), rejected);
  await assert.rejects(rejected, /retry/);
  await Promise.resolve();
  const accepted = retryRejection();
  assert.notEqual(accepted, rejected);
  assert.equal(await accepted, "ready");
  assert.equal(retryRejection(), accepted);
});

test("once rejects invalid contracts and synchronous reentrancy", () => {
  assert.throws(() => once(/** @type {any} */ (null)), TypeError);
  assert.throws(() => once(() => 1, /** @type {any} */ ([])), TypeError);
  assert.throws(() => once(() => 1, { retryOnThrow: /** @type {any} */ (1) }), TypeError);
  assert.throws(() => once(() => 1, { retryOnRejection: /** @type {any} */ (1) }), TypeError);

  const reentrant = once(() => reentrant());
  assert.throws(reentrant, /reenter/);
  assert.throws(reentrant, /reenter/);
});

test("memoize preserves key identity, receiver semantics, and least-recent use", () => {
  let calls = 0;
  const firstReceiver = { prefix: "first" };
  const secondReceiver = { prefix: "second" };
  const format = memoize(
    function (key, value) {
      calls += 1;
      return { text: `${this.prefix}:${String(key)}:${value}` };
    },
    function (key) {
      return `${this.prefix}:${String(key)}`;
    },
  );
  const first = format.call(firstReceiver, 1, "a");
  assert.equal(format.call(firstReceiver, 1, "b"), first);
  assert.notEqual(format.call(secondReceiver, 1, "a"), first);
  assert.equal(calls, 2);
  assert.equal(format.has("first:1"), true);
  assert.equal(format.has("second:1"), true);

  const objectKey = {};
  const identity = memoize(
    (key) => ({ key }),
    (key) => key,
  );
  assert.equal(identity(objectKey), identity(objectKey));
  assert.notEqual(identity(1), identity("1"));

  const lruCalls = new Map();
  const lru = memoize(
    (key) => {
      lruCalls.set(key, (lruCalls.get(key) ?? 0) + 1);
      return { key };
    },
    (key) => key,
    { maximumSize: 2 },
  );
  const one = lru(1);
  const two = lru(2);
  assert.equal(lru(1), one);
  lru(3);
  assert.equal(lru.has(1), true);
  assert.equal(lru.has(2), false);
  assert.notEqual(lru(2), two);
  assert.equal(lruCalls.get(1), 1);
  assert.equal(lruCalls.get(2), 2);
});

test("memoize exposes bounded controls and explicit rejection caching", async () => {
  let calls = 0;
  const load = memoize(
    (key) => {
      calls += 1;
      return Promise.reject(new Error(String(key)));
    },
    (key) => key,
  );
  const first = load("a");
  assert.equal(load("a"), first);
  await assert.rejects(first, /a/);
  await Promise.resolve();
  assert.equal(load.has("a"), false);
  const second = load("a");
  assert.notEqual(second, first);
  await assert.rejects(second, /a/);

  const retained = memoize(
    (key) => Promise.reject(new Error(String(key))),
    (key) => key,
    {
      cacheRejected: true,
    },
  );
  const retainedFailure = retained("a");
  await assert.rejects(retainedFailure, /a/);
  assert.equal(retained("a"), retainedFailure);
  assert.equal(retained.size, 1);
  assert.equal(retained.delete("a"), true);
  assert.equal(retained.size, 0);
  retained("b").catch(() => {});
  retained.clear();
  assert.equal(retained.size, 0);
  assert.deepEqual(Object.keys(retained), []);
  assert.equal(calls, 2);
});

test("memoize never caches throws and rejects invalid or reentrant contracts", () => {
  let calls = 0;
  const failure = memoize(
    () => {
      calls += 1;
      throw new Error("failure");
    },
    () => "key",
  );
  assert.throws(failure, /failure/);
  assert.throws(failure, /failure/);
  assert.equal(calls, 2);

  const recursive = memoize(
    () => recursive("same"),
    (key) => key,
  );
  assert.throws(() => recursive("same"), /same key/);

  assert.throws(() => memoize(/** @type {any} */ (null), () => 1), TypeError);
  assert.throws(() => memoize(() => 1, /** @type {any} */ (null)), TypeError);
  assert.throws(
    () =>
      memoize(
        () => 1,
        () => 1,
        /** @type {any} */ ([]),
      ),
    TypeError,
  );
  assert.throws(
    () =>
      memoize(
        () => 1,
        () => 1,
        { maximumSize: 0 },
      ),
    RangeError,
  );
  assert.throws(
    () =>
      memoize(
        () => 1,
        () => 1,
        { maximumSize: 1.5 },
      ),
    RangeError,
  );
  assert.throws(
    () =>
      memoize(
        () => 1,
        () => 1,
        { cacheRejected: /** @type {any} */ (1) },
      ),
    TypeError,
  );
});
