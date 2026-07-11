const blockedPathSegments = new Set(["__proto__", "prototype", "constructor"]);

/**
 * Checks whether a value is an object with Object.prototype or a null prototype.
 *
 * @param {unknown} value
 * @returns {value is Record<PropertyKey, unknown>}
 */
export function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Parses a safe dot/bracket property path. Prototype-mutating segments are
 * rejected to prevent prototype-pollution vulnerabilities.
 *
 * @param {string | readonly (string | number)[]} path
 * @returns {(string | number)[]}
 */
export function parsePath(path) {
  if (Array.isArray(path)) return path.map(normalizePathSegment);
  if (typeof path !== "string" || path.trim() === "") {
    throw new TypeError("path must be a non-empty string or segment array.");
  }

  const normalized = path.trim().replace(/\[(\d+)\]/g, ".$1");
  if (/[\[\]]/.test(normalized)) throw new TypeError(`Invalid property path: ${path}`);
  return normalized.split(".").map(normalizePathSegment);
}

/**
 * Reads an own property at a nested path, returning a fallback only when the
 * path is absent. An existing `undefined` value is returned as-is.
 *
 * @template T
 * @param {unknown} value
 * @param {string | readonly (string | number)[]} path
 * @param {T} [fallback]
 * @returns {unknown | T}
 */
export function getAtPath(value, path, fallback) {
  const segments = parsePath(path);
  let current = value;
  for (const segment of segments) {
    if (!isObjectLike(current) || !Object.hasOwn(current, segment)) return fallback;
    current = /** @type {Record<PropertyKey, unknown>} */ (current)[segment];
  }
  return current;
}

/**
 * Checks whether every segment of a nested own-property path exists.
 *
 * @param {unknown} value
 * @param {string | readonly (string | number)[]} path
 * @returns {boolean}
 */
export function hasAtPath(value, path) {
  const marker = Symbol("missing");
  return getAtPath(value, path, marker) !== marker;
}

/**
 * Sets a nested value while structurally sharing untouched objects and arrays.
 * Missing containers are inferred from the following path segment.
 *
 * @template T
 * @param {T} value
 * @param {string | readonly (string | number)[]} path
 * @param {unknown} nextValue
 * @returns {T}
 */
export function setAtPath(value, path, nextValue) {
  const segments = parsePath(path);

  /** @param {any} current @param {number} offset @returns {any} */
  const setSegment = (current, offset) => {
    if (offset === segments.length) return nextValue;
    const segment = segments[offset];
    const nextSegment = segments[offset + 1];
    const source = isObjectLike(current) ? current : undefined;
    /** @type {any} */
    const clone = Array.isArray(source) ? [...source] : { ...(source ?? {}) };
    const child = source && Object.hasOwn(source, segment)
      ? /** @type {Record<PropertyKey, any>} */ (/** @type {unknown} */ (source))[segment]
      : typeof nextSegment === "number" ? [] : {};
    clone[segment] = setSegment(child, offset + 1);
    return clone;
  };

  return /** @type {T} */ (setSegment(value, 0));
}

/**
 * Returns an object containing selected own properties.
 *
 * @template {object} T
 * @param {T} value
 * @param {readonly (keyof T)[]} keys
 * @returns {Partial<T>}
 */
export function pick(value, keys) {
  if (!isObjectLike(value)) throw new TypeError("value must be an object.");
  if (!Array.isArray(keys)) throw new TypeError("keys must be an array.");

  /** @type {Record<PropertyKey, unknown>} */
  const output = {};
  for (const key of keys) {
    if (Object.hasOwn(value, key)) output[key] = value[key];
  }
  return /** @type {Partial<T>} */ (output);
}

/**
 * Returns a shallow copy without the selected own properties.
 *
 * @template {object} T
 * @param {T} value
 * @param {readonly (keyof T)[]} keys
 * @returns {Partial<T>}
 */
export function omit(value, keys) {
  if (!isObjectLike(value)) throw new TypeError("value must be an object.");
  if (!Array.isArray(keys)) throw new TypeError("keys must be an array.");
  const excluded = new Set(keys);
  return /** @type {Partial<T>} */ (Object.fromEntries(Object.entries(value).filter(([key]) => !excluded.has(key))));
}

/**
 * Deeply clones structured-cloneable values, including circular references,
 * Maps, Sets, Dates, typed arrays, and transferable values.
 *
 * @template T
 * @param {T} value
 * @param {StructuredSerializeOptions} [options]
 * @returns {T}
 */
export function deepClone(value, options) {
  return structuredClone(value, options);
}

/**
 * Recursively merges plain objects without mutating either input. Arrays and
 * non-plain objects are replaced. Unsafe property names are rejected.
 *
 * @template {Record<PropertyKey, unknown>} T
 * @template {Record<PropertyKey, unknown>} U
 * @param {T} base
 * @param {U} override
 * @returns {T & U}
 */
export function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    throw new TypeError("deepMerge expects two plain objects.");
  }

  /** @type {Record<string, unknown>} */
  const output = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (blockedPathSegments.has(key)) throw new TypeError(`Unsafe property: ${key}`);
    output[key] = isPlainObject(value) && isPlainObject(output[key])
      ? deepMerge(output[key], value)
      : value;
  }
  return /** @type {T & U} */ (output);
}

/**
 * Returns a new object containing only allowed own properties. Unknown or
 * prototype-mutating properties can be rejected or skipped.
 *
 * @param {unknown} value
 * @param {readonly string[]} allowedKeys
 * @param {{rejectUnknown?: boolean}} [options]
 * @returns {Record<string, unknown>}
 */
export function pickAllowed(value, allowedKeys, { rejectUnknown = true } = {}) {
  if (!isPlainObject(value)) throw new TypeError("value must be a plain object.");
  if (!Array.isArray(allowedKeys)) throw new TypeError("allowedKeys must be an array.");

  const allowed = new Set(allowedKeys);
  /** @type {Record<string, unknown>} */
  const output = {};
  for (const key of Object.keys(value)) {
    if (blockedPathSegments.has(key) || !allowed.has(key)) {
      if (rejectUnknown) throw new TypeError(`Unknown property: ${key}`);
      continue;
    }
    output[key] = value[key];
  }
  return output;
}

/** @param {unknown} value @returns {value is Record<PropertyKey, unknown> | unknown[]} */
function isObjectLike(value) {
  return value !== null && typeof value === "object";
}

/** @param {unknown} segment @returns {string | number} */
function normalizePathSegment(segment) {
  const normalized = typeof segment === "number" || /^\d+$/.test(String(segment))
    ? Number(segment)
    : String(segment);
  if (typeof normalized === "number" && (!Number.isSafeInteger(normalized) || normalized < 0)) {
    throw new TypeError(`Invalid property path segment: ${String(segment)}`);
  }
  if (typeof normalized === "string" && (
    normalized === "" ||
    blockedPathSegments.has(normalized) ||
    !/^[A-Za-z_$][A-Za-z0-9_$-]*$/.test(normalized)
  )) throw new TypeError(`Invalid property path segment: ${normalized}`);
  return normalized;
}
