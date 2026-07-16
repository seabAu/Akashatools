export type ObjectTraversalEntry = {
    /**
     * Value found at this traversal position.
     */
    value: unknown;
    /**
     * Own-property key, or undefined for the root.
     */
    key: string | number | undefined;
    /**
     * Fresh path from the root.
     */
    path: (string | number)[];
    /**
     * Immediate containing object/array.
     */
    parent: Record<PropertyKey, unknown> | unknown[] | undefined;
};
export type ObjectTraversalOptions = {
    /**
     * Whether to emit the root entry.
     */
    includeRoot?: boolean;
    /**
     * Maximum entered depth, or Infinity.
     */
    maxDepth?: number;
    /**
     * Maximum emitted entries before failure.
     */
    maxNodes?: number;
};
export type JsonCloneOptions = {
    /**
     * Greatest permitted array length.
     */
    maximumArrayLength?: number;
    /**
     * Greatest exact UTF-8 JSON serialization size.
     */
    maximumBytes?: number;
    /**
     * Greatest permitted nesting depth below the root.
     */
    maximumDepth?: number;
    /**
     * Greatest object-key length in UTF-16 code units.
     */
    maximumKeyLength?: number;
    /**
     * Greatest total enumerable object-key count.
     */
    maximumKeys?: number;
    /**
     * Greatest total primitive/container node count.
     */
    maximumNodes?: number;
    /**
     * Greatest string-value length in UTF-16 code units.
     */
    maximumStringLength?: number;
};
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
 * @typedef {object} JsonCloneOptions
 * @property {number} [maximumArrayLength=10000] Greatest permitted array length.
 * @property {number} [maximumBytes=1000000] Greatest exact UTF-8 JSON serialization size.
 * @property {number} [maximumDepth=100] Greatest permitted nesting depth below the root.
 * @property {number} [maximumKeyLength=10000] Greatest object-key length in UTF-16 code units.
 * @property {number} [maximumKeys=10000] Greatest total enumerable object-key count.
 * @property {number} [maximumNodes=20000] Greatest total primitive/container node count.
 * @property {number} [maximumStringLength=1000000] Greatest string-value length in UTF-16 code units.
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
export declare function isPlainObject(value: unknown): value is Record<PropertyKey, unknown>;
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
export declare function parsePath(path: string | readonly (string | number)[]): (string | number)[];
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
export declare function getAtPath<T>(value: unknown, path: string | readonly (string | number)[], fallback?: T): unknown | T;
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
export declare function hasAtPath(value: unknown, path: string | readonly (string | number)[]): boolean;
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
export declare function setAtPath<T>(value: T, path: string | readonly (string | number)[], nextValue: unknown): T;
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
export declare function traverseObject(value: Record<PropertyKey, unknown> | unknown[], options?: ObjectTraversalOptions): ObjectTraversalEntry[];
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
export declare function findDeep(value: Record<PropertyKey, unknown> | unknown[], predicate: (entry: ObjectTraversalEntry) => boolean, options?: ObjectTraversalOptions): ObjectTraversalEntry | undefined;
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
export declare function pick<T extends object>(value: T, keys: readonly (keyof T)[]): Partial<T>;
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
export declare function omit<T extends object>(value: T, keys: readonly (keyof T)[]): Partial<T>;
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
export declare function deepClone<T>(value: T, options?: StructuredSerializeOptions): T;
/**
 * Clones strict plain JSON data without invoking `toJSON` methods or accessors.
 * The result uses ordinary objects, safely preserves all string keys, and
 * duplicates shared references as JSON serialization would. Cycles, sparse or
 * customized arrays, non-finite numbers, symbols, and non-plain objects are
 * rejected rather than coerced.
 *
 * @template T
 * @param {T} value Plain JSON value to clone.
 * @param {JsonCloneOptions} [options] Structural and exact serialized UTF-8 work limits.
 * @returns {T} Independent plain JSON clone.
 * @throws {TypeError} If value/options contain unsupported JSON shapes or active property semantics.
 * @throws {RangeError} If a configured structural or byte limit is exceeded.
 * @example
 * cloneJson({ profile: { active: true } });
 * @since 2.0.0
 */
export declare function cloneJson<T>(value: T, options?: JsonCloneOptions): T;
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
export declare function deepMerge<T extends Record<PropertyKey, unknown>, U extends Record<PropertyKey, unknown>>(base: T, override: U): T & U;
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
export declare function pickAllowed(value: unknown, allowedKeys: readonly string[], { rejectUnknown }?: {
    rejectUnknown?: boolean;
}): Record<string, unknown>;
