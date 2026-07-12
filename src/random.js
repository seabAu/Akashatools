import { assertRandomSource, sampleRandom } from "./internal/random-source.js";

const maximumRandomStringLength = 1_000_000;
const secureAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

/**
 * Returns a random float in the half-open range [minimum, maximum).
 *
 * @param {number} [minimum=0]
 * @param {number} [maximum=1]
 * @param {() => number} [random=Math.random]
 * @returns {number}
 * @since 2.0.0
 */
export function randomFloat(minimum = 0, maximum = 1, random = Math.random) {
  validateRange(minimum, maximum, random);
  const width = maximum - minimum;
  if (!Number.isFinite(width)) throw new RangeError("The random float interval is outside the finite range.");
  return sampleRandom(random) * width + minimum;
}

/**
 * Returns a random integer. The minimum is inclusive; the maximum can be
 * inclusive (default) or exclusive.
 *
 * @param {number} minimum
 * @param {number} maximum
 * @param {{inclusiveMaximum?: boolean, random?: () => number}} [options]
 * @returns {number}
 * @since 2.0.0
 */
export function randomInt(minimum, maximum, { inclusiveMaximum = true, random = Math.random } = {}) {
  if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum)) {
    throw new TypeError("Random integer bounds must be safe integers.");
  }
  validateRange(minimum, maximum, random);
  const width = maximum - minimum + (inclusiveMaximum ? 1 : 0);
  if (width <= 0) throw new RangeError("The random integer range is empty.");
  if (!Number.isSafeInteger(width)) throw new RangeError("The random integer interval exceeds the safe-integer range.");
  return Math.floor(sampleRandom(random) * width) + minimum;
}

/**
 * Returns a random boolean.
 *
 * @param {() => number} [random=Math.random]
 * @returns {boolean}
 * @since 2.0.0
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
 * @since 2.0.0
 */
export function randomString(length, characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", random = Math.random) {
  assertRandomStringLength(length);
  if (typeof characters !== "string" || characters.length === 0) throw new TypeError("characters must be a non-empty string.");
  assertRandomSource(random);
  return Array.from({ length }, () => characters[Math.floor(sampleRandom(random) * characters.length)]).join("");
}

/**
 * Returns a cryptographically secure RFC 4122 UUID through Web Crypto.
 *
 * @returns {string}
 * @throws {Error} If the runtime does not provide `crypto.randomUUID`.
 * @since 2.0.0
 */
export function secureRandomUuid() {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || typeof cryptoApi.randomUUID !== "function") {
    throw new Error("secureRandomUuid requires Web Crypto randomUUID support.");
  }
  return cryptoApi.randomUUID();
}

/**
 * Returns a cryptographically secure string using rejection sampling to avoid
 * modulo bias. The alphabet must contain 2-256 unique Unicode code points.
 *
 * @param {number} length
 * @param {string} [alphabet]
 * @returns {string}
 * @throws {Error} If the runtime does not provide `crypto.getRandomValues`.
 * @since 2.0.0
 */
export function secureRandomString(length, alphabet = secureAlphabet) {
  assertRandomStringLength(length);
  if (typeof alphabet !== "string") throw new TypeError("alphabet must be a string.");
  const characters = [...alphabet];
  if (characters.length < 2 || characters.length > 256 || new Set(characters).size !== characters.length) {
    throw new RangeError("alphabet must contain 2-256 unique Unicode code points.");
  }
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || typeof cryptoApi.getRandomValues !== "function") {
    throw new Error("secureRandomString requires Web Crypto getRandomValues support.");
  }

  const acceptanceLimit = Math.floor(256 / characters.length) * characters.length;
  /** @type {string[]} */
  const output = [];
  while (output.length < length) {
    const remaining = length - output.length;
    const bytes = new Uint8Array(Math.min(Math.max(remaining * 2, 32), 65_536));
    cryptoApi.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= acceptanceLimit) continue;
      output.push(characters[byte % characters.length]);
      if (output.length === length) break;
    }
  }
  return output.join("");
}

/**
 * Returns a random Date within an inclusive timestamp range.
 *
 * @param {Date | string | number} start
 * @param {Date | string | number} [end=new Date()]
 * @param {() => number} [random=Math.random]
 * @returns {Date}
 * @since 2.0.0
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

/** @param {number} length */
function assertRandomStringLength(length) {
  if (!Number.isSafeInteger(length) || length < 0 || length > maximumRandomStringLength) {
    throw new RangeError(`length must be a safe integer between 0 and ${maximumRandomStringLength}.`);
  }
}
