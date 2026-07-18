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
export declare function createConcurrencyLimiter(maximumConcurrency: number, options?: {
    maximumPending?: number;
}): Readonly<{
    run: <T>(operation: () => T | PromiseLike<T>, options?: {
        signal?: AbortSignal;
    }) => Promise<T>;
    readonly activeCount: number;
    readonly pendingCount: number;
}>;
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
export declare function createKeyedConcurrencyLimiter(maximumConcurrency: number, maximumConcurrencyPerKey: number, options?: {
    maximumPending?: number;
}): Readonly<{
    run: <K, T>(key: K, operation: () => T | PromiseLike<T>, options?: {
        signal?: AbortSignal;
    }) => Promise<T>;
    activeFor: (key: unknown) => number;
    pendingFor: (key: unknown) => number;
    readonly activeCount: number;
    readonly pendingCount: number;
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
