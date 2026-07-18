export type RemovalMode = "auto" | "index" | "value" | "predicate";
export type DuplicateKeyPolicy = "first" | "last" | "error";
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
export declare function asArray<T>(value: unknown, fallback?: readonly T[]): T[];
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
export declare function isNonEmptyArray<T>(value: unknown): value is T[];
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
export declare function compact<T>(values: readonly (T | null | undefined)[]): T[];
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
export declare function chunk<T>(values: readonly T[], size: number): T[][];
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
export declare function unique<T>(values: readonly T[], toKey?: (value: T, index: number) => unknown): T[];
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
export declare function flatten<T>(values: readonly T[], depth?: number): unknown[];
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
export declare function moveItem<T>(values: readonly T[], fromIndex: number, toIndex: number): T[];
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
export declare function insertItem<T>(values: readonly T[], index: number, item: T): T[];
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
export declare function removeFromArray<T>(values: readonly T[], selector: number | T | ((value: T, index: number, values: readonly T[]) => boolean), options?: {
    mode?: RemovalMode;
    all?: boolean;
}): T[];
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
export declare function groupBy<T, K>(values: readonly T[], toKey: (value: T, index: number) => K): Map<K, T[]>;
/**
 * Indexes items in a Map without coercing object, symbol, numeric, or string
 * keys into property names. Sparse slots are treated as `undefined` items and
 * the selector receives a dense input copy. Duplicate-key behavior is explicit.
 *
 * This is the identity-safe replacement for legacy `arrayToEnum` and
 * object-backed registry builders. Use `groupBy` when every duplicate value
 * should be retained rather than selecting one value per key.
 *
 * @template T, K
 * @param {readonly T[]} values Array to index without mutation.
 * @param {(value: T, index: number, values: readonly T[]) => K} toKey Key selector called once per dense input item.
 * @param {{onDuplicate?: DuplicateKeyPolicy}} [options] Keep the last value (default), keep the first, or reject duplicate SameValueZero keys.
 * @returns {Map<K, T>} Insertion-ordered identity-preserving key/value index.
 * @throws {TypeError} If values, toKey, options, or the duplicate policy is invalid.
 * @throws {RangeError} If `onDuplicate` is `"error"` and a key repeats.
 * @example
 * keyBy(users, ({ id }) => id, { onDuplicate: "error" });
 * @since 2.0.0
 */
export declare function keyBy<T, K>(values: readonly T[], toKey: (value: T, index: number, values: readonly T[]) => K, options?: {
    onDuplicate?: DuplicateKeyPolicy;
}): Map<K, T>;
export declare function countBy<T>(values: readonly T[]): Map<T, number>;
export declare function countBy<T, K>(values: readonly T[], toKey: (value: T, index: number, values: readonly T[]) => K): Map<K, number>;
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
export declare function partition<T>(values: readonly T[], predicate: (value: T, index: number, values: readonly T[]) => boolean): [T[], T[]];
/**
 * Finds the first insertion index at which `needle` can be placed without
 * moving an equal value earlier. The input must already be sorted under the
 * same comparator; ordering is intentionally not rescanned so work stays
 * logarithmic. Sparse slots compare as `undefined` values.
 *
 * @template T, U
 * @param {readonly T[]} values Sorted array to search without mutation.
 * @param {U} needle Value whose lower insertion bound is requested.
 * @param {(value: T, needle: U) => number} [compare=compareValues] Comparator returning a finite ordering signal.
 * @returns {number} First index whose value does not compare below the needle, in `[0, values.length]`.
 * @throws {TypeError} If values or compare is invalid, or compare returns a non-finite number.
 * @example
 * lowerBound([1, 2, 2, 4], 2); // 1
 * @since 2.0.0
 */
export declare function lowerBound<T, U>(values: readonly T[], needle: U, compare?: (value: T, needle: U) => number): number;
/**
 * Finds the first insertion index after every comparator-equal value. The
 * input must already be sorted under the same comparator; ordering is not
 * rescanned, preserving logarithmic work. Sparse slots compare as `undefined`.
 *
 * @template T, U
 * @param {readonly T[]} values Sorted array to search without mutation.
 * @param {U} needle Value whose upper insertion bound is requested.
 * @param {(value: T, needle: U) => number} [compare=compareValues] Comparator returning a finite ordering signal.
 * @returns {number} First index whose value compares above the needle, in `[0, values.length]`.
 * @throws {TypeError} If values or compare is invalid, or compare returns a non-finite number.
 * @example
 * upperBound([1, 2, 2, 4], 2); // 3
 * @since 2.0.0
 */
export declare function upperBound<T, U>(values: readonly T[], needle: U, compare?: (value: T, needle: U) => number): number;
/**
 * Returns the first comparator-equal item in a sorted array. Unlike
 * `Array.prototype.findIndex`, this performs logarithmic comparisons. The
 * input must already be sorted under the same comparator and is not mutated.
 *
 * @template T, U
 * @param {readonly T[]} values Sorted array to search without mutation.
 * @param {U} needle Value to locate.
 * @param {(value: T, needle: U) => number} [compare=compareValues] Comparator returning a finite ordering signal.
 * @returns {number} First equal index, or `-1` when absent.
 * @throws {TypeError} If values or compare is invalid, or compare returns a non-finite number.
 * @example
 * binarySearch([1, 2, 2, 4], 2); // 1
 * @since 2.0.0
 */
export declare function binarySearch<T, U>(values: readonly T[], needle: U, compare?: (value: T, needle: U) => number): number;
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
export declare function intersection<T>(...arrays: (readonly T[])[]): T[];
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
export declare function range(start: number, end?: number, step?: number): number[];
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
export declare function zip(...arrays: (readonly unknown[])[]): unknown[][];
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
export declare function shuffle<T>(values: readonly T[], random?: () => number): T[];
