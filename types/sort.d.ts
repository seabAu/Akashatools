/** @typedef {"asc" | "desc"} SortDirection */
/** @typedef {"first" | "last"} NullPlacement */
export type SortDirection = "asc" | "desc";
export type NullPlacement = "first" | "last";
/**
 * Returns a stably sorted copy based on a derived key. Nullish keys sort last.
 * Modern JavaScript guarantees stable `toSorted` behavior without mutating the
 * input array.
 *
 * @template T, K
 * @param {readonly T[]} values
 * @param {(value: T, index: number) => K} [toKey]
 * @param {{direction?: SortDirection, nulls?: NullPlacement, compare?: (left: K, right: K) => number}} [options]
 * @returns {T[]}
 * @since 2.0.0
 */
export declare function sortBy<T, K>(values: readonly T[], toKey?: (value: T, index: number) => K, { direction, nulls, compare }?: {
    direction?: SortDirection;
    nulls?: NullPlacement;
    compare?: (left: K, right: K) => number;
}): T[];
/**
 * Returns a stable copy ordered by multiple selector criteria. Criteria are
 * evaluated once per item and applied in array order. Sparse slots are treated
 * as `undefined` items and the result is dense.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {ReadonlyArray<{
 *   toKey: (value: T, index: number) => unknown,
 *   direction?: SortDirection,
 *   nulls?: NullPlacement,
 *   compare?: (left: any, right: any) => number
 * }>} criteria
 * @returns {T[]}
 * @since 2.0.0
 */
export declare function sortByMany<T>(values: readonly T[], criteria: ReadonlyArray<{
    toKey: (value: T, index: number) => unknown;
    direction?: SortDirection;
    nulls?: NullPlacement;
    compare?: (left: any, right: any) => number;
}>): T[];
/**
 * Creates a reusable locale-aware comparator. Reusing the returned function
 * avoids reconstructing collator options during repeated comparisons.
 *
 * @param {Intl.LocalesArgument} [locales]
 * @param {Intl.CollatorOptions} [options]
 * @returns {(left: unknown, right: unknown) => number}
 * @since 2.0.0
 */
export declare function createCollatorComparator(locales?: Intl.LocalesArgument, options?: Intl.CollatorOptions): (left: unknown, right: unknown) => number;
/**
 * Compares strings, numbers, bigints, booleans, and Dates with nullish values
 * ordered last. Other values fall back to locale-aware string comparison.
 *
 * @param {unknown} left
 * @param {unknown} right
 * @returns {number}
 * @since 2.0.0
 */
export declare function compareValues(left: unknown, right: unknown): number;
/**
 * Compares objects across the first available finite numeric ordering key.
 * Missing and invalid order values sort last. Number-like strings are coerced
 * intentionally for compatibility with persisted legacy ordering fields.
 *
 * @param {Record<string, unknown>} left
 * @param {Record<string, unknown>} right
 * @param {readonly string[]} [keys]
 * @returns {number}
 * @since 2.0.0
 */
export declare function compareNumericOrder(left: Record<string, unknown>, right: Record<string, unknown>, keys?: readonly string[]): number;
/**
 * Returns a stable copy ordered by common numeric position fields.
 *
 * @template {Record<string, unknown>} T
 * @param {readonly T[]} values
 * @param {readonly string[]} [keys]
 * @returns {T[]}
 * @since 2.0.0
 */
export declare function sortByNumericOrder<T extends Record<string, unknown>>(values: readonly T[], keys?: readonly string[]): T[];
