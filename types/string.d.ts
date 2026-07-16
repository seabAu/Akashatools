/**
 * Uppercases the first Unicode-aware character of a string.
 *
 * @param {string} value String whose first Unicode code point is uppercased.
 * @param {string | string[]} [locales] Locale preference passed to toLocaleUpperCase.
 * @returns {string} New string, or an empty string for empty input.
 * @throws {TypeError | RangeError} If value or locales is invalid.
 * @example
 * capitalize("élan"); // "Élan"
 * @since 2.0.0
 */
export declare function capitalize(value: string, locales?: string | string[]): string;
/**
 * Converts words and common identifier styles to kebab-case.
 *
 * @param {string} value Words or identifier text to normalize.
 * @returns {string} Lowercase hyphen-delimited words.
 * @throws {TypeError} If value is not a string.
 * @example
 * kebabCase("XMLHttp request_value"); // "xml-http-request-value"
 * @since 2.0.0
 */
export declare function kebabCase(value: string): string;
/**
 * Converts words and common identifier styles to camelCase.
 *
 * @param {string} value Words or identifier text to normalize.
 * @returns {string} Lower camel-cased identifier.
 * @throws {TypeError} If value is not a string.
 * @example
 * camelCase("hello-world"); // "helloWorld"
 * @since 2.0.0
 */
export declare function camelCase(value: string): string;
/**
 * Converts words and common identifier styles to PascalCase.
 *
 * @param {string} value Words or identifier text to normalize.
 * @returns {string} Upper camel-cased identifier.
 * @throws {TypeError} If value is not a string.
 * @example
 * pascalCase("version2-api"); // "Version2Api"
 * @since 2.0.0
 */
export declare function pascalCase(value: string): string;
/**
 * Converts an identifier into a human-readable sentence.
 *
 * @param {string} value Identifier or words to render as a sentence label.
 * @returns {string} Space-delimited lowercase words with the first code point uppercased.
 * @throws {TypeError} If value is not a string.
 * @example
 * sentenceCase("helloWorld_value"); // "Hello world value"
 * @since 2.0.0
 */
export declare function sentenceCase(value: string): string;
/**
 * Checks for literal text with optional case sensitivity.
 *
 * @param {string} value String to search.
 * @param {string} search Literal substring to find; an empty search matches.
 * @param {{caseSensitive?: boolean, locales?: string | string[]}} [options] Literal case policy and locale preferences.
 * @returns {boolean} Whether search occurs in value.
 * @throws {TypeError | RangeError} If strings, caseSensitive, or locales are invalid.
 * @example
 * includesText("Akasha Tools", "tools"); // true
 * @since 2.0.0
 */
export declare function includesText(value: string, search: string, { caseSensitive, locales }?: {
    caseSensitive?: boolean;
    locales?: string | string[];
}): boolean;
/**
 * Applies literal string replacements in insertion order. Unlike a RegExp-based
 * implementation, replacement keys are never interpreted as regex syntax.
 *
 * @param {string} value Source string left unmodified.
 * @param {ReadonlyMap<string, string> | Record<string, string>} replacements Literal string pairs applied in iteration order.
 * @returns {string} String after every ordered literal replacement.
 * @throws {TypeError} If value, the replacement container, or any pair is not string-based.
 * @example
 * replaceMany("a.b + a.b", { "a.b": "x" }); // "x + x"
 * @since 2.0.0
 */
export declare function replaceMany(value: string, replacements: ReadonlyMap<string, string> | Record<string, string>): string;
/**
 * Applies a caller-provided regular expression without mutating its `lastIndex`.
 * The expression is cloned with the same source and flags. This function does
 * not make an unsafe or backtracking-prone caller pattern safe.
 *
 * @param {string} value Source string left unmodified.
 * @param {RegExp} pattern Expression cloned with its source and flags.
 * @param {string | ((substring: string, ...args: any[]) => string)} replacement Native replacement string or callback.
 * @returns {string} Replaced string without changing pattern.lastIndex.
 * @throws {TypeError | SyntaxError} If arguments are invalid or the cloned expression cannot be constructed.
 * @example
 * replaceRegex("a1 b2", /([a-z])(\d)/g, "$2$1"); // "1a 2b"
 * @since 2.0.0
 */
export declare function replaceRegex(value: string, pattern: RegExp, replacement: string | ((substring: string, ...args: any[]) => string)): string;
/**
 * Returns the greatest string length among values, object keys, or a scalar.
 *
 * @param {unknown} value Array values, enumerable object keys, or one scalar to stringify.
 * @returns {number} Greatest UTF-16 code-unit length; nullish scalar entries count as empty.
 * @example
 * longestStringLength(["a", "longer"]); // 6
 * @since 2.0.0
 */
export declare function longestStringLength(value: unknown): number;
/**
 * Creates a conservative lowercase filename stem. Output is ASCII, NFKD
 * normalized, bounded, free of trailing punctuation/control characters, and
 * prefixed when it would equal a reserved Windows device name.
 *
 * @param {string} value Filename stem to normalize without an extension policy.
 * @param {{fallback?: string, maximumLength?: number}} [options] Fallback text and positive code-unit bound.
 * @returns {string} Non-empty conservative ASCII filename stem.
 * @throws {TypeError | RangeError} If strings or maximumLength are invalid.
 * @example
 * safeFilename(" Résumé / July "); // "resume-july"
 * @since 2.0.0
 */
export declare function safeFilename(value: string, { fallback, maximumLength }?: {
    fallback?: string;
    maximumLength?: number;
}): string;
/**
 * Creates a bounded ASCII URL/path slug with Unicode compatibility
 * normalization. Empty normalized input returns a normalized fallback.
 *
 * @param {string} value URL/path component text to normalize.
 * @param {{fallback?: string, maximumLength?: number}} [options] Fallback text and positive code-unit bound.
 * @returns {string} Non-empty lowercase ASCII slug.
 * @throws {TypeError | RangeError} If strings or maximumLength are invalid.
 * @example
 * slugify("Crème brûlée / API v2"); // "creme-brulee-api-v2"
 * @since 2.0.0
 */
export declare function slugify(value: string, { fallback, maximumLength }?: {
    fallback?: string;
    maximumLength?: number;
}): string;
/**
 * Encodes five HTML-significant characters for an HTML text context. This is
 * not HTML sanitization and does not make markup, URLs, CSS, or scripts safe.
 *
 * @param {unknown} value Value stringified before text-context escaping.
 * @returns {string} Text with ampersand, brackets, quotes, and apostrophes encoded.
 * @example
 * escapeHtml('<script src="x">'); // "&lt;script src=&quot;x&quot;&gt;"
 * @since 2.0.0
 */
export declare function escapeHtml(value: unknown): string;
/**
 * Serializes a JSON-compatible value with human-readable indentation.
 *
 * @param {unknown} value JSON-compatible value to serialize.
 * @param {number | string} [space=2] Indentation accepted by JSON.stringify.
 * @returns {string} Serialized JSON text.
 * @throws {TypeError} If serialization fails or returns undefined.
 * @example
 * prettyJson({ ok: true });
 * @since 2.0.0
 */
export declare function prettyJson(value: unknown, space?: number | string): string;
/**
 * Serializes strict plain JSON with recursively sorted object keys. Key order is
 * Unicode code-unit order and is therefore independent of locale and object
 * insertion history. Enumerable accessors, symbol keys, sparse arrays,
 * non-finite numbers, unsupported values, and cycles are rejected rather than
 * coerced or invoked.
 *
 * @param {unknown} value Plain JSON value to serialize deterministically.
 * @param {{maximumDepth?: number, maximumNodes?: number, maximumLength?: number}} [options] Non-negative depth and positive node/output code-unit work limits.
 * @returns {string} Compact deterministic JSON text.
 * @throws {TypeError} If value/options contain unsupported JSON shapes or active property semantics.
 * @throws {RangeError} If limits are invalid or serialization exceeds one of them.
 * @example
 * stableJson({ z: 1, a: { y: true, x: null } }); // '{"a":{"x":null,"y":true},"z":1}'
 * @since 2.0.0
 */
export declare function stableJson(value: unknown, options?: {
    maximumDepth?: number;
    maximumNodes?: number;
    maximumLength?: number;
}): string;
