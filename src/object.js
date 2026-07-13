const blockedPathSegments = new Set(["__proto__", "prototype", "constructor"]);
const maximumPathLength = 10_000;
const maximumPathSegments = 100;
const maximumMergeDepth = 100;
const maximumMergeNodes = 10_000;

/**
 * @typedef {object} ObjectTraversalEntry
 * @property {unknown} value Value found at this traversal position.
 * @property {string | number | undefined} key Own-property key, or undefined for the root.
 * @property {(string | number)[]} path Fresh path from the root.
 * @property {Record<PropertyKey, unknown> | unknown[] | undefined} parent Immediate containing object/array.
 */

/**
 * @typedef {object} ObjectTraversalOptions
 * @property {boolean} [includeRoot=false] Whether to emit the root entry.
 * @property {number} [maxDepth=100] Maximum entered depth, or Infinity.
 * @property {number} [maxNodes=10000] Maximum emitted entries before failure.
 */

/**
 * Checks whether a value is an object with Object.prototype or a null prototype.
 *
 * @param {unknown} value Candidate from any JavaScript realm.
 * @returns {value is Record<PropertyKey, unknown>} Whether value has the intrinsic Object constructor or null prototype.
 * @example
 * isPlainObject(Object.create(null)); // true
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
 * @param {string | readonly (string | number)[]} path Dot/bracket text or explicit safe segments.
 * @returns {(string | number)[]} Fresh normalized string/number segment array.
 * @throws {TypeError} If syntax or a segment is invalid or prototype-mutating.
 * @throws {RangeError} If the path exceeds the length or segment limits.
 * @example
 * parsePath("profile.names[0]"); // ["profile", "names", 0]
 * @since 2.0.0
 */
export function parsePath(path) {
  if (Array.isArray(path)) {
    if (path.length > maximumPathSegments) throw new RangeError(`path cannot contain more than ${maximumPathSegments} segments.`);
    return path.map(normalizePathSegment);
  }
  if (typeof path !== "string" || path.trim() === "") {
    throw new TypeError("path must be a non-empty string or segment array.");
  }
  if (path.length > maximumPathLength) throw new RangeError(`path cannot exceed ${maximumPathLength} code units.`);

  const normalized = path.trim().replace(/\[(\d+)\]/g, ".$1");
  if (/[\[\]]/.test(normalized)) throw new TypeError(`Invalid property path: ${path}`);
  const segments = normalized.split(".");
  if (segments.length > maximumPathSegments) throw new RangeError(`path cannot contain more than ${maximumPathSegments} segments.`);
  return segments.map(normalizePathSegment);
}

/**
 * Reads an own property at a nested path, returning a fallback only when the
 * path is absent. An existing `undefined` value is returned as-is.
 *
 * @template T
 * @param {unknown} value Root value read through own properties only.
 * @param {string | readonly (string | number)[]} path Safe nested property path.
 * @param {T} [fallback] Value returned only when the path is absent.
 * @returns {unknown | T} Existing leaf value (including undefined) or fallback.
 * @throws {TypeError | RangeError} If the path contract is invalid.
 * @example
 * getAtPath({ user: { id: 1 } }, "user.id"); // 1
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
 * @param {unknown} value Root value inspected through own properties only.
 * @param {string | readonly (string | number)[]} path Safe nested property path.
 * @returns {boolean} Whether every path segment exists, even if the leaf is undefined.
 * @throws {TypeError | RangeError} If the path contract is invalid.
 * @example
 * hasAtPath({ value: undefined }, "value"); // true
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
 * @param {T} value Root value left unmodified.
 * @param {string | readonly (string | number)[]} path Safe nested property path to write.
 * @param {unknown} nextValue Replacement leaf value.
 * @returns {T} Structurally shared root, or the original root for an identical leaf.
 * @throws {TypeError | RangeError} If the path contract is invalid.
 * @example
 * setAtPath(profile, "name.first", "Akasha");
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
 * @param {Record<PropertyKey, unknown> | unknown[]} value Plain-object or array root.
 * @param {ObjectTraversalOptions} [options] Root inclusion and traversal work bounds.
 * @returns {ObjectTraversalEntry[]} Deterministic preorder entries with fresh paths.
 * @throws {TypeError} If the root or options do not match the contract.
 * @throws {RangeError} If traversal would exceed `maxNodes`.
 * @example
 * traverseObject({ user: { id: 1 } }).map(({ path }) => path);
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
 * @param {Record<PropertyKey, unknown> | unknown[]} value Plain-object or array root.
 * @param {(entry: ObjectTraversalEntry) => boolean} predicate Fail-fast match predicate.
 * @param {ObjectTraversalOptions} [options] Root inclusion and traversal work bounds.
 * @returns {ObjectTraversalEntry | undefined} First accepted entry or undefined.
 * @throws {TypeError} If the root, predicate, or options are invalid.
 * @throws {RangeError} If traversal would exceed `maxNodes` before a match.
 * @example
 * findDeep(data, ({ key }) => key === "id");
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
 * @param {T} value Object read through own properties.
 * @param {readonly (keyof T)[]} keys Keys copied in requested order when present.
 * @returns {Partial<T>} New ordinary object containing selected own values.
 * @throws {TypeError} If value is not object-like or keys is not an array.
 * @example
 * pick({ id: 1, secret: true }, ["id"]); // { id: 1 }
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
 * @param {T} value Object whose enumerable string properties are copied.
 * @param {readonly (keyof T)[]} keys Keys excluded from the shallow copy.
 * @returns {Partial<T>} New ordinary object without selected enumerable string keys.
 * @throws {TypeError} If value is not object-like or keys is not an array.
 * @example
 * omit({ id: 1, secret: true }, ["secret"]); // { id: 1 }
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
 * @param {T} value Structured-cloneable value to copy.
 * @param {StructuredSerializeOptions} [options] Native transfer options; transferred inputs may be detached.
 * @returns {T} Independent structured clone preserving supported built-in types/cycles.
 * @throws {DOMException} If value or transfer options cannot be structured-cloned.
 * @example
 * const clone = deepClone({ date: new Date(), map: new Map() });
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
 * @param {T} base Plain-object defaults left unmodified; its prototype is retained.
 * @param {U} override Plain-object replacements left unmodified.
 * @returns {T & U} New recursively merged plain object.
 * @throws {TypeError} If inputs are not plain data objects or contain unsafe property semantics/cycles.
 * @throws {RangeError} If merge depth or object-pair work exceeds the fixed limits.
 * @example
 * deepMerge({ nested: { one: 1 } }, { nested: { two: 2 } });
 * @since 2.0.0
 */
export function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    throw new TypeError("deepMerge expects two plain objects.");
  }

  return /** @type {T & U} */ (mergePlainObjects(base, override, {
    nodes: 0,
    activePairs: new WeakMap(),
  }, 0));
}

/**
 * @param {Record<PropertyKey, unknown>} base
 * @param {Record<PropertyKey, unknown>} override
 * @param {{nodes: number, activePairs: WeakMap<object, WeakSet<object>>}} state
 * @param {number} depth
 */
function mergePlainObjects(base, override, state, depth) {
  if (depth > maximumMergeDepth) throw new RangeError(`deepMerge cannot exceed ${maximumMergeDepth} nested merge levels.`);
  state.nodes += 1;
  if (state.nodes > maximumMergeNodes) throw new RangeError(`deepMerge cannot merge more than ${maximumMergeNodes} object pairs.`);

  let pairedOverrides = state.activePairs.get(base);
  if (!pairedOverrides) {
    pairedOverrides = new WeakSet();
    state.activePairs.set(base, pairedOverrides);
  }
  if (pairedOverrides.has(override)) throw new TypeError("deepMerge cannot merge mutually circular object branches.");
  pairedOverrides.add(override);

  try {
    /** @type {Record<PropertyKey, unknown>} */
    const output = Object.create(Object.getPrototypeOf(base));
    for (const [key, value] of ownEnumerableDataEntries(base, "base")) output[key] = value;
    for (const [key, value] of ownEnumerableDataEntries(override, "override")) {
      output[key] = isPlainObject(value) && isPlainObject(output[key])
        ? mergePlainObjects(output[key], value, state, depth + 1)
        : value;
    }
    return output;
  } finally {
    pairedOverrides.delete(override);
  }
}

/**
 * Returns a new object containing only allowed own properties. Unknown or
 * prototype-mutating properties can be rejected or skipped.
 *
 * @param {unknown} value Plain object inspected through enumerable string keys.
 * @param {readonly string[]} allowedKeys Literal string keys allowed in output.
 * @param {{rejectUnknown?: boolean}} [options] Whether unknown/unsafe keys throw instead of being skipped.
 * @returns {Record<string, unknown>} New ordinary object containing allowed own properties.
 * @throws {TypeError} If value, allowedKeys, rejectUnknown, or an encountered key is invalid.
 * @example
 * pickAllowed(payload, ["name", "email"]);
 * @since 2.0.0
 */
export function pickAllowed(value, allowedKeys, { rejectUnknown = true } = {}) {
  if (!isPlainObject(value)) throw new TypeError("value must be a plain object.");
  if (!Array.isArray(allowedKeys) || allowedKeys.some((key) => typeof key !== "string")) {
    throw new TypeError("allowedKeys must be an array of strings.");
  }
  if (typeof rejectUnknown !== "boolean") throw new TypeError("rejectUnknown must be a boolean.");

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
