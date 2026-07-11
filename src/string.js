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
  return words(value).map((word) => word.toLocaleLowerCase()).join("-");
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
    const lower = word.toLocaleLowerCase();
    return index === 0 ? lower : capitalize(lower);
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
  return capitalize(words(value).map((word) => word.toLocaleLowerCase()).join(" "));
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
 * Creates a conservative lowercase filename stem.
 *
 * @param {string} value
 * @param {{fallback?: string, maximumLength?: number}} [options]
 * @returns {string}
 */
export function safeFilename(value, { fallback = "download", maximumLength = 80 } = {}) {
  assertString(value, "value");
  if (!Number.isSafeInteger(maximumLength) || maximumLength < 1) {
    throw new RangeError("maximumLength must be a positive safe integer.");
  }
  const normalized = value.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maximumLength)
    .replace(/-+$/g, "");
  return normalized || fallback;
}

/**
 * Escapes the five HTML-significant characters for safe text interpolation.
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

/** @param {unknown} value @param {string} name */
function assertString(value, name) {
  if (typeof value !== "string") throw new TypeError(`${name} must be a string.`);
}
