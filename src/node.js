import { realpath } from "node:fs/promises";
import * as path from "node:path";

import { assertContainedPath, resolveContainedPathWith } from "./internal/contained-path.js";

/**
 * Resolves a relative path beneath a root without accessing the filesystem.
 * Absolute, drive-relative, UNC/rooted, null-byte, and escaping paths are
 * rejected. This lexical check does not inspect symlinks.
 *
 * @param {string} root
 * @param {string} relativePath
 * @returns {string}
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
 * @param {string} root
 * @param {string} relativePath
 * @returns {Promise<string>}
 * @throws {TypeError} If either argument is not a supported path string.
 * @throws {RangeError} If the lexical or real target escapes the root.
 * @since 2.0.0
 */
export async function resolveExistingContainedPath(root, relativePath) {
  const target = resolveContainedPath(root, relativePath);
  const [realRoot, realTarget] = await Promise.all([
    realpath(path.resolve(root)),
    realpath(target),
  ]);
  assertContainedPath(realRoot, realTarget, path, "Existing path resolves outside root.");
  return realTarget;
}
