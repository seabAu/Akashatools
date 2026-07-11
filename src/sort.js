/** @typedef {"asc" | "desc"} SortDirection */

/**
 * Returns a stably sorted copy based on a derived key. Nullish keys sort last.
 * Modern JavaScript guarantees stable `toSorted` behavior without mutating the
 * input array.
 *
 * @template T, K
 * @param {readonly T[]} values
 * @param {(value: T, index: number) => K} [toKey]
 * @param {{direction?: SortDirection, compare?: (left: K, right: K) => number}} [options]
 * @returns {T[]}
 */
export function sortBy(values, toKey = /** @type {(value: T) => K} */ ((value) => /** @type {K} */ (/** @type {unknown} */ (value))), { direction = "asc", compare = compareValues } = {}) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  if (typeof toKey !== "function") throw new TypeError("toKey must be a function.");
  if (typeof compare !== "function") throw new TypeError("compare must be a function.");
  if (direction !== "asc" && direction !== "desc") throw new TypeError(`Unsupported sort direction: ${direction}`);

  const multiplier = direction === "asc" ? 1 : -1;
  return values
    .map((value, index) => ({ value, index, key: toKey(value, index) }))
    .toSorted((left, right) => {
      if (left.key === null || left.key === undefined) return right.key === null || right.key === undefined ? left.index - right.index : 1;
      if (right.key === null || right.key === undefined) return -1;
      return multiplier * compare(left.key, right.key) || left.index - right.index;
    })
    .map(({ value }) => value);
}

/**
 * Compares strings, numbers, bigints, booleans, and Dates with nullish values
 * ordered last. Other values fall back to locale-aware string comparison.
 *
 * @param {unknown} left
 * @param {unknown} right
 * @returns {number}
 */
export function compareValues(left, right) {
  if (Object.is(left, right)) return 0;
  if (left === null || left === undefined) return 1;
  if (right === null || right === undefined) return -1;
  if (left instanceof Date && right instanceof Date) return left.getTime() - right.getTime();
  if (typeof left === "number" && typeof right === "number") {
    if (Number.isNaN(left)) return Number.isNaN(right) ? 0 : 1;
    if (Number.isNaN(right)) return -1;
    return left - right;
  }
  if (typeof left === "bigint" && typeof right === "bigint") return left < right ? -1 : 1;
  if (typeof left === "boolean" && typeof right === "boolean") return Number(left) - Number(right);
  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Compares objects across the first available finite numeric ordering key.
 * Missing and invalid order values sort last.
 *
 * @param {Record<string, unknown>} left
 * @param {Record<string, unknown>} right
 * @param {readonly string[]} [keys]
 * @returns {number}
 */
export function compareNumericOrder(left, right, keys = ["showIndex", "index", "order"]) {
  if (!left || typeof left !== "object" || !right || typeof right !== "object") {
    throw new TypeError("left and right must be objects.");
  }
  if (!Array.isArray(keys)) throw new TypeError("keys must be an array.");

  for (const key of keys) {
    const difference = finiteOrder(left[key]) - finiteOrder(right[key]);
    if (difference !== 0) return difference;
  }
  return 0;
}

/**
 * Returns a stable copy ordered by common numeric position fields.
 *
 * @template {Record<string, unknown>} T
 * @param {readonly T[]} values
 * @param {readonly string[]} [keys]
 * @returns {T[]}
 */
export function sortByNumericOrder(values, keys) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  return values.toSorted((left, right) => compareNumericOrder(left, right, keys));
}

/** @param {unknown} value */
function finiteOrder(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : Number.MAX_SAFE_INTEGER;
}
