import { isPlainObject } from "./object.js";

/**
 * Coalesces concurrent loader calls and optionally caches an accepted result.
 * Invalidation starts a new generation: an older in-flight request still
 * settles for its callers but cannot repopulate the cache. Synchronous loader
 * errors are exposed as Promise rejections.
 *
 * @template T
 * @param {() => T | PromiseLike<T>} loader Operation started at most once per active generation.
 * @param {{ttl?: number, now?: () => number, shouldCache?: (value: T) => boolean}} [options] Non-negative cache lifetime in milliseconds (Infinity never expires), clock, and literal-boolean cache predicate; ttl zero only coalesces in-flight work.
 * @returns {Readonly<{load: () => Promise<T>, invalidate: () => void}>} Frozen controller with a shared load Promise and synchronous cache invalidation.
 * @throws {TypeError} If loader/options/callbacks are invalid or shouldCache does not return a boolean.
 * @throws {RangeError} If ttl or a clock result is outside its documented range.
 * @example
 * const profile = createSingleFlight(loadProfile, { ttl: 30_000 });
 * const [left, right] = await Promise.all([profile.load(), profile.load()]);
 * @since 2.0.0
 */
export function createSingleFlight(loader, options = {}) {
  if (typeof loader !== "function") throw new TypeError("loader must be a function.");
  const { ttl, now, shouldCache } = normalizeSingleFlightOptions(options);

  /** @type {{expiresAt: number, value: T} | undefined} */
  let cached;
  /** @type {{generation: number, request: Promise<T>} | undefined} */
  let pending;
  let generation = 0;

  const invalidate = () => {
    cached = undefined;
    pending = undefined;
    generation += 1;
  };

  const load = () => {
    if (cached) {
      if (cached.expiresAt === Infinity || cached.expiresAt > readClock(now)) {
        return Promise.resolve(cached.value);
      }
      cached = undefined;
    }
    if (pending?.generation === generation) return pending.request;

    const requestGeneration = generation;
    const request = Promise.resolve()
      .then(loader)
      .then((value) => {
        if (requestGeneration !== generation || ttl === 0) return value;
        const cacheResult = shouldCache(value);
        if (typeof cacheResult !== "boolean") throw new TypeError("shouldCache must return a boolean.");
        if (cacheResult)
          cached = {
            expiresAt: ttl === Infinity ? Infinity : readClock(now) + ttl,
            value,
          };
        return value;
      });

    const completed = request.finally(() => {
      if (pending?.request === completed) pending = undefined;
    });
    pending = { generation: requestGeneration, request: completed };
    return completed;
  };

  return Object.freeze({ invalidate, load });
}

/**
 * Creates bounded per-key single-flight controllers. Entries use least-recently
 * accessed eviction when maximumSize is reached. Evicting or invalidating an
 * in-flight key does not cancel its Promise, but its result cannot enter the
 * retained cache.
 *
 * @template K, V
 * @param {(key: K) => V | PromiseLike<V>} loader Operation started independently for each SameValueZero key.
 * @param {{ttl?: number, now?: () => number, shouldCache?: (value: V) => boolean, maximumSize?: number}} [options] Single-flight cache policy and positive safe-integer retained-key bound.
 * @returns {Readonly<{load: (key: K) => Promise<V>, invalidate: (key: K) => boolean, invalidateAll: () => number, readonly size: number}>} Frozen keyed controller; invalidation reports whether/count of retained entries removed.
 * @throws {TypeError} If loader/options/callbacks are invalid or shouldCache does not return a boolean.
 * @throws {RangeError} If ttl, maximumSize, or a clock result is outside its documented range.
 * @example
 * const users = createKeyedSingleFlight(loadUser, { ttl: 5_000, maximumSize: 100 });
 * await users.load(userId);
 * @since 2.0.0
 */
export function createKeyedSingleFlight(loader, options = {}) {
  if (typeof loader !== "function") throw new TypeError("loader must be a function.");
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const { maximumSize = 1_000, ...singleFlightOptions } = options;
  if (!Number.isSafeInteger(maximumSize) || maximumSize < 1) {
    throw new RangeError("maximumSize must be a positive safe integer.");
  }
  normalizeSingleFlightOptions(singleFlightOptions);

  /** @type {Map<K, Readonly<{load: () => Promise<V>, invalidate: () => void}>>} */
  const entries = new Map();

  /** @param {K} key */
  const entryFor = (key) => {
    const existing = entries.get(key);
    if (existing) {
      entries.delete(key);
      entries.set(key, existing);
      return existing;
    }

    if (entries.size >= maximumSize) {
      const oldestResult = entries.keys().next();
      if (!oldestResult.done) {
        const oldest = entries.get(oldestResult.value);
        oldest?.invalidate();
        entries.delete(oldestResult.value);
      }
    }
    const entry = createSingleFlight(() => loader(key), singleFlightOptions);
    entries.set(key, entry);
    return entry;
  };

  return Object.freeze({
    load: (key) => entryFor(key).load(),
    invalidate: (key) => {
      const entry = entries.get(key);
      if (!entry) return false;
      entry.invalidate();
      entries.delete(key);
      return true;
    },
    invalidateAll: () => {
      const size = entries.size;
      for (const entry of entries.values()) entry.invalidate();
      entries.clear();
      return size;
    },
    get size() {
      return entries.size;
    },
  });
}

/**
 * Creates a reusable scheduler for independent operations submitted over time.
 * At most `maximumConcurrency` callbacks run together and at most
 * `maximumPending` callbacks wait in memory. A queued caller may abort without
 * affecting work that has already started; pass the same signal into the
 * operation itself when running work is also cancellable.
 *
 * @param {number} maximumConcurrency Positive safe-integer global concurrency ceiling.
 * @param {{maximumPending?: number}} [options] Non-negative safe-integer bound for callbacks waiting to start; defaults to 1,000.
 * @returns {Readonly<{run: <T>(operation: () => T | PromiseLike<T>, options?: {signal?: AbortSignal}) => Promise<T>, readonly activeCount: number, readonly pendingCount: number}>} Frozen controller whose run method preserves each callback result or error and whose counts reflect live scheduler state.
 * @throws {TypeError} If options, an operation, or an AbortSignal is invalid.
 * @throws {RangeError} If a concurrency/queue limit is invalid; a run Promise also rejects with RangeError when the pending queue is full.
 * @example
 * const uploads = createConcurrencyLimiter(3, { maximumPending: 50 });
 * await uploads.run(() => uploadFile(file), { signal });
 * @since 2.0.0
 */
export function createConcurrencyLimiter(maximumConcurrency, options = {}) {
  const maximumPending = normalizeConcurrencyOptions(maximumConcurrency, maximumConcurrency, options);
  const key = Symbol("unkeyed concurrency");
  const core = createLimiterCore(maximumConcurrency, maximumConcurrency, maximumPending);

  return Object.freeze({
    run: (operation, runOptions) => core.run(key, operation, runOptions),
    get activeCount() {
      return core.activeCount;
    },
    get pendingCount() {
      return core.pendingCount;
    },
  });
}

/**
 * Creates a scheduler with both global and SameValueZero per-key concurrency
 * ceilings. Work is selected in arrival order among entries whose key currently
 * has capacity, so a saturated key cannot block unrelated keys. Queued aborts
 * remove their listener and queue entry; callbacks already running settle
 * normally and always release capacity after fulfillment or rejection.
 *
 * @param {number} maximumConcurrency Positive safe-integer global concurrency ceiling.
 * @param {number} maximumConcurrencyPerKey Positive safe-integer ceiling for one Map-identity key, not greater than the global ceiling.
 * @param {{maximumPending?: number}} [options] Non-negative safe-integer total bound for callbacks waiting across all keys; defaults to 1,000.
 * @returns {Readonly<{run: <K, T>(key: K, operation: () => T | PromiseLike<T>, options?: {signal?: AbortSignal}) => Promise<T>, activeFor: (key: unknown) => number, pendingFor: (key: unknown) => number, readonly activeCount: number, readonly pendingCount: number}>} Frozen keyed controller with live global/per-key counts and Promise-preserving execution.
 * @throws {TypeError} If options, an operation, or an AbortSignal is invalid.
 * @throws {RangeError} If a concurrency/queue limit is invalid; a run Promise also rejects with RangeError when the pending queue is full.
 * @example
 * const requests = createKeyedConcurrencyLimiter(8, 2);
 * await requests.run(new URL(url).origin, () => fetch(url));
 * @since 2.0.0
 */
export function createKeyedConcurrencyLimiter(maximumConcurrency, maximumConcurrencyPerKey, options = {}) {
  const maximumPending = normalizeConcurrencyOptions(maximumConcurrency, maximumConcurrencyPerKey, options);
  const core = createLimiterCore(maximumConcurrency, maximumConcurrencyPerKey, maximumPending);

  return Object.freeze({
    run: core.run,
    activeFor: core.activeFor,
    pendingFor: core.pendingFor,
    get activeCount() {
      return core.activeCount;
    },
    get pendingCount() {
      return core.pendingCount;
    },
  });
}

/**
 * Maps values with a fixed concurrency ceiling. Results retain input order and
 * individual failures are represented like `Promise.allSettled`.
 *
 * @template T, R
 * @param {readonly T[]} values Values to map without mutating the input array.
 * @param {number} concurrency Maximum number of mapper calls active at once.
 * @param {(value: T, index: number) => R | PromiseLike<R>} mapper Mapper whose return or thrown reason becomes one settled result.
 * @returns {Promise<PromiseSettledResult<R>[]>} Settled results in input order.
 * @throws {TypeError} If values is not an array or mapper is not a function.
 * @throws {RangeError} If concurrency is not a positive safe integer.
 * @example
 * const results = await mapSettledWithConcurrency(urls, 4, fetch);
 * @since 2.0.0
 */
export async function mapSettledWithConcurrency(values, concurrency, mapper) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  if (!Number.isSafeInteger(concurrency) || concurrency < 1) {
    throw new RangeError("concurrency must be a positive safe integer.");
  }
  if (typeof mapper !== "function") throw new TypeError("mapper must be a function.");

  /** @type {PromiseSettledResult<R>[]} */
  const results = new Array(values.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = { status: "fulfilled", value: await mapper(values[index], index) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

/**
 * Extracts values from fulfilled settled results.
 *
 * @template T
 * @param {readonly PromiseSettledResult<T>[]} results Settled results to filter in their existing order.
 * @returns {T[]} Values from fulfilled entries only.
 * @throws {TypeError} If results is not an array.
 * @example
 * fulfilledValues(await Promise.allSettled([Promise.resolve(1), Promise.reject("no")])); // [1]
 * @since 2.0.0
 */
export function fulfilledValues(results) {
  if (!Array.isArray(results)) throw new TypeError("results must be an array.");
  return results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
}

/**
 * Waits for a duration and optionally supports cancellation.
 *
 * @param {number} milliseconds Finite duration from 0 through 2,147,483,647 milliseconds.
 * @param {{signal?: AbortSignal}} [options] Optional cancellation signal.
 * @returns {Promise<void>} Promise fulfilled after the duration or rejected on cancellation.
 * @throws {TypeError} If signal does not implement the AbortSignal contract.
 * @throws {RangeError} If milliseconds is outside the host timer range.
 * @example
 * await delay(250, { signal: controller.signal });
 * @since 2.0.0
 */
export function delay(milliseconds, { signal } = {}) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0 || milliseconds > 2_147_483_647) {
    throw new RangeError("milliseconds must be between 0 and 2147483647.");
  }
  assertAbortSignal(signal);
  if (signal?.aborted) return Promise.reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
  const abortSignal = signal;

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timeout);
      abortSignal?.removeEventListener("abort", onAbort);
      reject(abortSignal?.reason ?? new DOMException("Aborted", "AbortError"));
    };
    const timeout = setTimeout(() => {
      abortSignal?.removeEventListener("abort", onAbort);
      resolve();
    }, milliseconds);
    abortSignal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * @template T
 * @param {unknown} options
 * @returns {{ttl: number, now: () => number, shouldCache: (value: T) => boolean}}
 */
function normalizeSingleFlightOptions(options) {
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const ttl = options.ttl ?? 0;
  const now = options.now ?? Date.now;
  const shouldCache = options.shouldCache ?? (() => true);
  if (typeof ttl !== "number" || (ttl !== Infinity && !Number.isFinite(ttl)) || ttl < 0) {
    throw new RangeError("ttl must be a non-negative finite number or Infinity.");
  }
  if (typeof now !== "function") throw new TypeError("now must be a function.");
  if (typeof shouldCache !== "function") throw new TypeError("shouldCache must be a function.");
  return {
    ttl,
    now: /** @type {() => number} */ (now),
    shouldCache: /** @type {(value: T) => boolean} */ (shouldCache),
  };
}

/** @param {() => number} now */
function readClock(now) {
  const value = now();
  if (!Number.isFinite(value)) throw new RangeError("now must return a finite number.");
  return value;
}

/**
 * @param {number} maximumConcurrency
 * @param {number} maximumConcurrencyPerKey
 * @param {unknown} options
 */
function normalizeConcurrencyOptions(maximumConcurrency, maximumConcurrencyPerKey, options) {
  if (!Number.isSafeInteger(maximumConcurrency) || maximumConcurrency < 1) {
    throw new RangeError("maximumConcurrency must be a positive safe integer.");
  }
  if (
    !Number.isSafeInteger(maximumConcurrencyPerKey) ||
    maximumConcurrencyPerKey < 1 ||
    maximumConcurrencyPerKey > maximumConcurrency
  ) {
    throw new RangeError(
      "maximumConcurrencyPerKey must be a positive safe integer no greater than maximumConcurrency.",
    );
  }
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const maximumPending = /** @type {{maximumPending?: unknown}} */ (options).maximumPending ?? 1_000;
  if (typeof maximumPending !== "number" || !Number.isSafeInteger(maximumPending) || maximumPending < 0) {
    throw new RangeError("maximumPending must be a non-negative safe integer.");
  }
  return maximumPending;
}

/**
 * @param {number} maximumConcurrency
 * @param {number} maximumConcurrencyPerKey
 * @param {number} maximumPending
 */
function createLimiterCore(maximumConcurrency, maximumConcurrencyPerKey, maximumPending) {
  /**
   * @typedef {{key: unknown, operation: () => any, resolve: (value: any) => void, reject: (reason?: any) => void, signal?: AbortSignal, onAbort?: () => void}} QueueEntry
   */
  /** @type {QueueEntry[]} */
  const queue = [];
  const activeByKey = new Map();
  const pendingByKey = new Map();
  let activeCount = 0;

  /** @param {Map<any, number>} counts @param {any} key @param {number} change */
  const changeCount = (counts, key, change) => {
    const next = (counts.get(key) ?? 0) + change;
    if (next === 0) counts.delete(key);
    else counts.set(key, next);
  };

  /** @param {unknown} key */
  const canStart = (key) => activeCount < maximumConcurrency && (activeByKey.get(key) ?? 0) < maximumConcurrencyPerKey;

  /** @param {QueueEntry} entry */
  const start = (entry) => {
    if (entry.onAbort) entry.signal?.removeEventListener("abort", entry.onAbort);
    activeCount += 1;
    changeCount(activeByKey, entry.key, 1);

    const release = () => {
      activeCount -= 1;
      changeCount(activeByKey, entry.key, -1);
      dispatch();
    };

    Promise.resolve()
      .then(entry.operation)
      .then(
        (value) => {
          release();
          entry.resolve(value);
        },
        (reason) => {
          release();
          entry.reject(reason);
        },
      );
  };

  const dispatch = () => {
    while (activeCount < maximumConcurrency) {
      const index = queue.findIndex((entry) => canStart(entry.key));
      if (index === -1) return;
      const [entry] = queue.splice(index, 1);
      changeCount(pendingByKey, entry.key, -1);
      start(entry);
    }
  };

  /**
   * @template T
   * @param {unknown} key
   * @param {() => T | PromiseLike<T>} operation
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<T>}
   */
  const run = (key, operation, options = {}) => {
    if (typeof operation !== "function") throw new TypeError("operation must be a function.");
    if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
    const { signal } = options;
    assertAbortSignal(signal);
    if (signal?.aborted) return Promise.reject(abortReason(signal));

    if (!canStart(key) && queue.length >= maximumPending) {
      return Promise.reject(new RangeError("The concurrency limiter pending queue is full."));
    }

    return new Promise((resolve, reject) => {
      /** @type {QueueEntry} */
      const entry = { key, operation, resolve, reject, signal };
      if (canStart(key)) {
        start(entry);
        return;
      }

      const onAbort = () => {
        const index = queue.indexOf(entry);
        if (index === -1) return;
        queue.splice(index, 1);
        changeCount(pendingByKey, key, -1);
        signal?.removeEventListener("abort", onAbort);
        reject(abortReason(signal));
        dispatch();
      };
      entry.onAbort = onAbort;
      queue.push(entry);
      changeCount(pendingByKey, key, 1);
      signal?.addEventListener("abort", onAbort, { once: true });
    });
  };

  /** @param {unknown} key */
  const activeFor = (key) => activeByKey.get(key) ?? 0;
  /** @param {unknown} key */
  const pendingFor = (key) => pendingByKey.get(key) ?? 0;

  return {
    run,
    activeFor,
    pendingFor,
    get activeCount() {
      return activeCount;
    },
    get pendingCount() {
      return queue.length;
    },
  };
}

/** @param {unknown} signal */
function assertAbortSignal(signal) {
  const candidate = /** @type {any} */ (signal);
  if (
    signal !== undefined &&
    (signal === null ||
      typeof signal !== "object" ||
      typeof candidate.aborted !== "boolean" ||
      typeof candidate.addEventListener !== "function" ||
      typeof candidate.removeEventListener !== "function")
  ) {
    throw new TypeError("signal must be an AbortSignal.");
  }
}

/** @param {AbortSignal | undefined} signal */
function abortReason(signal) {
  return signal?.reason ?? new DOMException("Aborted", "AbortError");
}
