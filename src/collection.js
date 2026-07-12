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
export function upsertBy(values, nextValue, toKey = /** @type {(value: T) => K} */ ((value) => /** @type {K} */ (/** @type {unknown} */ (value))), { prepend = true } = {}) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  if (typeof toKey !== "function") throw new TypeError("toKey must be a function.");
  if (typeof prepend !== "boolean") throw new TypeError("prepend must be a boolean.");

  const denseValues = [...values];
  const nextKey = toKey(nextValue);
  const index = denseValues.findIndex((value) => Object.is(toKey(value), nextKey));
  if (index < 0) return prepend ? [nextValue, ...denseValues] : [...denseValues, nextValue];

  const result = [...denseValues];
  result[index] = nextValue;
  return result;
}

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
export function excludeBy(values, excluded, toKey = /** @type {(value: T) => K} */ ((value) => /** @type {K} */ (/** @type {unknown} */ (value)))) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  if (!(excluded instanceof Set)) throw new TypeError("excluded must be a Set.");
  if (typeof toKey !== "function") throw new TypeError("toKey must be a function.");
  const denseValues = [...values];
  return excluded.size === 0 ? denseValues : denseValues.filter((value) => !excluded.has(toKey(value)));
}

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
export const upsertById = (values, nextValue) => upsertBy(values, nextValue, ({ id }) => id);

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
export const excludeIds = (values, excluded) => excludeBy(values, excluded, ({ id }) => id);
