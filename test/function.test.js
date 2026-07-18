import assert from "node:assert/strict";
import test from "node:test";

import { debounce, memoize, once, throttle } from "akashatools/function";

function timerHarness({ setError, setErrorAt = 1, clearError } = {}) {
  let identifier = 0;
  let setAttempts = 0;
  const tasks = new Map();
  return {
    scheduler: {
      set(callback) {
        setAttempts += 1;
        if (setError && setAttempts === setErrorAt) throw setError;
        identifier += 1;
        tasks.set(identifier, callback);
        return identifier;
      },
      clear(handle) {
        if (clearError) throw clearError;
        tasks.delete(handle);
      },
    },
    runNext() {
      const next = tasks.entries().next();
      assert.equal(next.done, false, "expected one scheduled callback");
      const [handle, callback] = next.value;
      tasks.delete(handle);
      callback();
    },
    get size() {
      return tasks.size;
    },
  };
}

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

test("debounce coalesces a burst around the latest receiver and arguments", async () => {
  const timers = timerHarness();
  const calls = [];
  const firstReceiver = { prefix: "first" };
  const latestReceiver = { prefix: "latest" };
  const save = debounce(
    function (value) {
      calls.push([this.prefix, value]);
      return `${this.prefix}:${value}`;
    },
    25,
    { scheduler: timers.scheduler },
  );

  const first = save.call(firstReceiver, "a");
  const latest = save.call(latestReceiver, "b");
  assert.equal(first, latest);
  assert.equal(save.pending, true);
  assert.equal(timers.size, 1);
  timers.runNext();
  assert.equal(await first, "latest:b");
  assert.deepEqual(calls, [["latest", "b"]]);
  assert.equal(save.pending, false);
  assert.equal(save.flush(), undefined);
  assert.deepEqual(Object.keys(save), []);
});

test("debounce flushes, cancels, and converts callback/scheduler failures to rejections", async () => {
  const timers = timerHarness();
  const doubled = debounce((value) => value * 2, 10, { scheduler: timers.scheduler });
  const pending = doubled(2);
  assert.equal(doubled.flush(), pending);
  assert.equal(await pending, 4);
  assert.equal(timers.size, 0);

  const cancelled = doubled(3);
  const reason = new Error("cancelled");
  const cancelledAssertion = assert.rejects(cancelled, (error) => error === reason);
  assert.equal(doubled.cancel(reason), true);
  await cancelledAssertion;
  assert.equal(doubled.cancel(), false);

  const defaultCancelled = doubled(4);
  const defaultCancelAssertion = assert.rejects(defaultCancelled, { name: "AbortError" });
  assert.equal(doubled.cancel(), true);
  await defaultCancelAssertion;

  const throwingTimers = timerHarness();
  const throwing = debounce(
    () => {
      throw new Error("callback failed");
    },
    10,
    { scheduler: throwingTimers.scheduler },
  );
  const callbackFailure = throwing();
  throwingTimers.runNext();
  await assert.rejects(callbackFailure, /callback failed/);

  const setError = new Error("set failed");
  const brokenSet = debounce(() => 1, 10, { scheduler: timerHarness({ setError }).scheduler });
  await assert.rejects(brokenSet(), (error) => error === setError);

  const clearError = new Error("clear failed");
  const brokenClear = debounce(() => 1, 10, { scheduler: timerHarness({ clearError }).scheduler });
  const clearFailure = brokenClear();
  const clearAssertion = assert.rejects(clearFailure, (error) => error === clearError);
  assert.equal(brokenClear(), clearFailure);
  await clearAssertion;

  const flushClear = debounce(() => 1, 10, { scheduler: timerHarness({ clearError }).scheduler });
  const flushFailure = flushClear();
  const flushAssertion = assert.rejects(flushFailure, (error) => error === clearError);
  assert.equal(flushClear.flush(), flushFailure);
  await flushAssertion;
});

test("throttle starts leading work and coalesces one latest trailing call per window", async () => {
  const timers = timerHarness();
  const calls = [];
  const firstReceiver = { prefix: "first" };
  const latestReceiver = { prefix: "latest" };
  const update = throttle(
    function (value) {
      calls.push([this.prefix, value]);
      return `${this.prefix}:${value}`;
    },
    16,
    { scheduler: timers.scheduler },
  );

  const leading = update.call(firstReceiver, "a");
  const trailing = update.call(firstReceiver, "b");
  assert.equal(update.call(latestReceiver, "c"), trailing);
  assert.equal(await leading, "first:a");
  assert.equal(update.pending, true);
  timers.runNext();
  assert.equal(await trailing, "latest:c");
  assert.deepEqual(calls, [
    ["first", "a"],
    ["latest", "c"],
  ]);
  assert.equal(update.pending, false);
  assert.equal(timers.size, 1);
  timers.runNext();
  assert.equal(timers.size, 0);
});

test("throttle makes leading-only and trailing-only suppressed results explicit", async () => {
  const leadingTimers = timerHarness();
  let leadingCalls = 0;
  const leadingOnly = throttle(
    (value) => {
      leadingCalls += 1;
      return value;
    },
    10,
    { trailing: false, scheduler: leadingTimers.scheduler },
  );
  const first = leadingOnly("first");
  assert.equal(leadingOnly("ignored"), first);
  assert.equal(await first, "first");
  assert.equal(leadingCalls, 1);
  assert.equal(leadingOnly.pending, false);
  leadingTimers.runNext();
  assert.equal(await leadingOnly("next"), "next");

  const trailingTimers = timerHarness();
  const trailingCalls = [];
  const trailingOnly = throttle(
    (value) => {
      trailingCalls.push(value);
      return value;
    },
    10,
    { leading: false, scheduler: trailingTimers.scheduler },
  );
  const queued = trailingOnly("first");
  assert.equal(trailingOnly("latest"), queued);
  assert.deepEqual(trailingCalls, []);
  trailingTimers.runNext();
  assert.equal(await queued, "latest");
  assert.deepEqual(trailingCalls, ["latest"]);
  trailingTimers.runNext();
});

test("throttle flush and cancel affect queued work but not completed leading work", async () => {
  const timers = timerHarness();
  const update = throttle((value) => value.toUpperCase(), 10, { scheduler: timers.scheduler });
  assert.equal(await update("first"), "FIRST");
  const queued = update("queued");
  assert.equal(update.flush(), queued);
  assert.equal(await queued, "QUEUED");
  assert.equal(update.flush(), undefined);

  const cancelled = update("cancelled");
  const cancelReason = new Error("cancelled");
  const cancelledAssertion = assert.rejects(cancelled, (error) => error === cancelReason);
  assert.equal(update.cancel(cancelReason), true);
  await cancelledAssertion;
  assert.equal(update.pending, false);
  assert.equal(update.cancel(), false);

  assert.equal(await update("fresh"), "FRESH");
});

test("scheduled controls validate policies and preserve operational failures", async () => {
  for (const factory of [debounce, throttle]) {
    assert.throws(() => factory(/** @type {any} */ (null), 1), TypeError);
    assert.throws(() => factory(() => 1, -1), RangeError);
    assert.throws(() => factory(() => 1, Number.POSITIVE_INFINITY), RangeError);
    assert.throws(() => factory(() => 1, 1, /** @type {any} */ ([])), TypeError);
    assert.throws(() => factory(() => 1, 1, { scheduler: /** @type {any} */ ({}) }), TypeError);
  }
  assert.throws(() => throttle(() => 1, 1, { leading: /** @type {any} */ (1) }), TypeError);
  assert.throws(() => throttle(() => 1, 1, { trailing: /** @type {any} */ (1) }), TypeError);
  assert.throws(() => throttle(() => 1, 1, { leading: false, trailing: false }), TypeError);

  const setError = new Error("set failed");
  let calls = 0;
  const brokenSet = throttle(
    () => {
      calls += 1;
    },
    10,
    { scheduler: timerHarness({ setError }).scheduler },
  );
  await assert.rejects(brokenSet(), (error) => error === setError);
  assert.equal(calls, 0);

  const callbackError = new Error("callback failed");
  const callbackFailure = throttle(
    () => {
      throw callbackError;
    },
    10,
    { scheduler: timerHarness().scheduler },
  );
  await assert.rejects(callbackFailure(), (error) => error === callbackError);

  const trailingSetError = new Error("trailing set failed");
  const trailingSetTimers = timerHarness({ setError: trailingSetError, setErrorAt: 2 });
  let trailingSetCalls = 0;
  const brokenTrailingSet = throttle(
    () => {
      trailingSetCalls += 1;
      return trailingSetCalls;
    },
    10,
    { scheduler: trailingSetTimers.scheduler },
  );
  assert.equal(await brokenTrailingSet(), 1);
  const trailingSetFailure = brokenTrailingSet();
  trailingSetTimers.runNext();
  await assert.rejects(trailingSetFailure, (error) => error === trailingSetError);
  assert.equal(trailingSetCalls, 1);

  const trailingOnlySetFailure = throttle(() => 1, 10, {
    leading: false,
    scheduler: timerHarness({ setError }).scheduler,
  });
  await assert.rejects(trailingOnlySetFailure(), (error) => error === setError);

  const clearError = new Error("clear failed");
  const clearTimers = timerHarness({ clearError });
  const brokenClear = throttle((value) => value, 10, { scheduler: clearTimers.scheduler });
  assert.equal(await brokenClear("leading"), "leading");
  assert.throws(
    () => brokenClear.cancel(),
    (error) => error === clearError,
  );

  const flushClearTimers = timerHarness({ clearError });
  const brokenFlush = throttle((value) => value, 10, { scheduler: flushClearTimers.scheduler });
  assert.equal(await brokenFlush("leading"), "leading");
  const flushFailure = brokenFlush("trailing");
  const flushAssertion = assert.rejects(flushFailure, (error) => error === clearError);
  assert.equal(brokenFlush.flush(), flushFailure);
  await flushAssertion;
});
