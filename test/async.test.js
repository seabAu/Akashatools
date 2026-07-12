import assert from "node:assert/strict";
import test from "node:test";

import { delay, fulfilledValues, mapSettledWithConcurrency } from "akashatools/async";

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
  assert.deepEqual(await mapSettledWithConcurrency([], 100, () => { emptyCalls += 1; }), []);
  assert.equal(emptyCalls, 0);

  const synchronous = await mapSettledWithConcurrency([1, 2], 2, (value) => {
    if (value === 1) throw new Error("synchronous failure");
    return value * 2;
  });
  assert.deepEqual(synchronous.map(({ status }) => status), ["rejected", "fulfilled"]);

  const completionOrder = [];
  const results = await mapSettledWithConcurrency([30, 5, 10], 99, async (milliseconds, index) => {
    if (index === 1) throw new Error("async failure");
    await delay(milliseconds);
    completionOrder.push(index);
    return index;
  });
  assert.deepEqual(completionOrder, [2, 0]);
  assert.deepEqual(results.map(({ status }) => status), ["fulfilled", "rejected", "fulfilled"]);
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
