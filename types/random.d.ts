/**
 * Returns a random float in the half-open range [minimum, maximum).
 *
 * @param {number} [minimum=0] Finite inclusive lower boundary.
 * @param {number} [maximum=1] Finite exclusive upper boundary.
 * @param {() => number} [random=Math.random] Source returning a finite value in `[0, 1)`.
 * @returns {number} Random value in the requested half-open interval.
 * @throws {TypeError} If bounds or the random source are not finite/function values.
 * @throws {RangeError} If the range is empty/reversed, its width overflows, or random violates `[0, 1)`.
 * @example
 * randomFloat(10, 20); // 10 <= result < 20
 * @since 2.0.0
 */
export declare function randomFloat(minimum?: number, maximum?: number, random?: () => number): number;
/**
 * Returns a random integer. The minimum is inclusive; the maximum can be
 * inclusive (default) or exclusive.
 *
 * @param {number} minimum Safe-integer inclusive lower boundary.
 * @param {number} maximum Safe-integer upper boundary.
 * @param {{inclusiveMaximum?: boolean, random?: () => number}} [options] Upper-bound inclusion and injectable `[0, 1)` source.
 * @returns {number} Random safe integer in the requested range.
 * @throws {TypeError} If bounds, options, inclusiveMaximum, or random do not match their contracts.
 * @throws {RangeError} If the range is reversed, empty, too wide, or random violates `[0, 1)`.
 * @example
 * randomInt(1, 6); // inclusive dice roll
 * @since 2.0.0
 */
export declare function randomInt(minimum: number, maximum: number, options?: {
    inclusiveMaximum?: boolean;
    random?: () => number;
}): number;
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
export declare function randomBoolean(random?: () => number): boolean;
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
export declare function randomString(length: number, characters?: string, random?: () => number): string;
/**
 * Returns a cryptographically secure RFC 4122 UUID through Web Crypto.
 *
 * @returns {string} Cryptographically secure UUID string supplied by Web Crypto.
 * @throws {Error} If the runtime does not provide `crypto.randomUUID`.
 * @example
 * const requestId = secureRandomUuid();
 * @since 2.0.0
 */
export declare function secureRandomUuid(): string;
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
export declare function secureRandomString(length: number, alphabet?: string): string;
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
export declare function randomDate(start: Date | string | number, end?: Date | string | number, random?: () => number): Date;
