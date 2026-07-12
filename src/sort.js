/** @typedef {"asc" | "desc"} SortDirection */
/** @typedef {"first" | "last"} NullPlacement */

/** @type {Intl.Collator | undefined} */
let defaultCollator;

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
export function sortBy(values, toKey = /** @type {(value: T) => K} */ ((value) => /** @type {K} */ (/** @type {unknown} */ (value))), { direction = "asc", nulls = "last", compare = compareValues } = {}) {
  return sortByMany(values, [{ toKey, direction, nulls, compare }]);
}

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
export function sortByMany(values, criteria) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  if (!Array.isArray(criteria) || criteria.length === 0) throw new TypeError("criteria must be a non-empty array.");
  criteria.forEach(({ toKey, direction = "asc", nulls = "last", compare = compareValues }, index) => {
    if (typeof toKey !== "function") throw new TypeError(`criteria[${index}].toKey must be a function.`);
    if (typeof compare !== "function") throw new TypeError(`criteria[${index}].compare must be a function.`);
    if (direction !== "asc" && direction !== "desc") throw new TypeError(`Unsupported sort direction: ${direction}`);
    if (nulls !== "first" && nulls !== "last") throw new TypeError(`Unsupported null placement: ${nulls}`);
  });

  return [...values]
    .map((value, index) => ({ value, index, keys: criteria.map(({ toKey }) => toKey(value, index)) }))
    .toSorted((left, right) => {
      for (let index = 0; index < criteria.length; index += 1) {
        const { direction = "asc", nulls = "last", compare = compareValues } = criteria[index];
        const leftKey = left.keys[index];
        const rightKey = right.keys[index];
        const leftNullish = leftKey === null || leftKey === undefined;
        const rightNullish = rightKey === null || rightKey === undefined;
        if (leftNullish || rightNullish) {
          if (leftNullish && rightNullish) continue;
          return leftNullish === (nulls === "first") ? -1 : 1;
        }
        const result = compare(leftKey, rightKey);
        if (!Number.isFinite(result)) throw new TypeError(`criteria[${index}].compare must return a finite number.`);
        if (result !== 0) return direction === "asc" ? result : -result;
      }
      return left.index - right.index;
    })
    .map(({ value }) => value);
}

/**
 * Creates a reusable locale-aware comparator. Reusing the returned function
 * avoids reconstructing collator options during repeated comparisons.
 *
 * @param {Intl.LocalesArgument} [locales]
 * @param {Intl.CollatorOptions} [options]
 * @returns {(left: unknown, right: unknown) => number}
 * @since 2.0.0
 */
export function createCollatorComparator(locales, options = { numeric: true, sensitivity: "base" }) {
  const collator = new Intl.Collator(locales, options);
  return (left, right) => collator.compare(String(left), String(right));
}

/**
 * Compares strings, numbers, bigints, booleans, and Dates with nullish values
 * ordered last. Other values fall back to locale-aware string comparison.
 *
 * @param {unknown} left
 * @param {unknown} right
 * @returns {number}
 * @since 2.0.0
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
  defaultCollator ??= new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
  return defaultCollator.compare(String(left), String(right));
}

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
 * @since 2.0.0
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
