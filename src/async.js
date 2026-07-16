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
  if (
    signal !== undefined &&
    (signal === null ||
      typeof signal !== "object" ||
      typeof signal.aborted !== "boolean" ||
      typeof signal.addEventListener !== "function" ||
      typeof signal.removeEventListener !== "function")
  ) {
    throw new TypeError("signal must be an AbortSignal.");
  }
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
