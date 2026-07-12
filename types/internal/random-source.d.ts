/**
 * Validates a Math.random-compatible source.
 *
 * @param {unknown} random
 * @returns {asserts random is () => number}
 */
export declare function assertRandomSource(random: unknown): asserts random is () => number;
/**
 * Reads and validates one value from a Math.random-compatible source.
 *
 * @param {() => number} random
 * @returns {number}
 */
export declare function sampleRandom(random: () => number): number;
