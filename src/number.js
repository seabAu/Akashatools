import { isPlainObject } from "./object.js";

const decimalByteUnits = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
const binaryByteUnits = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

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
export function clamp(value, minimum, maximum) {
  assertFiniteNumbers({ value, minimum, maximum });
  if (minimum > maximum) throw new RangeError("minimum cannot exceed maximum.");
  return Math.min(Math.max(value, minimum), maximum);
}

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
export function wrap(value, minimum, maximum) {
  assertFiniteNumbers({ value, minimum, maximum });
  if (minimum >= maximum) throw new RangeError("minimum must be less than maximum.");
  const span = maximum - minimum;
  if (!Number.isFinite(span)) throw new RangeError("The wrap interval is outside the finite range.");
  return ((((value - minimum) % span) + span) % span) + minimum;
}

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
export function roundTo(value, digits = 0) {
  if (!Number.isFinite(value)) throw new TypeError("value must be finite.");
  if (!Number.isSafeInteger(digits) || digits < -308 || digits > 308) {
    throw new RangeError("digits must be a safe integer between -308 and 308.");
  }
  const shifted = shiftExponent(value, digits);
  if (!Number.isFinite(shifted)) {
    if (digits > 0) return value;
    throw new RangeError("The rounded value is outside the finite range.");
  }
  const rounded = shiftExponent(Math.round(shifted), -digits);
  if (!Number.isFinite(rounded)) throw new RangeError("The rounded value is outside the finite range.");
  return rounded;
}

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
export function sum(...values) {
  values.forEach((value) => assertFiniteNumbers({ value }));
  return values.reduce((total, value) => total + value, 0);
}

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
export function subtract(first, ...rest) {
  assertFiniteNumbers({ first });
  rest.forEach((value) => assertFiniteNumbers({ value }));
  return rest.reduce((result, value) => result - value, first);
}

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
export function distance(left, right) {
  assertFiniteNumbers({ left, right });
  return Math.abs(left - right);
}

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
export function distance2d(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== 2 || right.length !== 2) {
    throw new TypeError("Coordinates must be two-item arrays.");
  }
  assertFiniteNumbers({ leftX: left[0], leftY: left[1], rightX: right[0], rightY: right[1] });
  return Math.hypot(right[0] - left[0], right[1] - left[1]);
}

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
export function fibonacci(index) {
  if (!Number.isSafeInteger(index) || index < 0 || index > 78) {
    throw new RangeError("index must be a safe integer between 0 and 78.");
  }
  let previous = 0;
  let current = 1;
  for (let offset = 0; offset < index; offset += 1) {
    [previous, current] = [current, previous + current];
  }
  return previous;
}

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
export function toBinary(value) {
  if (!Number.isSafeInteger(value)) throw new TypeError("value must be a safe integer.");
  return value.toString(2);
}

/**
 * Formats a non-negative byte quantity with deterministic decimal or IEC binary
 * units. Values are rounded only for presentation and may promote into the next
 * unit when rounding reaches its base.
 *
 * @param {number} bytes Finite non-negative byte quantity; no string coercion is performed.
 * @param {{system?: "decimal" | "binary", maximumFractionDigits?: number}} [options] Unit system (base 1000 or 1024) and 0-20 displayed fractional digits.
 * @returns {string} Compact value followed by B/KB/MB or B/KiB/MiB-style units.
 * @throws {TypeError} If bytes or options do not match their literal contracts.
 * @throws {RangeError} If bytes is negative or maximumFractionDigits is outside 0-20.
 * @example
 * formatBytes(1_500); // "1.5 KB"
 * @since 2.0.0
 */
export function formatBytes(bytes, options = {}) {
  if (!Number.isFinite(bytes)) throw new TypeError("bytes must be a finite number.");
  if (bytes < 0) throw new RangeError("bytes must be non-negative.");
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const { system = "decimal", maximumFractionDigits = 1 } = options;
  if (system !== "decimal" && system !== "binary") {
    throw new TypeError('system must be "decimal" or "binary".');
  }
  if (!Number.isSafeInteger(maximumFractionDigits) || maximumFractionDigits < 0 || maximumFractionDigits > 20) {
    throw new RangeError("maximumFractionDigits must be a safe integer from 0 through 20.");
  }

  const base = system === "decimal" ? 1_000 : 1_024;
  const units = system === "decimal" ? decimalByteUnits : binaryByteUnits;
  let scaled = bytes;
  let unitIndex = 0;
  while (scaled >= base && unitIndex < units.length - 1) {
    scaled /= base;
    unitIndex += 1;
  }
  if (Number(scaled.toFixed(maximumFractionDigits)) >= base && unitIndex < units.length - 1) {
    scaled /= base;
    unitIndex += 1;
  }
  return `${trimFixed(scaled, maximumFractionDigits)} ${units[unitIndex]}`;
}

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
export function summarizeNumbers(values) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  values.forEach((value, index) => {
    if (!Number.isFinite(value)) throw new TypeError(`values[${index}] must be a finite number.`);
  });

  if (values.length === 0) {
    return {
      count: 0,
      minimum: null,
      maximum: null,
      median: null,
      p75: null,
      p95: null,
      mean: null,
      standardDeviation: null,
    };
  }

  const sorted = values.toSorted((left, right) => left - right);
  const scale = sorted.reduce((largest, value) => Math.max(largest, Math.abs(value)), 0);
  const normalizedMean = scale === 0 ? 0 : sorted.reduce((total, value) => total + value / scale / sorted.length, 0);
  const mean = normalizedMean * scale;
  const normalizedVariance =
    scale === 0 ? 0 : sorted.reduce((total, value) => total + (value / scale - normalizedMean) ** 2 / sorted.length, 0);
  const standardDeviation = scale * Math.sqrt(normalizedVariance);

  const summary = {
    count: sorted.length,
    minimum: sorted[0],
    maximum: sorted.at(-1),
    median: interpolatedPercentile(sorted, 0.5),
    p75: interpolatedPercentile(sorted, 0.75),
    p95: interpolatedPercentile(sorted, 0.95),
    mean,
    standardDeviation,
  };
  for (const [name, value] of Object.entries(summary)) {
    if (!Number.isFinite(value)) throw new RangeError(`${name} is outside the representable finite range.`);
  }
  return summary;
}

/**
 * @param {readonly number[]} sorted
 * @param {number} percentile
 * @returns {number}
 */
function interpolatedPercentile(sorted, percentile) {
  const position = (sorted.length - 1) * percentile;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const start = sorted[lower] ?? 0;
  const end = sorted[upper] ?? start;
  const fraction = position - lower;
  return start * (1 - fraction) + end * fraction;
}

/** @param {number} value @param {number} exponent */
function shiftExponent(value, exponent) {
  const [coefficient, currentExponent = "0"] = String(value).split("e");
  return Number(`${coefficient}e${Number(currentExponent) + exponent}`);
}

/** @param {Record<string, number>} values */
function assertFiniteNumbers(values) {
  for (const [name, value] of Object.entries(values)) {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be a finite number.`);
  }
}

/** @param {number} value @param {number} digits */
function trimFixed(value, digits) {
  return value
    .toFixed(digits)
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(/\.$/, "");
}
