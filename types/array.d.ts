export type RemovalMode = "auto" | "index" | "value" | "predicate";
/**
 * Returns the input when it is an array, preserving its identity and sparse
 * slots, or a fresh dense copy of the fallback otherwise.
 *
 * @template T
 * @param {unknown} value
 * @param {readonly T[]} [fallback=[]]
 * @returns {T[]}
 * @since 2.0.0
 */
export declare function asArray<T>(value: unknown, fallback?: readonly T[]): T[];
/**
 * Checks whether a value is an array containing at least one item.
 *
 * @template T
 * @param {unknown} value
 * @returns {value is T[]}
 * @since 2.0.0
 */
export declare function isNonEmptyArray<T>(value: unknown): value is T[];
/**
 * Removes nullish values from an array without removing `0`, `false`, or `""`.
 * Sparse slots are treated as `undefined` and therefore removed.
 *
 * @template T
 * @param {readonly (T | null | undefined)[]} values
 * @returns {T[]}
 * @since 2.0.0
 */
export declare function compact<T>(values: readonly (T | null | undefined)[]): T[];
/**
 * Splits an array into same-sized chunks. The final chunk may be shorter.
 * Sparse slots are treated as `undefined` items and returned chunks are dense.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {number} size
 * @returns {T[][]}
 * @since 2.0.0
 */
export declare function chunk<T>(values: readonly T[], size: number): T[][];
/**
 * Returns the first item for each unique key, preserving input order. Sparse
 * slots are treated as `undefined` items and the returned array is dense.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {(value: T, index: number) => unknown} [toKey]
 * @returns {T[]}
 * @since 2.0.0
 */
export declare function unique<T>(values: readonly T[], toKey?: (value: T, index: number) => unknown): T[];
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
export declare function flatten<T>(values: readonly T[], depth?: number): unknown[];
/**
 * Moves one item to another position without mutating the input. Sparse slots
 * are treated as `undefined` items and the returned array is dense.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {T[]}
 * @since 2.0.0
 */
export declare function moveItem<T>(values: readonly T[], fromIndex: number, toIndex: number): T[];
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
 * @param {readonly T[]} values
 * @param {number | T | ((value: T, index: number, values: readonly T[]) => boolean)} selector
 * @param {{mode?: RemovalMode, all?: boolean}} [options]
 * @returns {T[]}
 * @since 2.0.0
 */
export declare function removeFromArray<T>(values: readonly T[], selector: number | T | ((value: T, index: number, values: readonly T[]) => boolean), { mode, all }?: {
    mode?: RemovalMode;
    all?: boolean;
}): T[];
/**
 * Groups items in a Map, avoiding object-key coercion and prototype collisions.
 * Sparse slots are treated as `undefined` items and group arrays are dense.
 *
 * @template T, K
 * @param {readonly T[]} values
 * @param {(value: T, index: number) => K} toKey
 * @returns {Map<K, T[]>}
 * @since 2.0.0
 */
export declare function groupBy<T, K>(values: readonly T[], toKey: (value: T, index: number) => K): Map<K, T[]>;
export declare function countBy<T>(values: readonly T[]): Map<T, number>;
export declare function countBy<T, K>(values: readonly T[], toKey: (value: T, index: number, values: readonly T[]) => K): Map<K, number>;
/**
 * Splits items into matching and non-matching arrays while preserving order.
 * Sparse slots are treated as `undefined` items. Callback errors propagate.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {(value: T, index: number, values: readonly T[]) => boolean} predicate
 * @returns {[T[], T[]]}
 * @since 2.0.0
 */
export declare function partition<T>(values: readonly T[], predicate: (value: T, index: number, values: readonly T[]) => boolean): [T[], T[]];
/**
 * Returns unique values present in every input array. Sparse slots are treated
 * as `undefined` items and the returned array is dense.
 *
 * @template T
 * @param {...readonly T[]} arrays
 * @returns {T[]}
 * @since 2.0.0
 */
export declare function intersection<T>(...arrays: (readonly T[])[]): T[];
/**
 * Creates an end-exclusive numeric range, like Python's `range`.
 *
 * @param {number} start
 * @param {number} [end]
 * @param {number} [step]
 * @returns {number[]}
 * @since 2.0.0
 */
export declare function range(start: number, end?: number, step?: number): number[];
/**
 * Combines arrays by position, stopping at the shortest input. Sparse slots are
 * read as `undefined` and every returned row is dense.
 *
 * @param {...readonly unknown[]} arrays
 * @returns {unknown[][]}
 * @since 2.0.0
 */
export declare function zip(...arrays: (readonly unknown[])[]): unknown[][];
/**
 * Returns a shuffled copy using Fisher-Yates. A random source can be injected
 * for deterministic tests or seeded applications. Sparse slots are treated as
 * `undefined` items and the returned array is dense.
 *
 * @template T
 * @param {readonly T[]} values
 * @param {() => number} [random=Math.random]
 * @returns {T[]}
 * @since 2.0.0
 */
export declare function shuffle<T>(values: readonly T[], random?: () => number): T[];
