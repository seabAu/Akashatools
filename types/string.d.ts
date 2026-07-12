/**
 * Uppercases the first Unicode-aware character of a string.
 *
 * @param {string} value
 * @param {string | string[]} [locales]
 * @returns {string}
 * @since 2.0.0
 */
export declare function capitalize(value: string, locales?: string | string[]): string;
/**
 * Converts words and common identifier styles to kebab-case.
 *
 * @param {string} value
 * @returns {string}
 * @since 2.0.0
 */
export declare function kebabCase(value: string): string;
/**
 * Converts words and common identifier styles to camelCase.
 *
 * @param {string} value
 * @returns {string}
 * @since 2.0.0
 */
export declare function camelCase(value: string): string;
/**
 * Converts words and common identifier styles to PascalCase.
 *
 * @param {string} value
 * @returns {string}
 * @since 2.0.0
 */
export declare function pascalCase(value: string): string;
/**
 * Converts an identifier into a human-readable sentence.
 *
 * @param {string} value
 * @returns {string}
 * @since 2.0.0
 */
export declare function sentenceCase(value: string): string;
/**
 * Checks for literal text with optional case sensitivity.
 *
 * @param {string} value
 * @param {string} search
 * @param {{caseSensitive?: boolean, locales?: string | string[]}} [options]
 * @returns {boolean}
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
 * @param {string} value
 * @param {ReadonlyMap<string, string> | Record<string, string>} replacements
 * @returns {string}
 * @since 2.0.0
 */
export declare function replaceMany(value: string, replacements: ReadonlyMap<string, string> | Record<string, string>): string;
/**
 * Applies a caller-provided regular expression without mutating its `lastIndex`.
 * The expression is cloned with the same source and flags. This function does
 * not make an unsafe or backtracking-prone caller pattern safe.
 *
 * @param {string} value
 * @param {RegExp} pattern
 * @param {string | ((substring: string, ...args: any[]) => string)} replacement
 * @returns {string}
 * @since 2.0.0
 */
export declare function replaceRegex(value: string, pattern: RegExp, replacement: string | ((substring: string, ...args: any[]) => string)): string;
/**
 * Returns the greatest string length among values, object keys, or a scalar.
 *
 * @param {unknown} value
 * @returns {number}
 * @since 2.0.0
 */
export declare function longestStringLength(value: unknown): number;
/**
 * Creates a conservative lowercase filename stem. Output is ASCII, NFKD
 * normalized, bounded, free of trailing punctuation/control characters, and
 * prefixed when it would equal a reserved Windows device name.
 *
 * @param {string} value
 * @param {{fallback?: string, maximumLength?: number}} [options]
 * @returns {string}
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
 * @param {string} value
 * @param {{fallback?: string, maximumLength?: number}} [options]
 * @returns {string}
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
 * @param {unknown} value
 * @returns {string}
 * @since 2.0.0
 */
export declare function escapeHtml(value: unknown): string;
/**
 * Serializes a JSON-compatible value with human-readable indentation.
 *
 * @param {unknown} value
 * @param {number | string} [space=2]
 * @returns {string}
 * @since 2.0.0
 */
export declare function prettyJson(value: unknown, space?: number | string): string;
