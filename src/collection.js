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
 * @param {readonly T[]} values
 * @param {ReadonlySet<K>} excluded
 * @param {(value: T) => K} [toKey]
 * @returns {T[]}
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
