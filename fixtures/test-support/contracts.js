import assert from "node:assert/strict";

/**
 * Runs an operation and proves its structured-cloneable input was not mutated.
 *
 * @template T, R
 * @param {T} input
 * @param {(input: T) => R} operation
 * @returns {R}
 */
export function assertDoesNotMutate(input, operation) {
  const before = structuredClone(input);
  const result = operation(input);
  assert.deepEqual(input, before);
  return result;
}

/**
 * Proves each invalid call throws the expected error constructor.
 *
 * @param {readonly (() => unknown)[]} calls
 * @param {ErrorConstructor} [expectedError]
 */
export function assertInvalidCallsThrow(calls, expectedError = TypeError) {
  for (const call of calls) assert.throws(call, expectedError);
}
