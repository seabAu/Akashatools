/**
 * Constrains a finite number to an inclusive range.
 *
 * @param {number} value Finite value to constrain.
 * @param {number} minimum Finite inclusive lower boundary.
 * @param {number} maximum Finite inclusive upper boundary.
 * @returns {number} Value constrained to the inclusive range.
 * @throws {TypeError} If any argument is not finite.
 * @throws {RangeError} If minimum exceeds maximum.
 * @example
 * clamp(12, 0, 10); // 10
 * @since 2.0.0
 */
export declare function clamp(value: number, minimum: number, maximum: number): number;
/**
 * Wraps a finite number into the half-open interval [minimum, maximum).
 *
 * @param {number} value Finite value to wrap.
 * @param {number} minimum Finite inclusive lower boundary.
 * @param {number} maximum Finite exclusive upper boundary.
 * @returns {number} Equivalent value in the half-open interval.
 * @throws {TypeError} If any argument is not finite.
 * @throws {RangeError} If the interval is empty, reversed, or has a non-finite span.
 * @example
 * wrap(-1, 0, 4); // 3
 * @since 2.0.0
 */
export declare function wrap(value: number, minimum: number, maximum: number): number;
/**
 * Rounds a number to a decimal precision using exponent shifting.
 *
 * @param {number} value Finite value to round.
 * @param {number} [digits=0] Safe-integer decimal digits from -308 through 308.
 * @returns {number} Rounded finite value.
 * @throws {TypeError} If value is not finite.
 * @throws {RangeError} If digits or the rounded result is outside supported finite bounds.
 * @example
 * roundTo(1.005, 2); // 1.01
 * @since 2.0.0
 */
export declare function roundTo(value: number, digits?: number): number;
/**
 * Adds finite numeric arguments.
 *
 * @param {...number} values Finite values to add; an empty list returns zero.
 * @returns {number} Arithmetic sum, which can overflow if the result is not representable.
 * @throws {TypeError} If any input is not finite.
 * @example
 * sum(1, 2, 3); // 6
 * @since 2.0.0
 */
export declare function sum(...values: number[]): number;
/**
 * Subtracts each subsequent value from the first.
 *
 * @param {number} first Finite starting value.
 * @param {...number} rest Finite values subtracted from left to right.
 * @returns {number} Arithmetic difference, which can overflow if the result is not representable.
 * @throws {TypeError} If any input is not finite.
 * @example
 * subtract(10, 3, 2); // 5
 * @since 2.0.0
 */
export declare function subtract(first: number, ...rest: number[]): number;
/**
 * Returns the absolute distance between two finite numbers.
 *
 * @param {number} left First finite value.
 * @param {number} right Second finite value.
 * @returns {number} Absolute arithmetic distance, possibly Infinity after numeric overflow.
 * @throws {TypeError} If either input is not finite.
 * @example
 * distance(-2, 3); // 5
 * @since 2.0.0
 */
export declare function distance(left: number, right: number): number;
/**
 * Calculates Euclidean distance between two `[x, y]` coordinates.
 *
 * @param {readonly [number, number]} left First finite `[x, y]` coordinate.
 * @param {readonly [number, number]} right Second finite `[x, y]` coordinate.
 * @returns {number} Euclidean distance, possibly Infinity when no finite result is representable.
 * @throws {TypeError} If either coordinate is not a two-item array of finite numbers.
 * @example
 * distance2d([0, 0], [3, 4]); // 5
 * @since 2.0.0
 */
export declare function distance2d(left: readonly [number, number], right: readonly [number, number]): number;
/**
 * Returns the nth Fibonacci number using an iterative O(n) implementation.
 *
 * @param {number} index Safe-integer sequence index from 0 through 78.
 * @returns {number} Exactly representable Fibonacci number at index.
 * @throws {RangeError} If index is outside the supported safe-integer range.
 * @example
 * fibonacci(10); // 55
 * @since 2.0.0
 */
export declare function fibonacci(index: number): number;
/**
 * Converts a safe integer to a binary string.
 *
 * @param {number} value Safe integer to represent in base two.
 * @returns {string} Signed binary digits without a radix prefix.
 * @throws {TypeError} If value is not a safe integer.
 * @example
 * toBinary(-5); // "-101"
 * @since 2.0.0
 */
export declare function toBinary(value: number): string;
/**
 * Summarizes a finite numeric sample without mutating it. Percentiles use
 * linear interpolation at position `(length - 1) * percentile`, and standard
 * deviation is the population value. Empty samples have count zero and null
 * statistics so absence is not confused with observed zeroes.
 *
 * @param {readonly number[]} values Finite numeric sample left unmodified.
 * @returns {{
 *   count: number,
 *   minimum: number | null,
 *   maximum: number | null,
 *   median: number | null,
 *   p75: number | null,
 *   p95: number | null,
 *   mean: number | null,
 *   standardDeviation: number | null
 * }} Summary with interpolated percentiles and population deviation.
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
