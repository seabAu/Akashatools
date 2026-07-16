import { assertRandomSource, sampleRandom } from "./internal/random-source.js";

const maximumRandomStringLength = 1_000_000;
const secureAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

/**
 * Returns a random float in the half-open range [minimum, maximum).
 *
 * @param {number} [minimum=0] Finite inclusive lower boundary.
 * @param {number} [maximum=1] Finite exclusive upper boundary.
 * @param {() => number} [random=Math.random] Source returning a finite value in `[0, 1)`.
 * @returns {number} Random value in the requested half-open interval.
 * @throws {TypeError} If bounds or the random source are not finite/function values.
 * @throws {RangeError} If boundaries are reversed, their width overflows, or random violates `[0, 1)`.
 * @example
 * randomFloat(10, 20); // 10 <= result < 20
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
 * @param {number} minimum Safe-integer inclusive lower boundary.
 * @param {number} maximum Safe-integer upper boundary.
 * @param {{inclusiveMaximum?: boolean, random?: () => number}} [options] Upper-bound inclusion and injectable `[0, 1)` source.
 * @returns {number} Random safe integer in the requested range.
 * @throws {TypeError} If bounds, inclusiveMaximum, or random do not match their contracts.
 * @throws {RangeError} If the range is reversed, empty, too wide, or random violates `[0, 1)`.
 * @example
 * randomInt(1, 6); // inclusive dice roll
 * @since 2.0.0
 */
export function randomInt(minimum, maximum, { inclusiveMaximum = true, random = Math.random } = {}) {
  if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum)) {
    throw new TypeError("Random integer bounds must be safe integers.");
  }
  if (typeof inclusiveMaximum !== "boolean") throw new TypeError("inclusiveMaximum must be a boolean.");
  validateRange(minimum, maximum, random);
  const width = maximum - minimum + (inclusiveMaximum ? 1 : 0);
  if (width <= 0) throw new RangeError("The random integer range is empty.");
  if (!Number.isSafeInteger(width)) throw new RangeError("The random integer interval exceeds the safe-integer range.");
  return Math.floor(sampleRandom(random) * width) + minimum;
}

/**
 * Returns a random boolean.
 *
 * @param {() => number} [random=Math.random] Source returning a finite value in `[0, 1)`.
 * @returns {boolean} False below 0.5 and true at or above 0.5.
 * @throws {TypeError} If random is not a function.
 * @throws {RangeError} If random returns outside `[0, 1)` or a non-finite value.
 * @example
 * randomBoolean(); // true or false
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
 * @param {number} length Safe-integer output length from 0 through 1,000,000 code units.
 * @param {string} [characters] Non-empty code-unit alphabet used for sampling.
 * @param {() => number} [random=Math.random] Source returning a finite value in `[0, 1)`.
 * @returns {string} Non-cryptographic sampled string of exactly length code units.
 * @throws {TypeError} If characters or random do not match their contracts.
 * @throws {RangeError} If length or a sampled random value is outside its bounds.
 * @example
 * randomString(8, "ABC123");
 * @since 2.0.0
 */
export function randomString(
  length,
  characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  random = Math.random,
) {
  assertRandomStringLength(length);
  if (typeof characters !== "string" || characters.length === 0)
    throw new TypeError("characters must be a non-empty string.");
  assertRandomSource(random);
  return Array.from({ length }, () => characters[Math.floor(sampleRandom(random) * characters.length)]).join("");
}

/**
 * Returns a cryptographically secure RFC 4122 UUID through Web Crypto.
 *
 * @returns {string} Cryptographically secure UUID string supplied by Web Crypto.
 * @throws {Error} If the runtime does not provide `crypto.randomUUID`.
 * @example
 * const requestId = secureRandomUuid();
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
 * @param {number} length Safe-integer output length from 0 through 1,000,000 code points.
 * @param {string} [alphabet] Alphabet of 2-256 unique Unicode code points.
 * @returns {string} Cryptographically secure unbiased sampled string.
 * @throws {TypeError} If alphabet is not a string.
 * @throws {RangeError} If length or alphabet constraints are violated.
 * @throws {Error} If the runtime does not provide `crypto.getRandomValues`.
 * @example
 * const token = secureRandomString(32);
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
 * @param {Date | string | number} start Valid inclusive starting instant.
 * @param {Date | string | number} [end=new Date()] Valid inclusive ending instant.
 * @param {() => number} [random=Math.random] Source returning a finite value in `[0, 1)`.
 * @returns {Date} Fresh Date at a whole-millisecond instant in the range.
 * @throws {TypeError} If either boundary is not a valid Date-compatible value.
 * @throws {RangeError} If the range or random source violates delegated integer constraints.
 * @example
 * randomDate("2026-01-01", "2026-12-31");
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
