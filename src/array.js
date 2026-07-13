import { assertRandomSource, sampleRandom } from "./internal/random-source.js";
import { isPlainObject } from "./object.js";

/** @typedef {"auto" | "index" | "value" | "predicate"} RemovalMode */
const maximumRangeLength = 1_000_000;

/**
 * Returns the input when it is an array, preserving its identity and sparse
 * slots, or a fresh dense copy of the fallback otherwise.
 *
 * @template T
 * @param {unknown} value Candidate returned unchanged when it is an array.
 * @param {readonly T[]} [fallback=[]] Array copied when value is not an array.
 * @returns {T[]} Original array value, or a fresh dense fallback copy.
 * @throws {TypeError} If fallback is not an array.
 * @example
 * asArray(null, ["fallback"]); // ["fallback"]
 * @since 2.0.0
 */
export function asArray(value, fallback = []) {
  assertArray(fallback, "fallback");
  return Array.isArray(value) ? value : [...fallback];
}

/**
 * Checks whether a value is an array containing at least one item.
 *
 * @template T
 * @param {unknown} value Candidate of any type.
 * @returns {value is T[]} Whether value is an array with length greater than zero.
 * @example
 * isNonEmptyArray([0]); // true
 * @since 2.0.0
 */
export function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Removes nullish values from an array without removing `0`, `false`, or `""`.
 * Sparse slots are treated as `undefined` and therefore removed.
 *
 * @template T
 * @param {readonly (T | null | undefined)[]} values Array to copy and compact.
 * @returns {T[]} Dense copy containing every non-nullish value in order.
 * @throws {TypeError} If values is not an array.
 * @example
 * compact([0, null, false, undefined]); // [0, false]
 * @since 2.0.0
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
 * @param {readonly T[]} values Array to split without mutation.
 * @param {number} size Positive safe-integer maximum size of each chunk.
 * @returns {T[][]} Ordered dense chunks; an empty input produces an empty array.
 * @throws {TypeError} If values is not an array.
 * @throws {RangeError} If size is not a positive safe integer.
 * @example
 * chunk([1, 2, 3], 2); // [[1, 2], [3]]
 * @since 2.0.0
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
 * @param {readonly T[]} values Array whose first value for each key is retained.
 * @param {(value: T, index: number) => unknown} [toKey] Key selector; identity is the default.
 * @returns {T[]} Dense, ordered copy containing the first value for each SameValueZero key.
 * @throws {TypeError} If values is not an array or toKey is not a function.
 * @example
 * unique(["a", "A", "b"], (value) => value.toLowerCase()); // ["a", "b"]
 * @since 2.0.0
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
 * @param {readonly T[]} values Nested array to flatten without mutation.
 * @param {number} [depth=Infinity] Non-negative safe-integer depth, or Infinity.
 * @returns {unknown[]} Native-flat result with flattened sparse slots removed.
 * @throws {TypeError} If `values` is not an array or depth is not an integer.
 * @throws {RangeError} If depth is negative or exceeds the safe-integer range.
 * @example
 * flatten([1, [2, [3]]], 1); // [1, 2, [3]]
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
 * @param {readonly T[]} values Array containing the item to move.
 * @param {number} fromIndex Existing zero-based source index.
 * @param {number} toIndex Existing zero-based destination index.
 * @returns {T[]} Dense reordered copy, including when both indices are equal.
 * @throws {TypeError} If values is not an array.
 * @throws {RangeError} If either index does not identify an existing item.
 * @example
 * moveItem(["a", "b", "c"], 0, 2); // ["b", "c", "a"]
 * @since 2.0.0
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
 * @param {readonly T[]} values Array to copy before insertion.
 * @param {number} index Safe integer clamped into the inclusive 0..length range.
 * @param {T} item Value to insert exactly once.
 * @returns {T[]} Dense copy containing item at the bounded index.
 * @throws {TypeError} If values is not an array or index is not a safe integer.
 * @example
 * insertItem([1, 3], 1, 2); // [1, 2, 3]
 * @since 2.0.0
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
 * @param {readonly T[]} values Array to copy before removal.
 * @param {number | T | ((value: T, index: number, values: readonly T[]) => boolean)} selector Index, SameValue value, or predicate selected according to mode.
 * @param {{mode?: RemovalMode, all?: boolean}} [options] Plain options object; all removes every value/predicate match but never changes index mode.
 * @returns {T[]} Dense copy with the requested item or matches removed.
 * @throws {TypeError} If values, options, mode, all, or the selected selector contract is invalid.
 * @example
 * removeFromArray([1, 2, 1], 1, { mode: "value", all: true }); // [2]
 * @since 2.0.0
 */
export function removeFromArray(values, selector, options = {}) {
  assertArray(values, "values");
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const { mode = "auto", all = false } = options;
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
 * @param {readonly T[]} values Array to group without mutation.
 * @param {(value: T, index: number) => K} toKey Key selector called once per dense input item.
 * @returns {Map<K, T[]>} Insertion-ordered keys mapped to dense, ordered value arrays.
 * @throws {TypeError} If values is not an array or toKey is not a function.
 * @example
 * groupBy([1, 2, 3], (value) => value % 2); // Map { 1 => [1, 3], 0 => [2] }
 * @since 2.0.0
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
 * @param {readonly T[]} values Array whose SameValueZero identities are counted.
 * @returns {Map<T, number>} Insertion-ordered identity counts.
 * @since 2.0.0
 */
/**
 * Counts items by a caller-provided key without coercing key identity.
 *
 * @template T, K
 * @overload
 * @param {readonly T[]} values Array whose derived keys are counted.
 * @param {(value: T, index: number, values: readonly T[]) => K} toKey Key selector receiving the dense input copy.
 * @returns {Map<K, number>} Insertion-ordered derived-key counts.
 * @since 2.0.0
 */
/**
 * Counts items by a derived key without coercing key identity.
 *
 * @param {readonly unknown[]} values Array to count without mutation.
 * @param {(value: unknown, index: number, values: readonly unknown[]) => unknown} [toKey] Key selector; identity is the default.
 * @returns {Map<unknown, number>} Insertion-ordered SameValueZero key counts.
 * @throws {TypeError} If values is not an array or toKey is not a function.
 * @example
 * countBy(["one", "two", "four"], (value) => value.length); // Map { 3 => 2, 4 => 1 }
 * @since 2.0.0
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
 * @param {readonly T[]} values Array to split without mutation.
 * @param {(value: T, index: number, values: readonly T[]) => boolean} predicate Test receiving each value, index, and dense input copy.
 * @returns {[T[], T[]]} Pair of dense arrays: matches first, non-matches second.
 * @throws {TypeError} If values is not an array or predicate is not a function.
 * @example
 * partition([1, 2, 3], (value) => value % 2 === 1); // [[1, 3], [2]]
 * @since 2.0.0
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
 * @param {...readonly T[]} arrays Arrays compared using SameValueZero key identity.
 * @returns {T[]} Dense unique values from the first array present in every later array.
 * @throws {TypeError} If any argument is not an array.
 * @example
 * intersection([1, 1, 2], [2, 3]); // [2]
 * @since 2.0.0
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
 * @param {number} start Start value, or exclusive end when end is omitted.
 * @param {number} [end] Exclusive finite end bound.
 * @param {number} [step] Non-zero finite increment; defaults to the bound direction.
 * @returns {number[]} Arithmetic sequence containing at most one million values.
 * @throws {TypeError} If either bound is not a finite number.
 * @throws {RangeError} If step is zero/non-finite or the result would exceed allocation limits.
 * @example
 * range(4, 0, -2); // [4, 2]
 * @since 2.0.0
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
 * @param {...readonly unknown[]} arrays Arrays to combine without mutation.
 * @returns {unknown[][]} Dense positional rows through the shortest input length.
 * @throws {TypeError} If any argument is not an array.
 * @example
 * zip([1, 2], ["a", "b"]); // [[1, "a"], [2, "b"]]
 * @since 2.0.0
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
 * @param {readonly T[]} values Array to shuffle without mutation.
 * @param {() => number} [random=Math.random] Source returning a finite value in the half-open interval [0, 1).
 * @returns {T[]} Dense Fisher-Yates shuffled copy.
 * @throws {TypeError} If values is not an array or random is not a function.
 * @throws {RangeError} If random returns a value outside [0, 1) or a non-finite number.
 * @example
 * shuffle([1, 2, 3], () => 0); // [2, 3, 1]
 * @since 2.0.0
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
