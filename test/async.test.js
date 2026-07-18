import assert from "node:assert/strict";
import test from "node:test";

import {
  createConcurrencyLimiter,
  createKeyedConcurrencyLimiter,
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

test("concurrency limiter bounds ongoing work and releases after every settlement", async () => {
  const limiter = createConcurrencyLimiter(2, { maximumPending: 3 });
  const resolvers = [];
  const started = [];
  const operation = (value) =>
    limiter.run(() => {
      started.push(value);
      return new Promise((resolve) => resolvers.push(() => resolve(value)));
    });

  const first = operation(1);
  const second = operation(2);
  const third = operation(3);
  await Promise.resolve();
  assert.deepEqual(started, [1, 2]);
  assert.equal(limiter.activeCount, 2);
  assert.equal(limiter.pendingCount, 1);

  resolvers.shift()();
  assert.equal(await first, 1);
  await Promise.resolve();
  assert.deepEqual(started, [1, 2, 3]);
  assert.equal(limiter.activeCount, 2);
  assert.equal(limiter.pendingCount, 0);
  resolvers.shift()();
  resolvers.shift()();
  assert.deepEqual(await Promise.all([second, third]), [2, 3]);
  assert.equal(limiter.activeCount, 0);

  await assert.rejects(
    limiter.run(() => {
      throw new Error("sync failure");
    }),
    /sync failure/,
  );
  assert.equal(await limiter.run(() => 4), 4);
  assert.equal(limiter.activeCount, 0);
});

test("keyed concurrency skips saturated keys without exceeding either ceiling", async () => {
  const limiter = createKeyedConcurrencyLimiter(2, 1, { maximumPending: 4 });
  const resolvers = new Map();
  const started = [];
  const operation = (key, value) =>
    limiter.run(key, () => {
      started.push(value);
      return new Promise((resolve) => resolvers.set(value, () => resolve(value)));
    });

  const a1 = operation("a", "a1");
  const a2 = operation("a", "a2");
  const b1 = operation("b", "b1");
  await Promise.resolve();
  assert.deepEqual(started, ["a1", "b1"]);
  assert.equal(limiter.activeFor("a"), 1);
  assert.equal(limiter.pendingFor("a"), 1);
  assert.equal(limiter.activeCount, 2);

  resolvers.get("b1")();
  assert.equal(await b1, "b1");
  const objectKey = {};
  const c1 = operation(objectKey, "c1");
  await Promise.resolve();
  assert.deepEqual(started, ["a1", "b1", "c1"]);
  assert.equal(limiter.activeFor(objectKey), 1);
  assert.equal(limiter.pendingCount, 1);

  resolvers.get("a1")();
  assert.equal(await a1, "a1");
  await Promise.resolve();
  assert.deepEqual(started, ["a1", "b1", "c1", "a2"]);
  resolvers.get("c1")();
  resolvers.get("a2")();
  assert.deepEqual(await Promise.all([a2, c1]), ["a2", "c1"]);
  assert.equal(limiter.activeCount, 0);
  assert.equal(limiter.pendingCount, 0);
});

test("concurrency queues are bounded and queued aborts clean up safely", async () => {
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

  const limiter = createConcurrencyLimiter(1, { maximumPending: 1 });
  let release;
  const active = limiter.run(() => new Promise((resolve) => (release = resolve)));
  const signal = new TrackingSignal();
  const queued = limiter.run(() => "never", { signal });
  assert.equal(limiter.pendingCount, 1);
  await assert.rejects(
    limiter.run(() => "full"),
    RangeError,
  );

  signal.aborted = true;
  signal.reason = new Error("leave queue");
  signal.dispatchEvent(new Event("abort"));
  await assert.rejects(queued, /leave queue/);
  assert.equal(limiter.pendingCount, 0);
  assert.equal(signal.added, 1);
  assert.equal(signal.removed, 1);
  release("done");
  assert.equal(await active, "done");

  const alreadyAborted = new AbortController();
  alreadyAborted.abort(new Error("already stopped"));
  await assert.rejects(
    limiter.run(() => "never", { signal: alreadyAborted.signal }),
    /already stopped/,
  );
  assert.equal(limiter.activeCount, 0);
});

test("concurrency limiter contracts reject invalid limits, options, operations, and signals", async () => {
  assert.throws(() => createConcurrencyLimiter(0), RangeError);
  assert.throws(() => createConcurrencyLimiter(1, { maximumPending: -1 }), RangeError);
  assert.throws(() => createConcurrencyLimiter(1, /** @type {any} */ ([])), TypeError);
  assert.throws(() => createKeyedConcurrencyLimiter(2, 3), RangeError);
  const limiter = createConcurrencyLimiter(1);
  assert.throws(() => limiter.run(/** @type {any} */ (null)), TypeError);
  assert.throws(() => limiter.run(() => 1, /** @type {any} */ ([])), TypeError);
  assert.throws(() => limiter.run(() => 1, { signal: /** @type {any} */ ({ aborted: false }) }), TypeError);
  assert.equal(await limiter.run(() => Promise.resolve("valid")), "valid");
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
