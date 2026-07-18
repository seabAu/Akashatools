import { plainObjectOptionsErrorMessage } from "./internal/error-messages.js";
import { isPlainObject } from "./object.js";

/** @typedef {"asc" | "desc"} SortDirection */
/** @typedef {"first" | "last"} NullPlacement */

/** @type {Intl.Collator | undefined} */
let defaultCollator;
const defaultNumericOrderKeys = ["showIndex", "index", "order"];

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
export function sortBy(
  values,
  toKey = /** @type {(value: T) => K} */ ((value) => /** @type {K} */ (/** @type {unknown} */ (value))),
  options = {},
) {
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
  const { direction = "asc", nulls = "last", compare = compareValues } = options;
  return sortByMany(values, [{ toKey, direction, nulls, compare }]);
}

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
export function sortByMany(values, criteria) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  if (!Array.isArray(criteria) || criteria.length === 0) throw new TypeError("criteria must be a non-empty array.");
  const normalizedCriteria = criteria.map((criterion, index) => {
    if (!isPlainObject(criterion)) throw new TypeError(`criteria[${index}] must be a plain object.`);
    const { toKey, direction = "asc", nulls = "last", compare = compareValues } = criterion;
    if (typeof toKey !== "function") throw new TypeError(`criteria[${index}].toKey must be a function.`);
    if (typeof compare !== "function") throw new TypeError(`criteria[${index}].compare must be a function.`);
    if (direction !== "asc" && direction !== "desc") throw new TypeError(`Unsupported sort direction: ${direction}`);
    if (nulls !== "first" && nulls !== "last") throw new TypeError(`Unsupported null placement: ${nulls}`);
    return { toKey, direction, nulls, compare };
  });

  return [...values]
    .map((value, index) => ({
      value,
      index,
      keys: normalizedCriteria.map(({ toKey }) => toKey(value, index)),
    }))
    .toSorted((left, right) => {
      for (let index = 0; index < normalizedCriteria.length; index += 1) {
        const { direction, nulls, compare } = normalizedCriteria[index];
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
 * @param {Intl.LocalesArgument} [locales] Locale or locale preference list accepted by Intl.Collator.
 * @param {Intl.CollatorOptions} [options] Collation policy; defaults to numeric, case-insensitive comparison.
 * @returns {(left: unknown, right: unknown) => number} Reusable comparator that stringifies values.
 * @throws {RangeError} If Intl rejects a locale or option value.
 * @example
 * const natural = createCollatorComparator("en", { numeric: true });
 * @since 2.0.0
 */
export function createCollatorComparator(locales, options = { numeric: true, sensitivity: "base" }) {
  const collator = new Intl.Collator(locales, options);
  return (left, right) => collator.compare(String(left), String(right));
}

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
export function compareValues(left, right) {
  if (Object.is(left, right)) return 0;
  if ((left === null || left === undefined) && (right === null || right === undefined)) return 0;
  if (left === null || left === undefined) return 1;
  if (right === null || right === undefined) return -1;
  const leftRank = comparisonRank(left);
  const rightRank = comparisonRank(right);
  if (leftRank !== rightRank) return leftRank - rightRank;
  if (leftRank === 0)
    return compareNumericValues(/** @type {number | bigint} */ (left), /** @type {number | bigint} */ (right));
  if (leftRank === 1) return Number(left) - Number(right);
  if (leftRank === 2)
    return compareNumbers(/** @type {Date} */ (left).getTime(), /** @type {Date} */ (right).getTime());
  defaultCollator ??= new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
  return defaultCollator.compare(String(left), String(right));
}

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
export function compareNumericOrder(left, right, keys = defaultNumericOrderKeys) {
  assertOrderRecord(left, "left");
  assertOrderRecord(right, "right");
  const normalizedKeys = normalizeOrderKeys(keys);
  return compareNumericOrderKeys(left, right, normalizedKeys);
}

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
export function sortByNumericOrder(values, keys = defaultNumericOrderKeys) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  values.forEach((value, index) => assertOrderRecord(value, `values[${index}]`));
  const normalizedKeys = normalizeOrderKeys(keys);
  return values.toSorted((left, right) => compareNumericOrderKeys(left, right, normalizedKeys));
}

/** @param {Record<string, unknown>} left @param {Record<string, unknown>} right @param {readonly string[]} keys */
function compareNumericOrderKeys(left, right, keys) {
  for (const key of keys) {
    const leftOrder = finiteOrder(left[key]);
    const rightOrder = finiteOrder(right[key]);
    if (leftOrder === undefined || rightOrder === undefined) {
      if (leftOrder === rightOrder) continue;
      return leftOrder === undefined ? 1 : -1;
    }
    const result = compareNumbers(leftOrder, rightOrder);
    if (result !== 0) return result;
  }
  return 0;
}

/** @param {unknown} value */
function finiteOrder(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

/** @param {unknown} value */
function comparisonRank(value) {
  if (typeof value === "number" || typeof value === "bigint") return 0;
  if (typeof value === "boolean") return 1;
  if (value instanceof Date) return 2;
  if (typeof value === "string") return 3;
  return 4;
}

/** @param {number | bigint} left @param {number | bigint} right */
function compareNumericValues(left, right) {
  if (typeof left === "number" && Number.isNaN(left)) {
    return typeof right === "number" && Number.isNaN(right) ? 0 : 1;
  }
  if (typeof right === "number" && Number.isNaN(right)) return -1;
  return left < right ? -1 : left > right ? 1 : 0;
}

/** @param {unknown} value @param {string} name */
function assertOrderRecord(value, name) {
  if (!value || typeof value !== "object") throw new TypeError(`${name} must be an object.`);
}

/** @param {readonly string[]} keys */
function normalizeOrderKeys(keys) {
  if (!Array.isArray(keys) || keys.some((key) => typeof key !== "string")) {
    throw new TypeError("keys must be an array of strings.");
  }
  return [...keys];
}

/** @param {number} left @param {number} right */
function compareNumbers(left, right) {
  if (Number.isNaN(left)) return Number.isNaN(right) ? 0 : 1;
  if (Number.isNaN(right)) return -1;
  return left < right ? -1 : left > right ? 1 : 0;
}
