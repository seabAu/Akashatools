import { assertRandomSource, sampleRandom } from "./internal/random-source.js";

/** @typedef {"auto" | "index" | "value" | "predicate"} RemovalMode */
const maximumRangeLength = 1_000_000;

/**
 * Returns the input when it is an array, preserving its identity and sparse
 * slots, or a fresh dense copy of the fallback otherwise.
 *
 * @template T
 * @param {unknown} value
 * @param {readonly T[]} [fallback=[]]
 * @returns {T[]}
 */
export function asArray(value, fallback = []) {
  return Array.isArray(value) ? value : [...fallback];
}

/**
 * Checks whether a value is an array containing at least one item.
 *
 * @template T
 * @param {unknown} value
 * @returns {value is T[]}
 */
export function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Removes nullish values from an array without removing `0`, `false`, or `""`.
 * Sparse slots are treated as `undefined` and therefore removed.
 *
 * @template T
 * @param {readonly (T | null | undefined)[]} values
 * @returns {T[]}
 */
export function compact(values) {
  assertArray(values, "values");
  return [...values].filter((value) => value !== null && value !== undefined);
}

/**
 * Splits an array into same-sized chunks. The final chunk may be shorter.
 * Sparse slots are treated as `undefined` items and returned chunks are dense.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {number} size
 * @returns {T[][]}
 */
export function chunk(values, size) {
  assertArray(values, "values");
  if (!Number.isSafeInteger(size) || size < 1) {
    throw new RangeError("size must be a positive safe integer.");
  }

  const denseValues = [...values];
  const chunks = [];
  for (let index = 0; index < denseValues.length; index += size) {
    chunks.push(denseValues.slice(index, index + size));
  }
  return chunks;
}

/**
 * Returns the first item for each unique key, preserving input order. Sparse
 * slots are treated as `undefined` items and the returned array is dense.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {(value: T, index: number) => unknown} [toKey]
 * @returns {T[]}
 */
export function unique(values, toKey = (value) => value) {
  assertArray(values, "values");
  if (typeof toKey !== "function") throw new TypeError("toKey must be a function.");

  const denseValues = [...values];
  const seen = new Set();
  return denseValues.filter((value, index) => {
    const key = toKey(value, index);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Flattens nested arrays to a requested depth without mutating the input.
 * Semantics match `Array.prototype.flat`: `Infinity` flattens every level and
 * sparse slots are removed at levels that are flattened.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {number} [depth=Infinity]
 * @returns {unknown[]}
 * @throws {TypeError} If `values` is not an array or depth is not an integer.
 * @throws {RangeError} If depth is negative or exceeds the safe-integer range.
 * @since 2.0.0
 */
export function flatten(values, depth = Infinity) {
  assertArray(values, "values");
  if (depth !== Infinity && !Number.isSafeInteger(depth)) {
    throw new TypeError("depth must be a non-negative safe integer or Infinity.");
  }
  if (depth < 0) throw new RangeError("depth cannot be negative.");
  return values.flat(depth);
}

/**
 * Moves one item to another position without mutating the input. Sparse slots
 * are treated as `undefined` items and the returned array is dense.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {T[]}
 */
export function moveItem(values, fromIndex, toIndex) {
  assertArray(values, "values");
  assertIndex(fromIndex, values.length, "fromIndex");
  assertIndex(toIndex, values.length, "toIndex");

  const result = [...values];
  const [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}

/**
 * Inserts an item at a bounded index without mutating the input. Indices below
 * zero insert at the start and indices beyond the length append. Sparse slots
 * are treated as `undefined` items and the returned array is dense.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {number} index
 * @param {T} item
 * @returns {T[]}
 */
export function insertItem(values, index, item) {
  assertArray(values, "values");
  if (!Number.isSafeInteger(index)) throw new TypeError("index must be a safe integer.");

  const boundedIndex = Math.min(Math.max(index, 0), values.length);
  return [...values.slice(0, boundedIndex), item, ...values.slice(boundedIndex)];
}

/**
 * Removes array items by index, value, or predicate. The input is never mutated.
 * In `auto` mode a function is a predicate, an integer is an index, and every
 * other selector is compared by `Object.is`. Use `mode: "value"` to remove a
 * numeric value instead of treating it as an index. Sparse slots are treated as
 * `undefined` items; predicates receive a dense copy of the input.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {number | T | ((value: T, index: number, values: readonly T[]) => boolean)} selector
 * @param {{mode?: RemovalMode, all?: boolean}} [options]
 * @returns {T[]}
 */
export function removeFromArray(values, selector, { mode = "auto", all = false } = {}) {
  assertArray(values, "values");
  if (!["auto", "index", "value", "predicate"].includes(mode)) {
    throw new TypeError(`Unsupported removal mode: ${mode}`);
  }
  if (typeof all !== "boolean") throw new TypeError("all must be a boolean.");

  const denseValues = [...values];

  const resolvedMode = mode === "auto"
    ? typeof selector === "function" ? "predicate" : Number.isInteger(selector) ? "index" : "value"
    : mode;

  if (resolvedMode === "index") {
    if (!Number.isSafeInteger(selector)) throw new TypeError("An index selector must be a safe integer.");
    const index = /** @type {number} */ (selector);
    if (index < 0 || index >= denseValues.length) return denseValues;
    return [...denseValues.slice(0, index), ...denseValues.slice(index + 1)];
  }

  if (resolvedMode === "predicate" && typeof selector !== "function") {
    throw new TypeError("A predicate selector must be a function.");
  }

  let removed = false;
  const predicate = /** @type {(value: T, index: number, values: readonly T[]) => boolean} */ (selector);
  return denseValues.filter((value, index) => {
    const matches = resolvedMode === "predicate"
      ? predicate(value, index, denseValues)
      : Object.is(value, selector);
    if (!matches || (removed && !all)) return true;
    removed = true;
    return false;
  });
}

/**
 * Groups items in a Map, avoiding object-key coercion and prototype collisions.
 * Sparse slots are treated as `undefined` items and group arrays are dense.
 *
 * @template T, K
 * @param {readonly T[]} values
 * @param {(value: T, index: number) => K} toKey
 * @returns {Map<K, T[]>}
 */
export function groupBy(values, toKey) {
  assertArray(values, "values");
  if (typeof toKey !== "function") throw new TypeError("toKey must be a function.");

  const denseValues = [...values];
  const groups = new Map();
  denseValues.forEach((value, index) => {
    const key = toKey(value, index);
    const group = groups.get(key);
    if (group) group.push(value);
    else groups.set(key, [value]);
  });
  return groups;
}

/**
 * Counts items by a derived key without coercing keys to object properties.
 * Sparse slots are treated as `undefined` items. Callback errors propagate.
 *
 * @template T
 * @overload
 * @param {readonly T[]} values
 * @returns {Map<T, number>}
 */
/**
 * @template T, K
 * @overload
 * @param {readonly T[]} values
 * @param {(value: T, index: number, values: readonly T[]) => K} toKey
 * @returns {Map<K, number>}
 */
/**
 * @param {readonly unknown[]} values
 * @param {(value: unknown, index: number, values: readonly unknown[]) => unknown} [toKey]
 * @returns {Map<unknown, number>}
 */
export function countBy(values, toKey = (value) => value) {
  assertArray(values, "values");
  if (typeof toKey !== "function") throw new TypeError("toKey must be a function.");

  const denseValues = [...values];
  const counts = new Map();
  denseValues.forEach((value, index) => {
    const key = toKey(value, index, denseValues);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return counts;
}

/**
 * Splits items into matching and non-matching arrays while preserving order.
 * Sparse slots are treated as `undefined` items. Callback errors propagate.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {(value: T, index: number, values: readonly T[]) => boolean} predicate
 * @returns {[T[], T[]]}
 */
export function partition(values, predicate) {
  assertArray(values, "values");
  if (typeof predicate !== "function") throw new TypeError("predicate must be a function.");

  const denseValues = [...values];
  /** @type {T[]} */
  const matching = [];
  /** @type {T[]} */
  const nonMatching = [];
  denseValues.forEach((value, index) => {
    (predicate(value, index, denseValues) ? matching : nonMatching).push(value);
  });
  return [matching, nonMatching];
}

/**
 * Returns unique values present in every input array. Sparse slots are treated
 * as `undefined` items and the returned array is dense.
 *
 * @template T
 * @param {...readonly T[]} arrays
 * @returns {T[]}
 */
export function intersection(...arrays) {
  arrays.forEach((array) => assertArray(array, "array"));
  if (arrays.length === 0) return [];

  const remaining = arrays.slice(1).map((array) => new Set(array));
  return unique([...arrays[0]]).filter((value) => remaining.every((set) => set.has(value)));
}

/**
 * Creates an end-exclusive numeric range, like Python's `range`.
 *
 * @param {number} start
 * @param {number} [end]
 * @param {number} [step]
 * @returns {number[]}
 */
export function range(start, end, step) {
  if (end === undefined) [start, end] = [0, start];
  if (![start, end].every(Number.isFinite)) throw new TypeError("Range bounds must be finite numbers.");

  const direction = end >= start ? 1 : -1;
  const increment = step ?? direction;
  if (!Number.isFinite(increment) || increment === 0) throw new RangeError("step must be a non-zero finite number.");
  if (Math.sign(increment) !== direction && start !== end) return [];

  const length = Math.max(0, Math.ceil((end - start) / increment));
  if (!Number.isSafeInteger(length) || length > maximumRangeLength) {
    throw new RangeError(`range cannot allocate more than ${maximumRangeLength} items.`);
  }
  return Array.from({ length }, (_, index) => start + index * increment);
}

/**
 * Combines arrays by position, stopping at the shortest input. Sparse slots are
 * read as `undefined` and every returned row is dense.
 *
 * @param {...readonly unknown[]} arrays
 * @returns {unknown[][]}
 */
export function zip(...arrays) {
  arrays.forEach((array) => assertArray(array, "array"));
  if (arrays.length === 0) return [];
  const length = Math.min(...arrays.map((array) => array.length));
  return Array.from({ length }, (_, index) => arrays.map((array) => array[index]));
}

/**
 * Returns a shuffled copy using Fisher-Yates. A random source can be injected
 * for deterministic tests or seeded applications. Sparse slots are treated as
 * `undefined` items and the returned array is dense.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {() => number} [random=Math.random]
 * @returns {T[]}
 */
export function shuffle(values, random = Math.random) {
  assertArray(values, "values");
  assertRandomSource(random);

  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(sampleRandom(random) * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

/** @param {unknown} value @param {string} name */
function assertArray(value, name) {
  if (!Array.isArray(value)) throw new TypeError(`${name} must be an array.`);
}

/** @param {number} index @param {number} length @param {string} name */
function assertIndex(index, length, name) {
  if (!Number.isSafeInteger(index) || index < 0 || index >= length) {
    throw new RangeError(`${name} must identify an existing array item.`);
  }
}
