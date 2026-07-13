const windowsReservedFilename = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

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
export function capitalize(value, locales) {
  assertString(value, "value");
  const [first = "", ...rest] = [...value];
  return first.toLocaleUpperCase(locales) + rest.join("");
}

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
export function kebabCase(value) {
  assertString(value, "value");
  return words(value).map((word) => word.toLowerCase()).join("-");
}

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
export function camelCase(value) {
  assertString(value, "value");
  return words(value).map((word, index) => {
    const lower = word.toLowerCase();
    return index === 0 ? lower : uppercaseFirst(lower);
  }).join("");
}

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
export function pascalCase(value) {
  return capitalize(camelCase(value));
}

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
export function sentenceCase(value) {
  assertString(value, "value");
  return uppercaseFirst(words(value).map((word) => word.toLowerCase()).join(" "));
}

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
export function includesText(value, search, { caseSensitive = false, locales } = {}) {
  assertString(value, "value");
  assertString(search, "search");
  if (typeof caseSensitive !== "boolean") throw new TypeError("caseSensitive must be a boolean.");
  return caseSensitive
    ? value.includes(search)
    : value.toLocaleLowerCase(locales).includes(search.toLocaleLowerCase(locales));
}

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
export function replaceMany(value, replacements) {
  assertString(value, "value");
  if (!(replacements instanceof Map) && !isRecord(replacements)) {
    throw new TypeError("replacements must be a Map or plain record.");
  }
  const entries = replacements instanceof Map ? replacements.entries() : Object.entries(replacements);
  let output = value;
  for (const [search, replacement] of entries) {
    if (typeof search !== "string" || typeof replacement !== "string") {
      throw new TypeError("replacement keys and values must be strings.");
    }
    output = output.replaceAll(search, replacement);
  }
  return output;
}

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
export function replaceRegex(value, pattern, replacement) {
  assertString(value, "value");
  if (!(pattern instanceof RegExp)) throw new TypeError("pattern must be a RegExp.");
  if (typeof replacement !== "string" && typeof replacement !== "function") {
    throw new TypeError("replacement must be a string or function.");
  }
  const clonedPattern = new RegExp(pattern.source, pattern.flags);
  return value.replace(clonedPattern, /** @type {any} */ (replacement));
}

/**
 * Returns the greatest string length among values, object keys, or a scalar.
 *
 * @param {unknown} value Array values, enumerable object keys, or one scalar to stringify.
 * @returns {number} Greatest UTF-16 code-unit length; nullish scalar entries count as empty.
 * @example
 * longestStringLength(["a", "longer"]); // 6
 * @since 2.0.0
 */
export function longestStringLength(value) {
  const candidates = Array.isArray(value)
    ? value
    : value !== null && typeof value === "object"
      ? Object.keys(value)
      : [value];
  return candidates.reduce((longest, candidate) => Math.max(longest, String(candidate ?? "").length), 0);
}

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
export function safeFilename(value, { fallback = "download", maximumLength = 80 } = {}) {
  assertString(value, "value");
  assertString(fallback, "fallback");
  assertMaximumLength(maximumLength);
  let normalized = asciiSlug(value, maximumLength) || asciiSlug(fallback, maximumLength) || asciiSlug("download", maximumLength);
  if (windowsReservedFilename.test(normalized)) normalized = asciiSlug(`file-${normalized}`, maximumLength);
  return normalized;
}

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
export function slugify(value, { fallback = "item", maximumLength = 80 } = {}) {
  assertString(value, "value");
  assertString(fallback, "fallback");
  assertMaximumLength(maximumLength);
  return asciiSlug(value, maximumLength) || asciiSlug(fallback, maximumLength) || asciiSlug("item", maximumLength);
}

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
export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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
export function prettyJson(value, space = 2) {
  const result = JSON.stringify(value, null, space);
  if (result === undefined) throw new TypeError("value is not JSON-serializable.");
  return result;
}

/** @param {string} value */
function words(value) {
  return value
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .match(/[\p{L}\p{N}]+/gu) ?? [];
}

/** @param {string} value */
function uppercaseFirst(value) {
  const [first = "", ...rest] = [...value];
  return first.toUpperCase() + rest.join("");
}

/** @param {string} value @param {number} maximumLength */
function asciiSlug(value, maximumLength) {
  return value.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maximumLength)
    .replace(/-+$/g, "");
}

/** @param {number} maximumLength */
function assertMaximumLength(maximumLength) {
  if (!Number.isSafeInteger(maximumLength) || maximumLength < 1) {
    throw new RangeError("maximumLength must be a positive safe integer.");
  }
}

/** @param {unknown} value @param {string} name */
function assertString(value, name) {
  if (typeof value !== "string") throw new TypeError(`${name} must be a string.`);
}

/** @param {unknown} value */
function isRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
