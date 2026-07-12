/**
 * Constrains a finite number to an inclusive range.
 *
 * @param {number} value
 * @param {number} minimum
 * @param {number} maximum
 * @returns {number}
 * @since 2.0.0
 */
export declare function clamp(value: number, minimum: number, maximum: number): number;
/**
 * Wraps a finite number into the half-open interval [minimum, maximum).
 *
 * @param {number} value
 * @param {number} minimum
 * @param {number} maximum
 * @returns {number}
 * @since 2.0.0
 */
export declare function wrap(value: number, minimum: number, maximum: number): number;
/**
 * Rounds a number to a decimal precision using exponent shifting.
 *
 * @param {number} value
 * @param {number} [digits=0]
 * @returns {number}
 * @since 2.0.0
 */
export declare function roundTo(value: number, digits?: number): number;
/**
 * Adds finite numeric arguments.
 *
 * @param {...number} values
 * @returns {number}
 * @since 2.0.0
 */
export declare function sum(...values: number[]): number;
/**
 * Subtracts each subsequent value from the first.
 *
 * @param {number} first
 * @param {...number} rest
 * @returns {number}
 * @since 2.0.0
 */
export declare function subtract(first: number, ...rest: number[]): number;
/**
 * Returns the absolute distance between two finite numbers.
 *
 * @param {number} left
 * @param {number} right
 * @returns {number}
 * @since 2.0.0
 */
export declare function distance(left: number, right: number): number;
/**
 * Calculates Euclidean distance between two `[x, y]` coordinates.
 *
 * @param {readonly [number, number]} left
 * @param {readonly [number, number]} right
 * @returns {number}
 * @since 2.0.0
 */
export declare function distance2d(left: readonly [number, number], right: readonly [number, number]): number;
/**
 * Returns the nth Fibonacci number using an iterative O(n) implementation.
 *
 * @param {number} index
 * @returns {number}
 * @since 2.0.0
 */
export declare function fibonacci(index: number): number;
/**
 * Converts a safe integer to a binary string.
 *
 * @param {number} value
 * @returns {string}
 * @since 2.0.0
 */
export declare function toBinary(value: number): string;
/**
 * Summarizes a finite numeric sample without mutating it. Percentiles use
 * linear interpolation at position `(length - 1) * percentile`, and standard
 * deviation is the population value. Empty samples have count zero and null
 * statistics so absence is not confused with observed zeroes.
 *
 * @param {readonly number[]} values
 * @returns {{
 *   count: number,
 *   minimum: number | null,
 *   maximum: number | null,
 *   median: number | null,
 *   p75: number | null,
 *   p95: number | null,
 *   mean: number | null,
 *   standardDeviation: number | null
 * }}
 * @throws {TypeError} If values is not an array or contains a non-finite number.
 * @throws {RangeError} If a statistic cannot be represented as a finite number.
 * @example
 * summarizeNumbers([10, 20, 30, 40]);
 * // { count: 4, minimum: 10, maximum: 40, median: 25, ... }
 * @since 2.0.0
 */
export declare function summarizeNumbers(values: readonly number[]): {
    count: number;
    minimum: number | null;
    maximum: number | null;
    median: number | null;
    p75: number | null;
    p95: number | null;
    mean: number | null;
    standardDeviation: number | null;
};
