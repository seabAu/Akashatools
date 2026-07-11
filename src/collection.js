/**
 * Inserts or replaces a value by a derived identity, preserving immutability.
 *
 * @template T, K
 * @param {readonly T[]} values
 * @param {T} nextValue
 * @param {(value: T) => K} [toKey]
 * @param {{prepend?: boolean}} [options]
 * @returns {T[]}
 */
export function upsertBy(values, nextValue, toKey = /** @type {(value: T) => K} */ ((value) => /** @type {K} */ (/** @type {unknown} */ (value))), { prepend = true } = {}) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  if (typeof toKey !== "function") throw new TypeError("toKey must be a function.");

  const nextKey = toKey(nextValue);
  const index = values.findIndex((value) => Object.is(toKey(value), nextKey));
  if (index < 0) return prepend ? [nextValue, ...values] : [...values, nextValue];

  const result = [...values];
  result[index] = nextValue;
  return result;
}

/**
 * Excludes values whose derived identities occur in a Set.
 *
 * @template T, K
 * @param {readonly T[]} values
 * @param {ReadonlySet<K>} excluded
 * @param {(value: T) => K} [toKey]
 * @returns {T[]}
 */
export function excludeBy(values, excluded, toKey = /** @type {(value: T) => K} */ ((value) => /** @type {K} */ (/** @type {unknown} */ (value)))) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  if (!(excluded instanceof Set)) throw new TypeError("excluded must be a Set.");
  if (typeof toKey !== "function") throw new TypeError("toKey must be a function.");
  return excluded.size === 0 ? [...values] : values.filter((value) => !excluded.has(toKey(value)));
}

/**
 * Inserts or replaces an object by its `id` property.
 * @template {{id: unknown}} T
 * @param {readonly T[]} values
 * @param {T} nextValue
 * @returns {T[]}
 * @deprecated Prefer `upsertBy` with an explicit key selector.
 */
export const upsertById = (values, nextValue) => upsertBy(values, nextValue, ({ id }) => id);

/**
 * Excludes objects whose `id` properties occur in a Set.
 * @template {{id: K}} T
 * @template K
 * @param {readonly T[]} values
 * @param {ReadonlySet<K>} excluded
 * @returns {T[]}
 * @deprecated Prefer `excludeBy` with an explicit key selector.
 */
export const excludeIds = (values, excluded) => excludeBy(values, excluded, ({ id }) => id);
