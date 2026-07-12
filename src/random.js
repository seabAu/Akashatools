import { assertRandomSource, sampleRandom } from "./internal/random-source.js";

/**
 * Returns a random float in the half-open range [minimum, maximum).
 *
 * @param {number} [minimum=0]
 * @param {number} [maximum=1]
 * @param {() => number} [random=Math.random]
 * @returns {number}
 */
export function randomFloat(minimum = 0, maximum = 1, random = Math.random) {
  validateRange(minimum, maximum, random);
  return sampleRandom(random) * (maximum - minimum) + minimum;
}

/**
 * Returns a random integer. The minimum is inclusive; the maximum can be
 * inclusive (default) or exclusive.
 *
 * @param {number} minimum
 * @param {number} maximum
 * @param {{inclusiveMaximum?: boolean, random?: () => number}} [options]
 * @returns {number}
 */
export function randomInt(minimum, maximum, { inclusiveMaximum = true, random = Math.random } = {}) {
  if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum)) {
    throw new TypeError("Random integer bounds must be safe integers.");
  }
  validateRange(minimum, maximum, random);
  const width = maximum - minimum + (inclusiveMaximum ? 1 : 0);
  if (width <= 0) throw new RangeError("The random integer range is empty.");
  return Math.floor(sampleRandom(random) * width) + minimum;
}

/**
 * Returns a random boolean.
 *
 * @param {() => number} [random=Math.random]
 * @returns {boolean}
 */
export function randomBoolean(random = Math.random) {
  assertRandomSource(random);
  return sampleRandom(random) >= 0.5;
}

/**
 * Returns a random string from the supplied character set. This is not suitable
 * for passwords, tokens, or identifiers requiring cryptographic unpredictability.
 *
 * @param {number} length
 * @param {string} [characters]
 * @param {() => number} [random=Math.random]
 * @returns {string}
 */
export function randomString(length, characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", random = Math.random) {
  if (!Number.isSafeInteger(length) || length < 0) throw new RangeError("length must be a non-negative safe integer.");
  if (typeof characters !== "string" || characters.length === 0) throw new TypeError("characters must be a non-empty string.");
  assertRandomSource(random);
  return Array.from({ length }, () => characters[Math.floor(sampleRandom(random) * characters.length)]).join("");
}

/**
 * Returns a random Date within an inclusive timestamp range.
 *
 * @param {Date | string | number} start
 * @param {Date | string | number} [end=new Date()]
 * @param {() => number} [random=Math.random]
 * @returns {Date}
 */
export function randomDate(start, end = new Date(), random = Math.random) {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) throw new TypeError("Date bounds must be valid dates.");
  return new Date(randomInt(startTime, endTime, { random }));
}

/** @param {number} minimum @param {number} maximum @param {() => number} random */
function validateRange(minimum, maximum, random) {
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) throw new TypeError("Bounds must be finite numbers.");
  if (minimum > maximum) throw new RangeError("minimum cannot exceed maximum.");
  assertRandomSource(random);
}
