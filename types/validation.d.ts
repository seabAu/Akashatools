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
 * @param {T | null | undefined} value Candidate that may be nullish.
 * @returns {value is T} Whether value is neither null nor undefined; other falsy values pass.
 * @example
 * isDefined(0); // true
 * @since 2.0.0
 */
export declare function isDefined<T>(value: T | null | undefined): value is T;
/**
 * Checks for nullish values or strings containing only whitespace.
 *
 * @param {unknown} value Candidate for absence/whitespace semantics.
 * @returns {boolean} True only for null, undefined, or whitespace-only strings.
 * @example
 * isBlank("  "); // true
 * @since 2.0.0
 */
export declare function isBlank(value: unknown): boolean;
/**
 * Checks common empty values: blank strings, empty arrays, empty Maps/Sets, and
 * plain objects without enumerable own properties. Zero and false are not empty.
 *
 * @param {unknown} value Candidate collection, string, or plain object.
 * @returns {boolean} Whether value matches one explicitly supported empty shape.
 * @example
 * isEmpty(new Map()); // true
 * @since 2.0.0
 */
export declare function isEmpty(value: unknown): boolean;
/**
 * Checks whether a value is a finite primitive number.
 *
 * @param {unknown} value Candidate primitive.
 * @returns {value is number} Whether value is a primitive finite number without coercion.
 * @example
 * isFiniteNumber(0); // true
 * @since 2.0.0
 */
export declare function isFiniteNumber(value: unknown): value is number;
/**
 * Checks whether a value is a safe primitive integer.
 *
 * @param {unknown} value Candidate primitive.
 * @returns {value is number} Whether value is a primitive safe integer without coercion.
 * @example
 * isSafeInteger(1); // true
 * @since 2.0.0
 */
export declare function isSafeInteger(value: unknown): value is number;
/**
 * Checks for a Map, including Maps created in another JavaScript realm.
 *
 * @param {unknown} value Candidate from any JavaScript realm.
 * @returns {value is Map<unknown, unknown>} Whether the intrinsic Map brand accepts value.
 * @example
 * isMap(new Map()); // true
 * @since 2.0.0
 */
export declare function isMap(value: unknown): value is Map<unknown, unknown>;
/**
 * Checks for a Set, including Sets created in another JavaScript realm.
 *
 * @param {unknown} value Candidate from any JavaScript realm.
 * @returns {value is Set<unknown>} Whether the intrinsic Set brand accepts value.
 * @example
 * isSet(new Set()); // true
 * @since 2.0.0
 */
export declare function isSet(value: unknown): value is Set<unknown>;
/**
 * Checks for any typed-array view while excluding DataView. Cross-realm typed
 * arrays are accepted.
 *
 * @param {unknown} value Candidate view from any JavaScript realm.
 * @returns {value is Exclude<ArrayBufferView, DataView>} Whether value is a typed array rather than DataView.
 * @example
 * isTypedArray(new Uint16Array(2)); // true
 * @since 2.0.0
 */
export declare function isTypedArray(value: unknown): value is Exclude<ArrayBufferView, DataView>;
/**
 * Checks whether every item in an array is a plain object. Empty arrays satisfy
 * the contract; use `isNonEmptyArray` as an additional condition when needed.
 *
 * @param {unknown} value Candidate array.
 * @returns {value is Record<PropertyKey, unknown>[]} Whether every item is a plain object; empty arrays pass.
 * @example
 * isPlainObjectArray([{}, Object.create(null)]); // true
 * @since 2.0.0
 */
export declare function isPlainObjectArray(value: unknown): value is Record<PropertyKey, unknown>[];
/**
 * Checks for a Blob when the current runtime exposes `globalThis.Blob`.
 * Returns false instead of throwing in runtimes without Blob support.
 *
 * @param {unknown} value Candidate in the current runtime realm.
 * @returns {value is Blob} Whether current global Blob exists and value is its instance.
 * @example
 * isBlob(new Blob(["data"])); // true in Blob-capable runtimes
 * @since 2.0.0
 */
export declare function isBlob(value: unknown): value is Blob;
/**
 * Checks for a File when the current runtime exposes `globalThis.File`.
 * Returns false instead of throwing in runtimes without File support.
 *
 * @param {unknown} value Candidate in the current runtime realm.
 * @returns {value is File} Whether current global File exists and value is its instance.
 * @example
 * isFile(new File(["data"], "data.txt")); // true in File-capable runtimes
 * @since 2.0.0
 */
export declare function isFile(value: unknown): value is File;
/**
 * Returns a precise, lowercase runtime type name.
 *
 * @param {unknown} value Runtime value to brand without coercive parsing.
 * @returns {string} Lowercase intrinsic brand, with explicit null/array/nan names.
 * @example
 * typeOf(new Uint8Array()); // "uint8array"
 * @since 2.0.0
 */
export declare function typeOf(value: unknown): string;
/**
 * Checks whether a string contains valid JSON. Valid scalar JSON is accepted.
 *
 * @param {unknown} value Candidate JSON source text.
 * @returns {value is string} Whether value is a string accepted by JSON.parse, including scalar JSON.
 * @example
 * isJson("false"); // true
 * @since 2.0.0
 */
export declare function isJson(value: unknown): value is string;
/**
 * Performs pragmatic email syntax validation. It does not attempt deliverability
 * or full RFC mailbox validation.
 *
 * @param {unknown} value Candidate ASCII mailbox syntax.
 * @returns {value is string} Whether value satisfies bounded pragmatic syntax only.
 * @example
 * isEmail("person@example.com"); // true
 * @since 2.0.0
 */
export declare function isEmail(value: unknown): value is string;
/**
 * Normalizes a North American phone number into ten digits, or returns null.
 * A leading country code of 1 is accepted.
 *
 * @param {unknown} value String or non-negative safe integer containing NANP digits/punctuation.
 * @returns {string | null} Ten normalized digits, or null for unsupported syntax/ranges.
 * @example
 * normalizeNanpPhone("+1 555 123 4567"); // "5551234567"
 * @since 2.0.0
 */
export declare function normalizeNanpPhone(value: unknown): string | null;
/**
 * Formats a valid North American phone number as `(555) 123-4567`.
 *
 * @param {unknown} value Candidate accepted by normalizeNanpPhone.
 * @returns {string | null} `(555) 123-4567` text, or null when normalization fails.
 * @example
 * formatNanpPhone("555.123.4567"); // "(555) 123-4567"
 * @since 2.0.0
 */
export declare function formatNanpPhone(value: unknown): string | null;
/**
 * Validates a value against a useful JSON Schema subset. Supported keywords are
 * `$ref`, `type`, `const`, `enum`, `required`, `properties`, `items`,
 * `additionalProperties`, and `definitions`. Unsupported keywords and malformed
 * schemas throw instead of being silently ignored.
 *
 * @param {unknown} value JSON-compatible candidate to validate without coercion.
 * @param {JsonContract} schema Supported, well-formed local JSON contract schema.
 * @returns {string[]} Deterministic path-prefixed validation errors; empty means valid.
 * @throws {TypeError} If schema uses unsupported/malformed behavior.
 * @example
 * validateJsonContract({ id: 1 }, { type: "object", required: ["id"] }); // []
 * @since 2.0.0
 */
export declare function validateJsonContract(value: unknown, schema: JsonContract): string[];
/**
 * Asserts a value against the supported JSON Schema subset.
 *
 * @template T
 * @param {T} value JSON-compatible candidate returned unchanged on success.
 * @param {JsonContract} schema Supported, well-formed local JSON contract schema.
 * @returns {T} Original value after successful validation.
 * @throws {TypeError} If schema is invalid or value violates one or more contracts.
 * @example
 * const payload = assertJsonContract(input, { type: "object" });
 * @since 2.0.0
 */
export declare function assertJsonContract<T>(value: T, schema: JsonContract): T;
