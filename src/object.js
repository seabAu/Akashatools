const blockedPathSegments = new Set(["__proto__", "prototype", "constructor"]);

/**
 * @typedef {object} ObjectTraversalEntry
 * @property {unknown} value
 * @property {string | number | undefined} key
 * @property {(string | number)[]} path
 * @property {Record<PropertyKey, unknown> | unknown[] | undefined} parent
 */

/**
 * @typedef {object} ObjectTraversalOptions
 * @property {boolean} [includeRoot=false]
 * @property {number} [maxDepth=100]
 * @property {number} [maxNodes=10000]
 */

/**
 * Checks whether a value is an object with Object.prototype or a null prototype.
 *
 * @param {unknown} value
 * @returns {value is Record<PropertyKey, unknown>}
 * @since 2.0.0
 */
export function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype === null) return true;
  if (!Object.hasOwn(prototype, "constructor")) return false;
  const constructor = prototype.constructor;
  return typeof constructor === "function" &&
    Function.prototype.toString.call(constructor) === Function.prototype.toString.call(Object);
}

/**
 * Parses a safe dot/bracket property path. Prototype-mutating segments are
 * rejected to prevent prototype-pollution vulnerabilities.
 *
 * @param {string | readonly (string | number)[]} path
 * @returns {(string | number)[]}
 * @since 2.0.0
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
 * @since 2.0.0
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
 * @since 2.0.0
 */
export function hasAtPath(value, path) {
  const marker = Symbol("missing");
  return getAtPath(value, path, marker) !== marker;
}

/**
 * Sets a nested value while structurally sharing untouched objects and arrays.
 * Missing containers are inferred from the following path segment. If an
 * existing leaf is `Object.is`-identical to `nextValue`, the original root is
 * returned without allocating replacement ancestors.
 *
 * @template T
 * @param {T} value
 * @param {string | readonly (string | number)[]} path
 * @param {unknown} nextValue
 * @returns {T}
 * @since 2.0.0
 */
export function setAtPath(value, path, nextValue) {
  const segments = parsePath(path);

  /** @param {any} current @param {number} offset @returns {any} */
  const setSegment = (current, offset) => {
    if (offset === segments.length) return Object.is(current, nextValue) ? current : nextValue;
    const segment = segments[offset];
    const nextSegment = segments[offset + 1];
    const source = isObjectLike(current) ? current : undefined;
    const hasChild = Boolean(source) && Object.hasOwn(/** @type {object} */ (source), segment);
    const child = hasChild
      ? /** @type {Record<PropertyKey, any>} */ (/** @type {unknown} */ (source))[segment]
      : typeof nextSegment === "number" ? [] : {};
    const updatedChild = setSegment(child, offset + 1);
    if (hasChild && Object.is(updatedChild, child)) return current;

    /** @type {any} */
    const clone = Array.isArray(source) ? [...source] : { ...(source ?? {}) };
    clone[segment] = updatedChild;
    return clone;
  };

  return /** @type {T} */ (setSegment(value, 0));
}

/**
 * Traverses own enumerable data properties of plain objects and arrays in
 * deterministic depth-first preorder. Results include paths and parents.
 * Repeated/circular objects appear as entries but are not entered again.
 * Accessors and symbols are skipped; built-in collections, typed arrays, Dates,
 * and class instances are leaf values. Sparse array slots are absent properties.
 *
 * @param {Record<PropertyKey, unknown> | unknown[]} value
 * @param {ObjectTraversalOptions} [options]
 * @returns {ObjectTraversalEntry[]}
 * @throws {TypeError} If the root or options do not match the contract.
 * @throws {RangeError} If traversal would exceed `maxNodes`.
 * @since 2.0.0
 */
export function traverseObject(value, options = {}) {
  /** @type {ObjectTraversalEntry[]} */
  const entries = [];
  visitObject(value, options, (entry) => {
    entries.push(entry);
    return false;
  });
  return entries;
}

/**
 * Returns the first deep traversal entry accepted by a predicate, or
 * `undefined`. Traversal uses the same cycle, property, and limit rules as
 * `traverseObject`, and stops as soon as a match is found.
 *
 * @param {Record<PropertyKey, unknown> | unknown[]} value
 * @param {(entry: ObjectTraversalEntry) => boolean} predicate
 * @param {ObjectTraversalOptions} [options]
 * @returns {ObjectTraversalEntry | undefined}
 * @throws {TypeError} If the root, predicate, or options are invalid.
 * @throws {RangeError} If traversal would exceed `maxNodes` before a match.
 * @since 2.0.0
 */
export function findDeep(value, predicate, options = {}) {
  if (typeof predicate !== "function") throw new TypeError("predicate must be a function.");
  /** @type {ObjectTraversalEntry | undefined} */
  let match;
  visitObject(value, options, (entry) => {
    if (!predicate(entry)) return false;
    match = entry;
    return true;
  });
  return match;
}

/**
 * Returns an object containing selected own properties.
 *
 * @template {object} T
 * @param {T} value
 * @param {readonly (keyof T)[]} keys
 * @returns {Partial<T>}
 * @since 2.0.0
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
 * @since 2.0.0
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
 * @since 2.0.0
 */
export function deepClone(value, options) {
  return structuredClone(value, options);
}

/**
 * Recursively merges own enumerable string-keyed data properties of plain
 * objects without mutating either input. Arrays and non-plain objects are
 * replaced by reference. Unsafe names, enumerable symbols, and enumerable
 * accessors are rejected without invoking getters. The base prototype is kept.
 *
 * @template {Record<PropertyKey, unknown>} T
 * @template {Record<PropertyKey, unknown>} U
 * @param {T} base
 * @param {U} override
 * @returns {T & U}
 * @since 2.0.0
 */
export function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    throw new TypeError("deepMerge expects two plain objects.");
  }

  /** @type {Record<PropertyKey, unknown>} */
  const output = Object.create(Object.getPrototypeOf(base));
  for (const [key, value] of ownEnumerableDataEntries(base, "base")) output[key] = value;
  for (const [key, value] of ownEnumerableDataEntries(override, "override")) {
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
 * @since 2.0.0
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

/**
 * @param {Record<PropertyKey, unknown> | unknown[]} value
 * @param {ObjectTraversalOptions} options
 * @param {(entry: ObjectTraversalEntry) => boolean} visitor
 */
function visitObject(value, { includeRoot = false, maxDepth = 100, maxNodes = 10_000 } = {}, visitor) {
  if (!isTraversable(value)) throw new TypeError("value must be a plain object or array.");
  if (typeof includeRoot !== "boolean") throw new TypeError("includeRoot must be a boolean.");
  if (maxDepth !== Infinity && (!Number.isSafeInteger(maxDepth) || maxDepth < 0)) {
    throw new RangeError("maxDepth must be a non-negative safe integer or Infinity.");
  }
  if (!Number.isSafeInteger(maxNodes) || maxNodes < 1) {
    throw new RangeError("maxNodes must be a positive safe integer.");
  }

  /** @type {Array<{entry: ObjectTraversalEntry, depth: number}>} */
  const stack = [{ entry: { value, key: undefined, path: [], parent: undefined }, depth: 0 }];
  const entered = new WeakSet();
  let visitedNodes = 0;

  while (stack.length > 0) {
    const frame = /** @type {{entry: ObjectTraversalEntry, depth: number}} */ (stack.pop());
    const { entry, depth } = frame;
    const isRoot = depth === 0;

    if (!isRoot || includeRoot) {
      visitedNodes += 1;
      if (visitedNodes > maxNodes) throw new RangeError("Traversal exceeded maxNodes.");
      if (visitor(entry)) return;
    }

    if (depth >= maxDepth || !isTraversable(entry.value) || entered.has(entry.value)) continue;
    entered.add(entry.value);

    const keys = Object.keys(entry.value);
    for (let index = keys.length - 1; index >= 0; index -= 1) {
      const property = keys[index];
      const descriptor = Object.getOwnPropertyDescriptor(entry.value, property);
      if (!descriptor || !("value" in descriptor)) continue;
      const key = arrayIndexKey(entry.value, property);
      stack.push({
        entry: {
          value: descriptor.value,
          key,
          path: [...entry.path, key],
          parent: entry.value,
        },
        depth: depth + 1,
      });
    }
  }
}

/** @param {unknown} value @returns {value is Record<PropertyKey, unknown> | unknown[]} */
function isTraversable(value) {
  return Array.isArray(value) || isPlainObject(value);
}

/** @param {Record<PropertyKey, unknown> | unknown[]} value @param {string} key */
function arrayIndexKey(value, key) {
  return Array.isArray(value) && /^(0|[1-9]\d*)$/.test(key) && Number(key) < 4_294_967_295
    ? Number(key)
    : key;
}

/**
 * @param {Record<PropertyKey, unknown>} value
 * @param {string} name
 * @returns {Array<[string, unknown]>}
 */
function ownEnumerableDataEntries(value, name) {
  /** @type {Array<[string, unknown]>} */
  const entries = [];
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable) continue;
    if (typeof key === "symbol") throw new TypeError(`${name} cannot contain enumerable symbol properties.`);
    if (blockedPathSegments.has(key)) throw new TypeError(`Unsafe property: ${key}`);
    if (!("value" in descriptor)) throw new TypeError(`${name} cannot contain enumerable accessors.`);
    entries.push([key, descriptor.value]);
  }
  return entries;
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
