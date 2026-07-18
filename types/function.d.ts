export type OnceOptions = {
    /**
     * Whether a synchronous throw returns the wrapper to its unused state.
     */
    retryOnThrow?: boolean;
    /**
     * Whether a rejected native Promise returns the wrapper to its unused state after settlement.
     */
    retryOnRejection?: boolean;
};
export type MemoizeOptions = {
    /**
     * Positive safe-integer least-recently-used cache bound.
     */
    maximumSize?: number;
    /**
     * Whether rejected native Promises remain cached after settlement.
     */
    cacheRejected?: boolean;
};
export type MemoizedControls<Key> = {
    clear: () => void;
    delete: (key: Key) => boolean;
    has: (key: Key) => boolean;
    readonly size: number;
};
export type TimerScheduler = {
    set: (callback: () => void, milliseconds: number) => unknown;
    clear: (handle: unknown) => void;
};
export type ScheduledControls<Result> = {
    cancel: (reason?: unknown) => boolean;
    flush: () => Promise<Awaited<Result>> | undefined;
    readonly pending: boolean;
};
export type DebounceOptions = {
    /**
     * Injectable timer scheduler whose callbacks run after `set` returns.
     */
    scheduler?: TimerScheduler;
};
export type ThrottleOptions = {
    /**
     * Whether the first call outside a cooldown invokes immediately.
     */
    leading?: boolean;
    /**
     * Whether calls inside a cooldown queue one latest-arguments invocation.
     */
    trailing?: boolean;
    /**
     * Injectable timer scheduler whose callbacks run after `set` returns.
     */
    scheduler?: TimerScheduler;
};
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
export declare function once<This, Args extends unknown[], Result>(callback: (this: This, ...args: Args) => Result, options?: OnceOptions): (this: This, ...args: Args) => Result;
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
export declare function memoize<This, Args extends unknown[], Result, Key>(callback: (this: This, ...args: Args) => Result, toKey: (this: This, ...args: Args) => Key, options?: MemoizeOptions): ((this: This, ...args: Args) => Result) & MemoizedControls<Key>;
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
export declare function debounce<This, Args extends unknown[], Result>(callback: (this: This, ...args: Args) => Result, wait: number, options?: DebounceOptions): ((this: This, ...args: Args) => Promise<Awaited<Result>>) & ScheduledControls<Result>;
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
export declare function throttle<This, Args extends unknown[], Result>(callback: (this: This, ...args: Args) => Result, wait: number, options?: ThrottleOptions): ((this: This, ...args: Args) => Promise<Awaited<Result>>) & ScheduledControls<Result>;
