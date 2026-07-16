import { resolveContainedPath } from "akashatools/node";
import { cloneJson, deepMerge, pick } from "akashatools/object";

/**
 * Representative Mindspace server boundary: bound plain JSON first, then apply
 * the route-specific allowlist in the application adapter.
 */
export function prepareMindspacePayload(value, allowedKeys, limits = {}) {
  return pick(cloneJson(value, limits), allowedKeys);
}

/** Replaces the legacy mutating merge while preserving explicit falsy values. */
export function mergeMindspaceSettings(defaults, overrides) {
  return deepMerge(defaults, overrides);
}

/** Keeps Mindspace media-root selection local while sharing path containment. */
export function resolveMindspaceMediaPath(mediaRoot, storageKey) {
  return resolveContainedPath(mediaRoot, storageKey);
}
