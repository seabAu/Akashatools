/**
 * Maps values with a fixed concurrency ceiling. Results retain input order and
 * individual failures are represented like `Promise.allSettled`.
 *
 * @template T, R
 * @param {readonly T[]} values
 * @param {number} concurrency
 * @param {(value: T, index: number) => R | PromiseLike<R>} mapper
 * @returns {Promise<PromiseSettledResult<R>[]>}
 * @since 2.0.0
 */
export declare function mapSettledWithConcurrency<T, R>(values: readonly T[], concurrency: number, mapper: (value: T, index: number) => R | PromiseLike<R>): Promise<PromiseSettledResult<R>[]>;
/**
 * Extracts values from fulfilled settled results.
 *
 * @template T
 * @param {readonly PromiseSettledResult<T>[]} results
 * @returns {T[]}
 * @since 2.0.0
 */
export declare function fulfilledValues<T>(results: readonly PromiseSettledResult<T>[]): T[];
/**
 * Waits for a duration and optionally supports cancellation.
 *
 * @param {number} milliseconds
 * @param {{signal?: AbortSignal}} [options]
 * @returns {Promise<void>}
 * @since 2.0.0
 */
export declare function delay(milliseconds: number, { signal }?: {
    signal?: AbortSignal;
}): Promise<void>;
