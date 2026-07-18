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
