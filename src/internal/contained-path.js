/**
 * @typedef {object} PathApi
 * @property {string} sep
 * @property {(value: string) => boolean} isAbsolute
 * @property {(value: string) => {root: string}} parse
 * @property {(...values: string[]) => string} resolve
 * @property {(from: string, to: string) => string} relative
 */

/**
 * Resolves a path with an injected platform path API. This is kept outside the
 * public package surface so POSIX and Windows semantics can be tested on every
 * development host.
 *
 * @param {string} root
 * @param {string} relativePath
 * @param {PathApi} pathApi
 * @returns {string}
 * @internal
 */
export function resolveContainedPathWith(root, relativePath, pathApi) {
  if (typeof root !== "string" || root.trim() === "") {
    throw new TypeError("root must be a non-empty path string.");
  }
  if (typeof relativePath !== "string" || relativePath.trim() === "" || relativePath.includes("\0")) {
    throw new TypeError("relativePath must be a non-empty path string without null bytes.");
  }
  if (pathApi.isAbsolute(relativePath) || pathApi.parse(relativePath).root !== "") {
    throw new TypeError("relativePath must not be absolute or rooted.");
  }

  const resolvedRoot = pathApi.resolve(root);
  const resolvedTarget = pathApi.resolve(resolvedRoot, relativePath);
  assertContainedPath(resolvedRoot, resolvedTarget, pathApi, "relativePath escapes root.");
  return resolvedTarget;
}

/**
 * @param {string} root
 * @param {string} target
 * @param {PathApi} pathApi
 * @param {string} message
 * @returns {void}
 * @internal
 */
export function assertContainedPath(root, target, pathApi, message) {
  const relative = pathApi.relative(root, target);
  if (relative === ".." || relative.startsWith(`..${pathApi.sep}`) || pathApi.isAbsolute(relative)) {
    throw new RangeError(message);
  }
}
