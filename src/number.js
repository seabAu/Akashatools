/**
 * Constrains a finite number to an inclusive range.
 *
 * @param {number} value
 * @param {number} minimum
 * @param {number} maximum
 * @returns {number}
 */
export function clamp(value, minimum, maximum) {
  assertFiniteNumbers({ value, minimum, maximum });
  if (minimum > maximum) throw new RangeError("minimum cannot exceed maximum.");
  return Math.min(Math.max(value, minimum), maximum);
}

/**
 * Wraps a finite number into the half-open interval [minimum, maximum).
 *
 * @param {number} value
 * @param {number} minimum
 * @param {number} maximum
 * @returns {number}
 */
export function wrap(value, minimum, maximum) {
  assertFiniteNumbers({ value, minimum, maximum });
  if (minimum >= maximum) throw new RangeError("minimum must be less than maximum.");
  const span = maximum - minimum;
  if (!Number.isFinite(span)) throw new RangeError("The wrap interval is outside the finite range.");
  return ((value - minimum) % span + span) % span + minimum;
}

/**
 * Rounds a number to a decimal precision using exponent shifting.
 *
 * @param {number} value
 * @param {number} [digits=0]
 * @returns {number}
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

/** @param {...number} values @returns {number} */
export function sum(...values) {
  values.forEach((value) => assertFiniteNumbers({ value }));
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Subtracts each subsequent value from the first.
 *
 * @param {number} first
 * @param {...number} rest
 * @returns {number}
 */
export function subtract(first, ...rest) {
  assertFiniteNumbers({ first });
  rest.forEach((value) => assertFiniteNumbers({ value }));
  return rest.reduce((result, value) => result - value, first);
}

/** @param {number} left @param {number} right @returns {number} */
export function distance(left, right) {
  assertFiniteNumbers({ left, right });
  return Math.abs(left - right);
}

/**
 * Calculates Euclidean distance between two `[x, y]` coordinates.
 *
 * @param {readonly [number, number]} left
 * @param {readonly [number, number]} right
 * @returns {number}
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
 * @param {number} index
 * @returns {number}
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
 * @param {number} value
 * @returns {string}
 */
export function toBinary(value) {
  if (!Number.isSafeInteger(value)) throw new TypeError("value must be a safe integer.");
  return value.toString(2);
}

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
  const normalizedMean = scale === 0
    ? 0
    : sorted.reduce((total, value) => total + value / scale / sorted.length, 0);
  const mean = normalizedMean * scale;
  const normalizedVariance = scale === 0
    ? 0
    : sorted.reduce((total, value) => total + (value / scale - normalizedMean) ** 2 / sorted.length, 0);
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
