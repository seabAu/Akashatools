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
export declare function resolveContainedPath(root: string, relativePath: string): string;
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
export declare function resolveExistingContainedPath(root: string, relativePath: string): Promise<string>;
