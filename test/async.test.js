import assert from "node:assert/strict";
import test from "node:test";

import {
  createKeyedSingleFlight,
  createSingleFlight,
  delay,
  fulfilledValues,
  mapSettledWithConcurrency,
} from "akashatools/async";

test("single-flight coalesces requests, caches accepted values, and isolates generations", async () => {
  let calls = 0;
  let currentTime = 1_000;
  /** @type {Array<(value: number) => void>} */
  const resolvers = [];
  const resolveNext = (value) => {
    const resolve = resolvers.shift();
    assert.ok(resolve);
    resolve(value);
  };
  const flight = createSingleFlight(
    () =>
      new Promise((resolve) => {
        calls += 1;
        resolvers.push(resolve);
      }),
    { ttl: 100, now: () => currentTime, shouldCache: (value) => value > 0 },
  );

  const first = flight.load();
  assert.equal(flight.load(), first);
  await Promise.resolve();
  resolveNext(1);
  assert.equal(await first, 1);
  assert.equal(await flight.load(), 1);
  assert.equal(calls, 1);

  currentTime += 101;
  const expired = flight.load();
  await Promise.resolve();
  resolveNext(-1);
  assert.equal(await expired, -1);
  const uncached = flight.load();
  flight.invalidate();
  const nextGeneration = flight.load();
  await Promise.resolve();
  resolveNext(2);
  resolveNext(3);
  assert.equal(await uncached, 2);
  assert.equal(await nextGeneration, 3);
  assert.equal(await flight.load(), 3);
});

test("single-flight normalizes synchronous errors and validates cache contracts", async () => {
  const failed = createSingleFlight(() => {
    throw new Error("sync");
  });
  await assert.rejects(failed.load(), /sync/);
  assert.throws(() => createSingleFlight(/** @type {any} */ (null)), TypeError);
  assert.throws(() => createSingleFlight(() => 1, /** @type {any} */ ([])), TypeError);
  assert.throws(() => createSingleFlight(() => 1, { ttl: -1 }), RangeError);

  const badClock = createSingleFlight(() => 1, { ttl: 1, now: () => Number.NaN });
  await assert.rejects(badClock.load(), RangeError);
  const badPredicate = createSingleFlight(() => 1, {
    ttl: 1,
    shouldCache: /** @type {any} */ (() => "yes"),
  });
  await assert.rejects(badPredicate.load(), TypeError);
});

test("keyed single-flight bounds least-recently used entries without allocating on invalidation", async () => {
  const calls = new Map();
  const flight = createKeyedSingleFlight(
    async (key) => {
      calls.set(key, (calls.get(key) ?? 0) + 1);
      return `${key}-${calls.get(key)}`;
    },
    { ttl: Infinity, maximumSize: 2 },
  );

  assert.deepEqual(await Promise.all([flight.load("a"), flight.load("a")]), ["a-1", "a-1"]);
  assert.equal(await flight.load("b"), "b-1");
  assert.equal(await flight.load("a"), "a-1"); // refresh a as most recently accessed
  assert.equal(await flight.load("c"), "c-1"); // evicts b
  assert.equal(flight.size, 2);
  assert.equal(flight.invalidate("missing"), false);
  assert.equal(flight.size, 2);
  assert.equal(await flight.load("b"), "b-2");
  assert.equal(flight.invalidate("b"), true);
  assert.equal(flight.invalidateAll(), 1);
  assert.equal(flight.size, 0);
  assert.throws(() => createKeyedSingleFlight(async () => 1, { maximumSize: 0 }), RangeError);
});

test("bounded async mapping preserves order and filters fulfilled values", async () => {
  let active = 0;
  let maximum = 0;
  const results = await mapSettledWithConcurrency([1, 2, 3, 4], 2, async (value) => {
    active += 1;
    maximum = Math.max(maximum, active);
    await delay(2);
    active -= 1;
    if (value === 3) throw new Error("three");
    return value * 2;
  });
  assert.equal(maximum, 2);
  assert.deepEqual(fulfilledValues(results), [2, 4, 8]);
});

test("bounded settled mapping handles empty, sync-throw, high concurrency, and ordering", async () => {
  let emptyCalls = 0;
  assert.deepEqual(
    await mapSettledWithConcurrency([], 100, () => {
      emptyCalls += 1;
    }),
    [],
  );
  assert.equal(emptyCalls, 0);

  const synchronous = await mapSettledWithConcurrency([1, 2], 2, (value) => {
    if (value === 1) throw new Error("synchronous failure");
    return value * 2;
  });
  assert.deepEqual(
    synchronous.map(({ status }) => status),
    ["rejected", "fulfilled"],
  );

  const completionOrder = [];
  const results = await mapSettledWithConcurrency([30, 5, 10], 99, async (milliseconds, index) => {
    if (index === 1) throw new Error("async failure");
    await delay(milliseconds);
    completionOrder.push(index);
    return index;
  });
  assert.deepEqual(completionOrder, [2, 0]);
  assert.deepEqual(
    results.map(({ status }) => status),
    ["fulfilled", "rejected", "fulfilled"],
  );
  assert.equal(results[0].status === "fulfilled" ? results[0].value : undefined, 0);
  assert.match(results[1].status === "rejected" ? results[1].reason.message : "", /async failure/);
  assert.equal(results[2].status === "fulfilled" ? results[2].value : undefined, 2);
});

test("delay supports cancellation and validates the host timer range", async () => {
  const controller = new AbortController();
  const reason = new Error("cancelled");
  const pending = delay(10_000, { signal: controller.signal });
  controller.abort(reason);
  await assert.rejects(pending, (error) => error === reason);

  const alreadyAborted = new AbortController();
  alreadyAborted.abort();
  await assert.rejects(delay(0, { signal: alreadyAborted.signal }), { name: "AbortError" });
  assert.throws(() => delay(2_147_483_648), RangeError);
  assert.throws(() => delay(0, { signal: /** @type {any} */ ({ aborted: false }) }), TypeError);
});

test("delay removes abort listeners after settlement and cancellation", async () => {
  class TrackingSignal extends EventTarget {
    aborted = false;
    reason = undefined;
    added = 0;
    removed = 0;
    addEventListener(type, listener, options) {
      this.added += 1;
      return super.addEventListener(type, listener, options);
    }
    removeEventListener(type, listener, options) {
      this.removed += 1;
      return super.removeEventListener(type, listener, options);
    }
  }

  const settledSignal = new TrackingSignal();
  await delay(0, { signal: /** @type {any} */ (settledSignal) });
  assert.equal(settledSignal.added, 1);
  assert.equal(settledSignal.removed, 1);

  const cancelledSignal = new TrackingSignal();
  const pending = delay(10_000, { signal: /** @type {any} */ (cancelledSignal) });
  cancelledSignal.aborted = true;
  cancelledSignal.reason = new Error("stop");
  cancelledSignal.dispatchEvent(new Event("abort"));
  await assert.rejects(pending, /stop/);
  assert.equal(cancelledSignal.added, 1);
  assert.equal(cancelledSignal.removed, 1);
});
