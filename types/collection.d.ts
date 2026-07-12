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
