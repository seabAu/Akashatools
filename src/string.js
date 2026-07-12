const windowsReservedFilename = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

/**
 * Uppercases the first Unicode-aware character of a string.
 *
 * @param {string} value
 * @param {string | string[]} [locales]
 * @returns {string}
 */
export function capitalize(value, locales) {
  assertString(value, "value");
  const [first = "", ...rest] = [...value];
  return first.toLocaleUpperCase(locales) + rest.join("");
}

/**
 * Converts words and common identifier styles to kebab-case.
 *
 * @param {string} value
 * @returns {string}
 */
export function kebabCase(value) {
  assertString(value, "value");
  return words(value).map((word) => word.toLowerCase()).join("-");
}

/**
 * Converts words and common identifier styles to camelCase.
 *
 * @param {string} value
 * @returns {string}
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
 * @param {string} value
 * @returns {string}
 */
export function pascalCase(value) {
  return capitalize(camelCase(value));
}

/**
 * Converts an identifier into a human-readable sentence.
 *
 * @param {string} value
 * @returns {string}
 */
export function sentenceCase(value) {
  assertString(value, "value");
  return uppercaseFirst(words(value).map((word) => word.toLowerCase()).join(" "));
}

/**
 * Checks for literal text with optional case sensitivity.
 *
 * @param {string} value
 * @param {string} search
 * @param {{caseSensitive?: boolean, locales?: string | string[]}} [options]
 * @returns {boolean}
 */
export function includesText(value, search, { caseSensitive = false, locales } = {}) {
  assertString(value, "value");
  assertString(search, "search");
  return caseSensitive
    ? value.includes(search)
    : value.toLocaleLowerCase(locales).includes(search.toLocaleLowerCase(locales));
}

/**
 * Applies literal string replacements in insertion order. Unlike a RegExp-based
 * implementation, replacement keys are never interpreted as regex syntax.
 *
 * @param {string} value
 * @param {ReadonlyMap<string, string> | Record<string, string>} replacements
 * @returns {string}
 */
export function replaceMany(value, replacements) {
  assertString(value, "value");
  const entries = replacements instanceof Map ? replacements.entries() : Object.entries(replacements ?? {});
  let output = value;
  for (const [search, replacement] of entries) {
    output = output.replaceAll(search, replacement);
  }
  return output;
}

/**
 * Applies a caller-provided regular expression without mutating its `lastIndex`.
 * The expression is cloned with the same source and flags. This function does
 * not make an unsafe or backtracking-prone caller pattern safe.
 *
 * @param {string} value
 * @param {RegExp} pattern
 * @param {string | ((substring: string, ...args: any[]) => string)} replacement
 * @returns {string}
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
 * @param {unknown} value
 * @returns {number}
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
 * @param {string} value
 * @param {{fallback?: string, maximumLength?: number}} [options]
 * @returns {string}
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
 * @param {string} value
 * @param {{fallback?: string, maximumLength?: number}} [options]
 * @returns {string}
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
 * @param {unknown} value
 * @returns {string}
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
 * @param {unknown} value
 * @param {number | string} [space=2]
 * @returns {string}
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
