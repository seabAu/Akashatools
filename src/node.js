import { glob as fsGlob, realpath } from "node:fs/promises";
import * as path from "node:path";

import { assertContainedPath, resolveContainedPathWith } from "./internal/contained-path.js";
import { isPlainObject } from "./object.js";

const maximumGlobPatterns = 100;
const maximumGlobPatternLength = 10_000;

/**
 * Resolves a relative path beneath a root without accessing the filesystem.
 * Absolute, drive-relative, UNC/rooted, null-byte, and escaping paths are
 * rejected. This lexical check does not inspect symlinks.
 *
 * @param {string} root Absolute or resolved containment root.
 * @param {string} relativePath Relative child path to resolve beneath root.
 * @returns {string} Lexically resolved path beneath root.
 * @throws {TypeError} If either argument is not a supported path string.
 * @throws {RangeError} If the resolved path escapes the root.
 * @example
 * resolveContainedPath("/srv/media", "2026/report.pdf");
 * @since 2.0.0
 */
export function resolveContainedPath(root, relativePath) {
  return resolveContainedPathWith(root, relativePath, path);
}

/**
 * Resolves an existing path beneath an existing root, following symlinks for
 * both and rejecting targets whose real path is outside the real root.
 * Filesystem errors such as missing paths and permission failures propagate.
 * The returned string is a checked snapshot; callers performing sensitive
 * mutations must still account for later symlink/time-of-check changes.
 *
 * @param {string} root Existing containment root whose real path is authoritative.
 * @param {string} relativePath Existing relative child path to check beneath root.
 * @returns {Promise<string>} Real target path proven inside the real root at check time.
 * @throws {TypeError} If either argument is not a supported path string.
 * @throws {RangeError} If the lexical or real target escapes the root.
 * @example
 * const safePath = await resolveExistingContainedPath("/srv/media", "2026/report.pdf");
 * @since 2.0.0
 */
export async function resolveExistingContainedPath(root, relativePath) {
  const target = resolveContainedPath(root, relativePath);
  const [realRoot, realTarget] = await Promise.all([realpath(path.resolve(root)), realpath(target)]);
  assertContainedPath(realRoot, realTarget, path, "Existing path resolves outside root.");
  return realTarget;
}

/**
 * Collects paths matching one or more native Node glob patterns in deterministic
 * code-unit order. Duplicate matches are removed and collection stops at an
 * explicit work bound. Matches may be files or directories according to the
 * patterns; this discovery helper performs no filesystem mutation or security
 * containment check.
 *
 * @param {string | readonly string[]} pattern One nonblank native Node glob pattern or a nonempty array of at most 100 patterns.
 * @param {{cwd?: string, exclude?: readonly string[], absolute?: boolean, maximumMatches?: number}} [options] Search directory, up to 100 exclusion patterns, absolute-output choice, and positive unique-match bound.
 * @returns {Promise<string[]>} Deduplicated matching paths sorted deterministically.
 * @throws {TypeError} If patterns, cwd, or options do not match their literal contracts.
 * @throws {RangeError} If a pattern/input bound or maximumMatches is exceeded.
 * @example
 * const sourceJavaScript = ["src", "**", "*.js"].join("/");
 * await globPaths(sourceJavaScript);
 * @since 2.0.0
 */
export async function globPaths(pattern, options = {}) {
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const { cwd = process.cwd(), exclude = [], absolute = false, maximumMatches = 100_000 } = options;
  const patterns = normalizeGlobPatterns(pattern, "pattern", false);
  const exclusions = normalizeGlobPatterns(exclude, "exclude", true);
  if (typeof cwd !== "string" || cwd.trim() === "" || cwd.includes("\0")) {
    throw new TypeError("cwd must be a nonblank path string without null bytes.");
  }
  if (typeof absolute !== "boolean") throw new TypeError("absolute must be a boolean.");
  if (!Number.isSafeInteger(maximumMatches) || maximumMatches < 1) {
    throw new RangeError("maximumMatches must be a positive safe integer.");
  }

  const matches = new Set();
  for await (const match of fsGlob(patterns, { cwd, exclude: exclusions })) {
    matches.add(absolute ? path.resolve(cwd, match) : match);
    if (matches.size > maximumMatches) throw new RangeError("globPaths exceeded maximumMatches.");
  }
  return [...matches].sort(compareCodeUnits);
}

/** @param {unknown} value @param {string} name @param {boolean} allowEmpty */
function normalizeGlobPatterns(value, name, allowEmpty) {
  const patterns = typeof value === "string" ? [value] : value;
  if (!Array.isArray(patterns) || (!allowEmpty && patterns.length === 0)) {
    throw new TypeError(`${name} must be a pattern string or ${allowEmpty ? "an" : "a nonempty"} array of strings.`);
  }
  if (patterns.length > maximumGlobPatterns) {
    throw new RangeError(`${name} cannot contain more than ${maximumGlobPatterns} patterns.`);
  }
  return patterns.map((entry, index) => {
    if (typeof entry !== "string" || entry.trim() === "" || entry.includes("\0")) {
      throw new TypeError(`${name}[${index}] must be a nonblank string without null bytes.`);
    }
    if (entry.length > maximumGlobPatternLength) {
      throw new RangeError(`${name}[${index}] cannot exceed ${maximumGlobPatternLength} code units.`);
    }
    return entry;
  });
}

/** @param {string} left @param {string} right */
function compareCodeUnits(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}
