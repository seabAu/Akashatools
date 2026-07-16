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
export declare function createSingleFlight<T>(loader: () => T | PromiseLike<T>, options?: {
    ttl?: number;
    now?: () => number;
    shouldCache?: (value: T) => boolean;
}): Readonly<{
    load: () => Promise<T>;
    invalidate: () => void;
}>;
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
export declare function createKeyedSingleFlight<K, V>(loader: (key: K) => V | PromiseLike<V>, options?: {
    ttl?: number;
    now?: () => number;
    shouldCache?: (value: V) => boolean;
    maximumSize?: number;
}): Readonly<{
    load: (key: K) => Promise<V>;
    invalidate: (key: K) => boolean;
    invalidateAll: () => number;
    readonly size: number;
}>;
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
export declare function mapSettledWithConcurrency<T, R>(values: readonly T[], concurrency: number, mapper: (value: T, index: number) => R | PromiseLike<R>): Promise<PromiseSettledResult<R>[]>;
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
export declare function fulfilledValues<T>(results: readonly PromiseSettledResult<T>[]): T[];
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
export declare function delay(milliseconds: number, { signal }?: {
    signal?: AbortSignal;
}): Promise<void>;
