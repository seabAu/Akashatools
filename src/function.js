import { plainObjectOptionsErrorMessage } from "./internal/error-messages.js";
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
/** @typedef {{set: (callback: () => void, milliseconds: number) => unknown, clear: (handle: unknown) => void}} TimerScheduler */
/** @template Result @typedef {{cancel: (reason?: unknown) => boolean, flush: () => Promise<Awaited<Result>> | undefined, readonly pending: boolean}} ScheduledControls */
/**
 * @typedef {object} DebounceOptions
 * @property {TimerScheduler} [scheduler] Injectable timer scheduler whose callbacks run after `set` returns.
 */
/**
 * @typedef {object} ThrottleOptions
 * @property {boolean} [leading=true] Whether the first call outside a cooldown invokes immediately.
 * @property {boolean} [trailing=true] Whether calls inside a cooldown queue one latest-arguments invocation.
 * @property {TimerScheduler} [scheduler] Injectable timer scheduler whose callbacks run after `set` returns.
 */

const defaultTimerScheduler = Object.freeze({
  set: (/** @type {() => void} */ callback, /** @type {number} */ milliseconds) => setTimeout(callback, milliseconds),
  clear: (/** @type {unknown} */ handle) => clearTimeout(/** @type {ReturnType<typeof setTimeout>} */ (handle)),
});

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
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
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
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
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
 * Creates a trailing debounce wrapper whose calls in one quiet-period batch
 * share one Promise. The latest call's receiver and arguments are used when the
 * timer elapses. Synchronous callback returns, throws, and Promise-like results
 * become fulfillment or rejection of that shared Promise.
 *
 * `cancel` rejects work that has not started and returns whether anything was
 * pending. `flush` starts pending work immediately and returns its existing
 * Promise, or `undefined` when idle. Neither operation can cancel a callback
 * after it starts. Timer creation occurs only when the wrapper is called.
 *
 * @template This
 * @template {unknown[]} Args
 * @template Result
 * @param {(this: This, ...args: Args) => Result} callback Function invoked after calls remain quiet for wait milliseconds.
 * @param {number} wait Finite timer delay from 0 through 2,147,483,647 milliseconds.
 * @param {DebounceOptions} [options] Optional timer injection for deterministic hosts/tests.
 * @returns {((this: This, ...args: Args) => Promise<Awaited<Result>>) & ScheduledControls<Result>} Promise-returning debounced wrapper with non-enumerable controls.
 * @throws {TypeError} If callback, options, or scheduler are invalid.
 * @throws {RangeError} If wait is outside the supported host timer range.
 * @example
 * const save = debounce(writeDraft, 250);
 * await save(latestDraft);
 * @since 2.0.0
 */
export function debounce(callback, wait, options = {}) {
  assertScheduledArguments(callback, wait, options);
  const scheduler = readTimerScheduler(options);
  let timerActive = false;
  /** @type {unknown} */
  let timerHandle;
  let generation = 0;
  /** @type {ReturnType<typeof createDeferred> | undefined} */
  let pending;
  /** @type {This} */
  let latestReceiver;
  /** @type {Args} */
  let latestArgs;

  function clearScheduledTimer() {
    if (!timerActive) return undefined;
    generation += 1;
    timerActive = false;
    const handle = timerHandle;
    timerHandle = undefined;
    try {
      scheduler.clear(handle);
      return undefined;
    } catch (error) {
      return error;
    }
  }

  function invokePending() {
    const current = pending;
    if (!current) return undefined;
    const receiver = latestReceiver;
    const args = latestArgs;
    pending = undefined;
    try {
      current.resolve(Reflect.apply(callback, receiver, args));
    } catch (error) {
      current.reject(error);
    }
    return current.promise;
  }

  function schedulePending() {
    generation += 1;
    const scheduledGeneration = generation;
    let fired = false;
    try {
      const handle = scheduler.set(() => {
        fired = true;
        if (generation !== scheduledGeneration) return;
        timerActive = false;
        timerHandle = undefined;
        invokePending();
      }, wait);
      if (!fired) {
        timerHandle = handle;
        timerActive = true;
      }
      return undefined;
    } catch (error) {
      timerActive = false;
      timerHandle = undefined;
      return error;
    }
  }

  /** @type {(this: This, ...args: Args) => Promise<Awaited<Result>>} */
  function debouncedCall(...args) {
    latestReceiver = this;
    latestArgs = args;
    pending ??= createDeferred();
    const promise = pending.promise;
    const clearError = clearScheduledTimer();
    const scheduleError = clearError ?? schedulePending();
    if (scheduleError !== undefined) {
      const current = pending;
      pending = undefined;
      current?.reject(scheduleError);
    }
    return promise;
  }

  const debounced =
    /** @type {((this: This, ...args: Args) => Promise<Awaited<Result>>) & ScheduledControls<Result>} */ (
      /** @type {unknown} */ (debouncedCall)
    );
  Object.defineProperties(debounced, {
    cancel: {
      value: (/** @type {unknown} */ reason) => {
        if (!pending && !timerActive) return false;
        const clearError = clearScheduledTimer();
        const current = pending;
        pending = undefined;
        current?.reject(clearError ?? cancellationReason(reason));
        return true;
      },
    },
    flush: {
      value: () => {
        if (!pending) return undefined;
        const promise = pending.promise;
        const clearError = clearScheduledTimer();
        if (clearError !== undefined) {
          const current = pending;
          pending = undefined;
          current?.reject(clearError);
        } else invokePending();
        return promise;
      },
    },
    pending: { get: () => pending !== undefined },
  });
  return debounced;
}

/**
 * Creates a Promise-returning throttle with explicit leading/trailing policy.
 * At most one callback starts per wait window. A leading call invokes after its
 * cooldown timer is established; calls suppressed during that window either
 * share one latest-arguments trailing Promise or, when trailing is disabled,
 * receive the exact Promise from the most recent invocation.
 *
 * A trailing invocation begins a new cooldown at its start. `pending` reports a
 * queued trailing invocation rather than a cooldown by itself. `flush` starts a
 * queued trailing invocation immediately; `cancel` rejects queued work and
 * resets the cooldown. Neither operation cancels work that already started.
 * An injected scheduler failure rejects queued work; if `cancel` only clears a
 * cooldown and has no queued Promise to reject, it propagates the clear error.
 *
 * @template This
 * @template {unknown[]} Args
 * @template Result
 * @param {(this: This, ...args: Args) => Result} callback Function rate-limited without changing its dynamic receiver.
 * @param {number} wait Finite cooldown from 0 through 2,147,483,647 milliseconds.
 * @param {ThrottleOptions} [options] Leading/trailing policy and optional timer injection.
 * @returns {((this: This, ...args: Args) => Promise<Awaited<Result>>) & ScheduledControls<Result>} Promise-returning throttled wrapper with non-enumerable controls.
 * @throws {TypeError} If callback, options, booleans, or scheduler are invalid, or both edges are disabled.
 * @throws {RangeError} If wait is outside the supported host timer range.
 * @throws {Error} If an injected scheduler throws while `cancel` clears a cooldown with no queued work.
 * @example
 * const update = throttle(renderPosition, 16, { leading: true, trailing: true });
 * await update(position);
 * @since 2.0.0
 */
export function throttle(callback, wait, options = {}) {
  assertScheduledArguments(callback, wait, options);
  const { leading = true, trailing = true } = options;
  if (typeof leading !== "boolean") throw new TypeError("leading must be a boolean.");
  if (typeof trailing !== "boolean") throw new TypeError("trailing must be a boolean.");
  if (!leading && !trailing) throw new TypeError("leading and trailing cannot both be false.");
  const scheduler = readTimerScheduler(options);

  let cooling = false;
  /** @type {unknown} */
  let timerHandle;
  let generation = 0;
  /** @type {ReturnType<typeof createDeferred> | undefined} */
  let trailingPending;
  /** @type {This} */
  let latestReceiver;
  /** @type {Args} */
  let latestArgs;
  /** @type {Promise<Awaited<Result>> | undefined} */
  let lastInvocation;

  function clearCooldown() {
    if (!cooling) return undefined;
    generation += 1;
    cooling = false;
    const handle = timerHandle;
    timerHandle = undefined;
    try {
      scheduler.clear(handle);
      return undefined;
    } catch (error) {
      return error;
    }
  }

  /** @param {This} receiver @param {Args} args @returns {Promise<Awaited<Result>>} */
  function invoke(receiver, args) {
    try {
      return Promise.resolve(Reflect.apply(callback, receiver, args));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  function invokeTrailing() {
    const current = trailingPending;
    if (!current) return undefined;
    const receiver = latestReceiver;
    const args = latestArgs;
    trailingPending = undefined;
    const scheduleError = scheduleCooldown();
    if (scheduleError !== undefined) {
      current.reject(scheduleError);
      return current.promise;
    }
    lastInvocation = invoke(receiver, args);
    lastInvocation.then(current.resolve, current.reject);
    return current.promise;
  }

  function onCooldownEnd() {
    cooling = false;
    timerHandle = undefined;
    invokeTrailing();
  }

  function scheduleCooldown() {
    generation += 1;
    const scheduledGeneration = generation;
    let fired = false;
    try {
      const handle = scheduler.set(() => {
        fired = true;
        if (generation === scheduledGeneration) onCooldownEnd();
      }, wait);
      if (!fired) {
        timerHandle = handle;
        cooling = true;
      }
      return undefined;
    } catch (error) {
      cooling = false;
      timerHandle = undefined;
      return error;
    }
  }

  /** @type {(this: This, ...args: Args) => Promise<Awaited<Result>>} */
  function throttledCall(...args) {
    if (!cooling) {
      if (leading) {
        const scheduleError = scheduleCooldown();
        if (scheduleError !== undefined) return Promise.reject(scheduleError);
        lastInvocation = invoke(this, args);
        return lastInvocation;
      }
      latestReceiver = this;
      latestArgs = args;
      trailingPending = createDeferred();
      const promise = trailingPending.promise;
      const scheduleError = scheduleCooldown();
      if (scheduleError !== undefined) {
        const current = trailingPending;
        trailingPending = undefined;
        current.reject(scheduleError);
      }
      return promise;
    }

    if (!trailing) return /** @type {Promise<Awaited<Result>>} */ (lastInvocation);
    latestReceiver = this;
    latestArgs = args;
    trailingPending ??= createDeferred();
    return trailingPending.promise;
  }

  const throttled =
    /** @type {((this: This, ...args: Args) => Promise<Awaited<Result>>) & ScheduledControls<Result>} */ (
      /** @type {unknown} */ (throttledCall)
    );
  Object.defineProperties(throttled, {
    cancel: {
      value: (/** @type {unknown} */ reason) => {
        if (!cooling && !trailingPending) return false;
        const clearError = clearCooldown();
        const current = trailingPending;
        trailingPending = undefined;
        current?.reject(clearError ?? cancellationReason(reason));
        lastInvocation = undefined;
        if (clearError !== undefined && !current) throw clearError;
        return true;
      },
    },
    flush: {
      value: () => {
        if (!trailingPending) return undefined;
        const promise = trailingPending.promise;
        const clearError = clearCooldown();
        if (clearError !== undefined) {
          const current = trailingPending;
          trailingPending = undefined;
          current.reject(clearError);
        } else invokeTrailing();
        return promise;
      },
    },
    pending: { get: () => trailingPending !== undefined },
  });
  return throttled;
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

/** @param {unknown} callback @param {unknown} wait @param {unknown} options */
function assertScheduledArguments(callback, wait, options) {
  if (typeof callback !== "function") throw new TypeError("callback must be a function.");
  if (typeof wait !== "number" || !Number.isFinite(wait) || wait < 0 || wait > 2_147_483_647) {
    throw new RangeError("wait must be between 0 and 2147483647 milliseconds.");
  }
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
}

/** @param {Record<PropertyKey, unknown>} options @returns {TimerScheduler} */
function readTimerScheduler(options) {
  const scheduler = options.scheduler ?? defaultTimerScheduler;
  const candidate = /** @type {any} */ (scheduler);
  if (
    scheduler === null ||
    typeof scheduler !== "object" ||
    typeof candidate.set !== "function" ||
    typeof candidate.clear !== "function"
  ) {
    throw new TypeError("scheduler must provide set and clear functions.");
  }
  return /** @type {TimerScheduler} */ (candidate);
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((accept, decline) => {
    resolve = accept;
    reject = decline;
  });
  return {
    promise,
    resolve: /** @type {(value: any) => void} */ (/** @type {unknown} */ (resolve)),
    reject: /** @type {(reason?: unknown) => void} */ (/** @type {unknown} */ (reject)),
  };
}

/** @param {unknown} reason */
function cancellationReason(reason) {
  if (reason !== undefined) return reason;
  const error = new Error("Scheduled call cancelled.");
  error.name = "AbortError";
  return error;
}
