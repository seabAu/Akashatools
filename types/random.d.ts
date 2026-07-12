/**
 * Returns a random float in the half-open range [minimum, maximum).
 *
 * @param {number} [minimum=0]
 * @param {number} [maximum=1]
 * @param {() => number} [random=Math.random]
 * @returns {number}
 * @since 2.0.0
 */
export declare function randomFloat(minimum?: number, maximum?: number, random?: () => number): number;
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
export declare function randomInt(minimum: number, maximum: number, { inclusiveMaximum, random }?: {
    inclusiveMaximum?: boolean;
    random?: () => number;
}): number;
/**
 * Returns a random boolean.
 *
 * @param {() => number} [random=Math.random]
 * @returns {boolean}
 * @since 2.0.0
 */
export declare function randomBoolean(random?: () => number): boolean;
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
export declare function randomString(length: number, characters?: string, random?: () => number): string;
/**
 * Returns a cryptographically secure RFC 4122 UUID through Web Crypto.
 *
 * @returns {string}
 * @throws {Error} If the runtime does not provide `crypto.randomUUID`.
 * @since 2.0.0
 */
export declare function secureRandomUuid(): string;
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
export declare function secureRandomString(length: number, alphabet?: string): string;
/**
 * Returns a random Date within an inclusive timestamp range.
 *
 * @param {Date | string | number} start
 * @param {Date | string | number} [end=new Date()]
 * @param {() => number} [random=Math.random]
 * @returns {Date}
 * @since 2.0.0
 */
export declare function randomDate(start: Date | string | number, end?: Date | string | number, random?: () => number): Date;
