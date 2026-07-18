import { isPlainObject } from "./object.js";

/**
 * @typedef {object} OnceOptions
 * @property {boolean} [retryOnThrow=false] Whether a synchronous throw returns the wrapper to its unused state.
 * @property {boolean} [retryOnRejection=false] Whether a rejected native Promise returns the wrapper to its unused state after settlement.
 */

/**
 * @typedef {object} MemoizeOptions
 * @property {number} [maximumSize=1000] Positive safe-integer least-recently-used cache bound.
 * @property {boolean} [cacheRejected=false] Whether rejected native Promises remain cached after settlement.
 */

/** @template Key @typedef {{clear: () => void, delete: (key: Key) => boolean, has: (key: Key) => boolean, readonly size: number}} MemoizedControls */

/**
 * Creates a receiver-preserving wrapper that invokes a function at most once and
 * replays its exact return value or thrown error. Reentrant calls made before the
 * first invocation returns throw instead of observing a partially initialized
 * result. Native Promise identity is preserved.
 *
 * By default, throws and rejected Promises are cached, which gives "at most
 * once" literal meaning. Explicit retry options reset only after the matching
 * failure; calls made while a returned Promise is pending still share it.
 *
 * @template This
 * @template {unknown[]} Args
 * @template Result
 * @param {(this: This, ...args: Args) => Result} callback Function invoked with the first call's receiver and arguments.
 * @param {OnceOptions} [options] Explicit synchronous and asynchronous failure-retry policy.
 * @returns {(this: This, ...args: Args) => Result} Wrapper returning or throwing the cached outcome.
 * @throws {TypeError} If callback or options are invalid.
 * @throws {Error} If the wrapper is synchronously reentered before its first invocation returns.
 * @example
 * const initialize = once(() => ({ ready: true }));
 * initialize() === initialize(); // true
 * @since 2.0.0
 */
export function once(callback, options = {}) {
  if (typeof callback !== "function") throw new TypeError("callback must be a function.");
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const { retryOnThrow = false, retryOnRejection = false } = options;
  if (typeof retryOnThrow !== "boolean") throw new TypeError("retryOnThrow must be a boolean.");
  if (typeof retryOnRejection !== "boolean") throw new TypeError("retryOnRejection must be a boolean.");

  /** @type {"idle" | "running" | "returned" | "threw"} */
  let state = "idle";
  /** @type {Result} */
  let result;
  /** @type {unknown} */
  let thrown;

  /** @type {(this: This, ...args: Args) => Result} */
  function wrapped(...args) {
    if (state === "returned") return result;
    if (state === "threw") throw thrown;
    if (state === "running") throw new Error("once callback cannot synchronously reenter its wrapper.");

    state = "running";
    try {
      result = Reflect.apply(callback, this, args);
      state = "returned";
      if (retryOnRejection) {
        const observed = result;
        observeNativePromiseRejection(result, () => {
          if (state === "returned" && result === observed) state = "idle";
        });
      }
      return result;
    } catch (error) {
      if (retryOnThrow) state = "idle";
      else {
        thrown = error;
        state = "threw";
      }
      throw error;
    }
  }

  return wrapped;
}

/**
 * Memoizes a receiver-preserving function through an explicit key selector and
 * a bounded SameValueZero-keyed least-recently-used Map. Cache hits replay the
 * exact value or native Promise. Pending Promises therefore coalesce while they
 * remain cached; rejected Promises are removed after settlement by default.
 * Synchronous throws are never cached.
 *
 * The selector receives the same dynamic receiver and arguments as the wrapped
 * function, so receiver identity is included only when the selector chooses it.
 * Same-key synchronous reentrancy throws; different keys may recurse. The
 * returned function has non-enumerable `clear`, `delete`, `has`, and read-only
 * `size` controls. Eviction and removal never cancel ongoing work.
 *
 * @template This
 * @template {unknown[]} Args
 * @template Result
 * @template Key
 * @param {(this: This, ...args: Args) => Result} callback Function whose successful return values are cached.
 * @param {(this: This, ...args: Args) => Key} toKey Explicit identity selector evaluated before each lookup.
 * @param {MemoizeOptions} [options] Bounded eviction and rejected-Promise policy.
 * @returns {((this: This, ...args: Args) => Result) & MemoizedControls<Key>} Memoized wrapper with cache controls.
 * @throws {TypeError} If callback, selector, or options are invalid.
 * @throws {RangeError} If maximumSize is not a positive safe integer.
 * @throws {Error} If callback synchronously reenters the wrapper with the same key.
 * @example
 * const byId = memoize(loadUser, (id) => id, { maximumSize: 100 });
 * byId(42) === byId(42); // true
 * @since 2.0.0
 */
export function memoize(callback, toKey, options = {}) {
  if (typeof callback !== "function") throw new TypeError("callback must be a function.");
  if (typeof toKey !== "function") throw new TypeError("toKey must be a function.");
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const { maximumSize = 1_000, cacheRejected = false } = options;
  if (!Number.isSafeInteger(maximumSize) || maximumSize < 1) {
    throw new RangeError("maximumSize must be a positive safe integer.");
  }
  if (typeof cacheRejected !== "boolean") throw new TypeError("cacheRejected must be a boolean.");

  /** @type {Map<Key, Result>} */
  const cache = new Map();
  /** @type {Set<Key>} */
  const activeKeys = new Set();

  /**
   * @this {This}
   * @param {Args} args
   * @returns {Result}
   */
  function memoizedCall(...args) {
    const key = Reflect.apply(toKey, this, args);
    if (cache.has(key)) {
      const cached = /** @type {Result} */ (cache.get(key));
      cache.delete(key);
      cache.set(key, cached);
      return cached;
    }
    if (activeKeys.has(key)) throw new Error("memoize callback cannot synchronously reenter with the same key.");

    activeKeys.add(key);
    /** @type {Result} */
    let result;
    try {
      result = Reflect.apply(callback, this, args);
    } finally {
      activeKeys.delete(key);
    }

    cache.set(key, result);
    if (cache.size > maximumSize) {
      const oldest = cache.keys().next();
      if (!oldest.done) cache.delete(oldest.value);
    }
    if (!cacheRejected) {
      observeNativePromiseRejection(result, () => {
        if (cache.get(key) === result) cache.delete(key);
      });
    }
    return result;
  }

  const memoized = /** @type {((this: This, ...args: Args) => Result) & MemoizedControls<Key>} */ (
    /** @type {unknown} */ (memoizedCall)
  );

  Object.defineProperties(memoized, {
    clear: { value: () => cache.clear() },
    delete: { value: (/** @type {Key} */ key) => cache.delete(key) },
    has: { value: (/** @type {Key} */ key) => cache.has(key) },
    size: { get: () => cache.size },
  });
  return memoized;
}

/**
 * Observes only genuine native/cross-realm Promises without reading an arbitrary
 * object's `then` property. The derived Promise is always rejection-handled.
 *
 * @param {unknown} value
 * @param {() => void} onRejected
 * @returns {boolean}
 */
function observeNativePromiseRejection(value, onRejected) {
  try {
    Promise.prototype.then.call(value, undefined, onRejected);
    return true;
  } catch {
    return false;
  }
}
