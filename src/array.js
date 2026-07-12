/** @typedef {"auto" | "index" | "value" | "predicate"} RemovalMode */

/**
 * Returns the input when it is an array, or a fresh fallback array otherwise.
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
 *
 * @template T
 * @param {readonly (T | null | undefined)[]} values
 * @returns {T[]}
 */
export function compact(values) {
  assertArray(values, "values");
  return values.filter((value) => value !== null && value !== undefined);
}

/**
 * Splits an array into same-sized chunks. The final chunk may be shorter.
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

  const chunks = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

/**
 * Returns the first item for each unique key, preserving input order.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {(value: T, index: number) => unknown} [toKey]
 * @returns {T[]}
 */
export function unique(values, toKey = (value) => value) {
  assertArray(values, "values");
  if (typeof toKey !== "function") throw new TypeError("toKey must be a function.");

  const seen = new Set();
  return values.filter((value, index) => {
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
 *
 * @template T, K
 * @param {readonly T[]} values
 * @param {(value: T, index: number) => K} toKey
 * @returns {Map<K, T[]>}
 */
export function groupBy(values, toKey) {
  assertArray(values, "values");
  if (typeof toKey !== "function") throw new TypeError("toKey must be a function.");

  const groups = new Map();
  values.forEach((value, index) => {
    const key = toKey(value, index);
    const group = groups.get(key);
    if (group) group.push(value);
    else groups.set(key, [value]);
  });
  return groups;
}

/**
 * Returns unique values present in every input array.
 *
 * @template T
 * @param {...readonly T[]} arrays
 * @returns {T[]}
 */
export function intersection(...arrays) {
  arrays.forEach((array) => assertArray(array, "array"));
  if (arrays.length === 0) return [];

  const remaining = arrays.slice(1).map((array) => new Set(array));
  return unique(arrays[0]).filter((value) => remaining.every((set) => set.has(value)));
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
  return Array.from({ length }, (_, index) => start + index * increment);
}

/**
 * Combines arrays by position, stopping at the shortest input.
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
 * for deterministic tests or seeded applications.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {() => number} [random=Math.random]
 * @returns {T[]}
 */
export function shuffle(values, random = Math.random) {
  assertArray(values, "values");
  if (typeof random !== "function") throw new TypeError("random must be a function.");

  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
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
