/**
 * Computes Jaccard similarity for two finite iterables as the size of their
 * intersection divided by the size of their union. Values are materialized as
 * Sets, so duplicates do not add weight and equality uses SameValueZero object
 * identity. Two empty inputs have similarity 1.
 *
 * Each iterable is consumed once, from left to right. The combined number of
 * yielded items is bounded even when duplicate values collapse in the Sets.
 * Strings are accepted as iterables of Unicode code points. Weighted or
 * multiset similarity is deliberately outside this contract.
 *
 * @template L, R
 * @param {Iterable<L>} left First finite iterable.
 * @param {Iterable<R>} right Second finite iterable.
 * @param {{maximumItems?: number}} [options] Plain options object with a non-negative safe-integer combined iteration limit.
 * @returns {number} Similarity in the inclusive range 0..1.
 * @throws {TypeError} If either input is not iterable or options is not a plain object.
 * @throws {RangeError} If maximumItems is invalid or the combined iteration limit is exceeded.
 * @example
 * jaccardSimilarity(new Set(["a", "b"]), new Set(["b", "c"])); // 1 / 3
 * @since 2.0.0
 */
export declare function jaccardSimilarity<L, R>(left: Iterable<L>, right: Iterable<R>, options?: {
    maximumItems?: number;
}): number;
/**
 * Inserts or replaces a value by a derived identity, preserving immutability.
 * Keys are compared with `Object.is`; numeric keys are never treated as indices.
 * Sparse slots are treated as `undefined` items and returned arrays are dense.
 *
 * @template T, K
 * @param {readonly T[]} values Existing values left unmodified.
 * @param {T} nextValue Value to insert or replace by identity.
 * @param {(value: T) => K} [toKey] Identity selector; defaults to each value itself.
 * @param {{prepend?: boolean}} [options] Whether an unmatched value is prepended instead of appended.
 * @returns {T[]} Dense copied array containing the upserted value.
 * @throws {TypeError} If values, toKey, or prepend does not match its contract.
 * @example
 * upsertBy([{ id: 1, name: "old" }], { id: 1, name: "new" }, ({ id }) => id);
 * @since 2.0.0
 */
export declare function upsertBy<T, K>(values: readonly T[], nextValue: T, toKey?: (value: T) => K, { prepend }?: {
    prepend?: boolean;
}): T[];
/**
 * Excludes values whose derived identities occur in a Set. Numeric keys are
 * never treated as indices. Sparse slots are treated as `undefined` items and
 * returned arrays are dense.
 *
 * @template T, K
 * @param {readonly T[]} values Existing values left unmodified.
 * @param {ReadonlySet<K>} excluded Identities to remove.
 * @param {(value: T) => K} [toKey] Identity selector; defaults to each value itself.
 * @returns {T[]} Dense copied array without excluded identities.
 * @throws {TypeError} If values, excluded, or toKey does not match its contract.
 * @example
 * excludeBy(users, new Set([blockedId]), ({ id }) => id);
 * @since 2.0.0
 */
export declare function excludeBy<T, K>(values: readonly T[], excluded: ReadonlySet<K>, toKey?: (value: T) => K): T[];
/**
 * Inserts or replaces an object by its `id` property.
 * @template {{id: unknown}} T
 * @param {readonly T[]} values Objects with identity-bearing id properties.
 * @param {T} nextValue Object to insert or replace by id.
 * @returns {T[]} Copied array containing the upserted object.
 * @throws {TypeError} If delegated upsert arguments are invalid.
 * @example
 * upsertById([{ id: 1 }], { id: 1, active: true });
 * @deprecated Prefer `upsertBy` with an explicit key selector.
 * @since 2.0.0
 */
export declare const upsertById: <T extends {
    id: unknown;
}>(values: readonly T[], nextValue: T) => T[];
/**
 * Excludes objects whose `id` properties occur in a Set.
 * @template {{id: K}} T
 * @template K
 * @param {readonly T[]} values Objects with identity-bearing id properties.
 * @param {ReadonlySet<K>} excluded Id values to remove.
 * @returns {T[]} Copied array without objects carrying excluded ids.
 * @throws {TypeError} If delegated exclusion arguments are invalid.
 * @example
 * excludeIds(users, new Set([archivedUserId]));
 * @deprecated Prefer `excludeBy` with an explicit key selector.
 * @since 2.0.0
 */
export declare const excludeIds: <T extends {
    id: K;
}, K>(values: readonly T[], excluded: ReadonlySet<K>) => T[];
