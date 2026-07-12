export type JsonContractType = "array" | "object" | "integer" | "null" | "string" | "number" | "boolean";
export type JsonContract = {
    $ref?: string;
    type?: JsonContractType | readonly JsonContractType[];
    const?: unknown;
    enum?: readonly unknown[];
    required?: readonly string[];
    properties?: Record<string, JsonContract>;
    items?: JsonContract;
    additionalProperties?: boolean;
    definitions?: Record<string, JsonContract>;
};
/**
 * Checks whether a value is neither null nor undefined.
 *
 * @template T
 * @param {T | null | undefined} value
 * @returns {value is T}
 * @since 2.0.0
 */
export declare function isDefined<T>(value: T | null | undefined): value is T;
/**
 * Checks for nullish values or strings containing only whitespace.
 *
 * @param {unknown} value
 * @returns {boolean}
 * @since 2.0.0
 */
export declare function isBlank(value: unknown): boolean;
/**
 * Checks common empty values: blank strings, empty arrays, empty Maps/Sets, and
 * plain objects without enumerable own properties. Zero and false are not empty.
 *
 * @param {unknown} value
 * @returns {boolean}
 * @since 2.0.0
 */
export declare function isEmpty(value: unknown): boolean;
/**
 * Checks whether a value is a finite primitive number.
 *
 * @param {unknown} value
 * @returns {value is number}
 * @since 2.0.0
 */
export declare function isFiniteNumber(value: unknown): value is number;
/**
 * Checks whether a value is a safe primitive integer.
 *
 * @param {unknown} value
 * @returns {value is number}
 * @since 2.0.0
 */
export declare function isSafeInteger(value: unknown): value is number;
/**
 * Checks for a Map, including Maps created in another JavaScript realm.
 *
 * @param {unknown} value
 * @returns {value is Map<unknown, unknown>}
 * @since 2.0.0
 */
export declare function isMap(value: unknown): value is Map<unknown, unknown>;
/**
 * Checks for a Set, including Sets created in another JavaScript realm.
 *
 * @param {unknown} value
 * @returns {value is Set<unknown>}
 * @since 2.0.0
 */
export declare function isSet(value: unknown): value is Set<unknown>;
/**
 * Checks for any typed-array view while excluding DataView. Cross-realm typed
 * arrays are accepted.
 *
 * @param {unknown} value
 * @returns {value is Exclude<ArrayBufferView, DataView>}
 * @since 2.0.0
 */
export declare function isTypedArray(value: unknown): value is Exclude<ArrayBufferView, DataView>;
/**
 * Checks whether every item in an array is a plain object. Empty arrays satisfy
 * the contract; use `isNonEmptyArray` as an additional condition when needed.
 *
 * @param {unknown} value
 * @returns {value is Record<PropertyKey, unknown>[]}
 * @since 2.0.0
 */
export declare function isPlainObjectArray(value: unknown): value is Record<PropertyKey, unknown>[];
/**
 * Checks for a Blob when the current runtime exposes `globalThis.Blob`.
 * Returns false instead of throwing in runtimes without Blob support.
 *
 * @param {unknown} value
 * @returns {value is Blob}
 * @since 2.0.0
 */
export declare function isBlob(value: unknown): value is Blob;
/**
 * Checks for a File when the current runtime exposes `globalThis.File`.
 * Returns false instead of throwing in runtimes without File support.
 *
 * @param {unknown} value
 * @returns {value is File}
 * @since 2.0.0
 */
export declare function isFile(value: unknown): value is File;
/**
 * Returns a precise, lowercase runtime type name.
 *
 * @param {unknown} value
 * @returns {string}
 * @since 2.0.0
 */
export declare function typeOf(value: unknown): string;
/**
 * Checks whether a string contains valid JSON. Valid scalar JSON is accepted.
 *
 * @param {unknown} value
 * @returns {value is string}
 * @since 2.0.0
 */
export declare function isJson(value: unknown): value is string;
/**
 * Performs pragmatic email syntax validation. It does not attempt deliverability
 * or full RFC mailbox validation.
 *
 * @param {unknown} value
 * @returns {value is string}
 * @since 2.0.0
 */
export declare function isEmail(value: unknown): value is string;
/**
 * Normalizes a North American phone number into ten digits, or returns null.
 * A leading country code of 1 is accepted.
 *
 * @param {unknown} value
 * @returns {string | null}
 * @since 2.0.0
 */
export declare function normalizeNanpPhone(value: unknown): string | null;
/**
 * Formats a valid North American phone number as `(555) 123-4567`.
 *
 * @param {unknown} value
 * @returns {string | null}
 * @since 2.0.0
 */
export declare function formatNanpPhone(value: unknown): string | null;
/**
 * Validates a value against a useful JSON Schema subset. Supported keywords are
 * `$ref`, `type`, `const`, `enum`, `required`, `properties`, `items`,
 * `additionalProperties`, and `definitions`. Unsupported keywords and malformed
 * schemas throw instead of being silently ignored.
 *
 * @param {unknown} value
 * @param {JsonContract} schema
 * @returns {string[]}
 * @since 2.0.0
 */
export declare function validateJsonContract(value: unknown, schema: JsonContract): string[];
/**
 * Asserts a value against the supported JSON Schema subset.
 *
 * @template T
 * @param {T} value
 * @param {JsonContract} schema
 * @returns {T}
 * @since 2.0.0
 */
export declare function assertJsonContract<T>(value: T, schema: JsonContract): T;
