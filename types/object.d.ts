export type ObjectTraversalEntry = {
    value: unknown;
    key: string | number | undefined;
    path: (string | number)[];
    parent: Record<PropertyKey, unknown> | unknown[] | undefined;
};
export type ObjectTraversalOptions = {
    includeRoot?: boolean;
    maxDepth?: number;
    maxNodes?: number;
};
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
export declare function isPlainObject(value: unknown): value is Record<PropertyKey, unknown>;
/**
 * Parses a safe dot/bracket property path. Prototype-mutating segments are
 * rejected to prevent prototype-pollution vulnerabilities.
 *
 * @param {string | readonly (string | number)[]} path
 * @returns {(string | number)[]}
 * @since 2.0.0
 */
export declare function parsePath(path: string | readonly (string | number)[]): (string | number)[];
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
export declare function getAtPath<T>(value: unknown, path: string | readonly (string | number)[], fallback?: T): unknown | T;
/**
 * Checks whether every segment of a nested own-property path exists.
 *
 * @param {unknown} value
 * @param {string | readonly (string | number)[]} path
 * @returns {boolean}
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
 * @param {T} value
 * @param {string | readonly (string | number)[]} path
 * @param {unknown} nextValue
 * @returns {T}
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
 * @param {Record<PropertyKey, unknown> | unknown[]} value
 * @param {ObjectTraversalOptions} [options]
 * @returns {ObjectTraversalEntry[]}
 * @throws {TypeError} If the root or options do not match the contract.
 * @throws {RangeError} If traversal would exceed `maxNodes`.
 * @since 2.0.0
 */
export declare function traverseObject(value: Record<PropertyKey, unknown> | unknown[], options?: ObjectTraversalOptions): ObjectTraversalEntry[];
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
export declare function findDeep(value: Record<PropertyKey, unknown> | unknown[], predicate: (entry: ObjectTraversalEntry) => boolean, options?: ObjectTraversalOptions): ObjectTraversalEntry | undefined;
/**
 * Returns an object containing selected own properties.
 *
 * @template {object} T
 * @param {T} value
 * @param {readonly (keyof T)[]} keys
 * @returns {Partial<T>}
 * @since 2.0.0
 */
export declare function pick<T extends object>(value: T, keys: readonly (keyof T)[]): Partial<T>;
/**
 * Returns a shallow copy without the selected own properties.
 *
 * @template {object} T
 * @param {T} value
 * @param {readonly (keyof T)[]} keys
 * @returns {Partial<T>}
 * @since 2.0.0
 */
export declare function omit<T extends object>(value: T, keys: readonly (keyof T)[]): Partial<T>;
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
export declare function deepClone<T>(value: T, options?: StructuredSerializeOptions): T;
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
export declare function deepMerge<T extends Record<PropertyKey, unknown>, U extends Record<PropertyKey, unknown>>(base: T, override: U): T & U;
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
export declare function pickAllowed(value: unknown, allowedKeys: readonly string[], { rejectUnknown }?: {
    rejectUnknown?: boolean;
}): Record<string, unknown>;
