/**
 * Validates a Math.random-compatible source.
 *
 * @param {unknown} random
 * @returns {asserts random is () => number}
 */
export function assertRandomSource(random) {
  if (typeof random !== "function") throw new TypeError("random must be a function.");
}

/**
 * Reads and validates one value from a Math.random-compatible source.
 *
 * @param {() => number} random
 * @returns {number}
 */
export function sampleRandom(random) {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError("random must return a finite number in the range [0, 1).");
  }
  return value;
}
