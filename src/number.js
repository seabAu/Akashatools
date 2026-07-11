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
  return Number(Math.round(Number(`${value}e${digits}`)) + `e-${digits}`);
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

/** @param {Record<string, number>} values */
function assertFiniteNumbers(values) {
  for (const [name, value] of Object.entries(values)) {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be a finite number.`);
  }
}
