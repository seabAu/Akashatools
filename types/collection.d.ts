/**
 * Inserts or replaces a value by a derived identity, preserving immutability.
 * Keys are compared with `Object.is`; numeric keys are never treated as indices.
 * Sparse slots are treated as `undefined` items and returned arrays are dense.
 *
 * @template T, K
 * @param {readonly T[]} values
 * @param {T} nextValue
 * @param {(value: T) => K} [toKey]
 * @param {{prepend?: boolean}} [options]
 * @returns {T[]}
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
 * @param {readonly T[]} values
 * @param {ReadonlySet<K>} excluded
 * @param {(value: T) => K} [toKey]
 * @returns {T[]}
 * @since 2.0.0
 */
export declare function excludeBy<T, K>(values: readonly T[], excluded: ReadonlySet<K>, toKey?: (value: T) => K): T[];
/**
 * Inserts or replaces an object by its `id` property.
 * @template {{id: unknown}} T
 * @param {readonly T[]} values
 * @param {T} nextValue
 * @returns {T[]}
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
 * @param {readonly T[]} values
 * @param {ReadonlySet<K>} excluded
 * @returns {T[]}
 * @deprecated Prefer `excludeBy` with an explicit key selector.
 * @since 2.0.0
 */
export declare const excludeIds: <T extends {
    id: K;
}, K>(values: readonly T[], excluded: ReadonlySet<K>) => T[];
