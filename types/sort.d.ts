export type SortDirection = "asc" | "desc";
export type NullPlacement = "first" | "last";
/**
 * Returns a stably sorted copy based on a derived key. Nullish keys sort last.
 * Modern JavaScript guarantees stable `toSorted` behavior without mutating the
 * input array.
 *
 * @template T, K
 * @param {readonly T[]} values Values to copy and sort; sparse slots become undefined items.
 * @param {(value: T, index: number) => K} [toKey] Key selector evaluated once per item.
 * @param {{direction?: SortDirection, nulls?: NullPlacement, compare?: (left: K, right: K) => number}} [options] Direction, null placement, and finite comparator policy.
 * @returns {T[]} Dense stably sorted copy.
 * @throws {TypeError} If values, selector, options, or comparator results are invalid.
 * @example
 * sortBy(users, ({ name }) => name);
 * @since 2.0.0
 */
export declare function sortBy<T, K>(values: readonly T[], toKey?: (value: T, index: number) => K, options?: {
    direction?: SortDirection;
    nulls?: NullPlacement;
    compare?: (left: K, right: K) => number;
}): T[];
/**
 * Returns a stable copy ordered by multiple selector criteria. Criteria are
 * snapshotted once, evaluated once per item, and applied in array order. Sparse
 * slots are treated as `undefined` items and the result is dense.
 *
 * @template T
 * @param {readonly T[]} values Values to copy and sort; sparse slots become undefined items.
 * @param {ReadonlyArray<{toKey: (value: T, index: number) => unknown, direction?: SortDirection, nulls?: NullPlacement, compare?: (left: any, right: any) => number}>} criteria Ordered non-empty selector criteria evaluated once per item.
 * @returns {T[]} Dense stably sorted copy using criteria in priority order.
 * @throws {TypeError} If values, criteria, selectors, policies, or comparator results are invalid.
 * @example
 * sortByMany(users, [{ toKey: ({ team }) => team }, { toKey: ({ rank }) => rank }]);
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
 * @param {Intl.LocalesArgument} [locales] Locale or locale preference list accepted by Intl.Collator.
 * @param {Intl.CollatorOptions} [options] Collation policy; defaults to numeric, case-insensitive comparison.
 * @returns {(left: unknown, right: unknown) => number} Reusable comparator that stringifies values.
 * @throws {RangeError} If Intl rejects a locale or option value.
 * @example
 * const natural = createCollatorComparator("en", { numeric: true });
 * @since 2.0.0
 */
export declare function createCollatorComparator(locales?: Intl.LocalesArgument, options?: Intl.CollatorOptions): (left: unknown, right: unknown) => number;
/**
 * Compares numbers/bigints, booleans, Dates, strings, and then other values in
 * that deterministic type order, with nullish values ordered last. Values in
 * the final group fall back to locale-aware string comparison.
 *
 * Invalid Dates and NaN sort after their valid peers. Numeric and Date results
 * are normalized to -1, 0, or 1 so extreme values remain valid comparators.
 *
 * @param {unknown} left Left comparison value.
 * @param {unknown} right Right comparison value.
 * @returns {number} Negative, zero, or positive ordering signal.
 * @throws {RangeError} If the runtime's default Intl.Collator cannot be constructed.
 * @example
 * ["item10", "item2"].toSorted(compareValues); // ["item2", "item10"]
 * @since 2.0.0
 */
export declare function compareValues(left: unknown, right: unknown): number;
/**
 * Compares objects across the first available finite numeric ordering key.
 * Missing and invalid order values sort last. Number-like strings are coerced
 * intentionally for compatibility with persisted legacy ordering fields.
 *
 * @param {Record<string, unknown>} left Left object containing possible order fields.
 * @param {Record<string, unknown>} right Right object containing possible order fields.
 * @param {readonly string[]} [keys] Priority-ordered field names to inspect.
 * @returns {number} Numeric ordering signal; zero when all normalized fields tie.
 * @throws {TypeError} If either value is not an object or keys is not an array.
 * @example
 * compareNumericOrder({ order: 1 }, { order: 2 }); // negative
 * @since 2.0.0
 */
export declare function compareNumericOrder(left: Record<string, unknown>, right: Record<string, unknown>, keys?: readonly string[]): number;
/**
 * Returns a stable copy ordered by common numeric position fields.
 *
 * @template {Record<string, unknown>} T
 * @param {readonly T[]} values Objects to copy and sort.
 * @param {readonly string[]} [keys] Priority-ordered numeric field names.
 * @returns {T[]} Stable sorted copy with absent/invalid order fields last.
 * @throws {TypeError} If values, their items, or keys do not match their contracts.
 * @example
 * sortByNumericOrder([{ order: 2 }, { order: 1 }]);
 * @since 2.0.0
 */
export declare function sortByNumericOrder<T extends Record<string, unknown>>(values: readonly T[], keys?: readonly string[]): T[];
