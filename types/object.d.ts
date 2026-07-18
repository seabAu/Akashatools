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
export type DeepSearchOptions = ObjectTraversalOptions & {
    by?: "value" | "key" | "either";
    equals?: (actual: unknown, needle: unknown, entry: ObjectTraversalEntry) => boolean;
};
export type DeepMatchCollectionOptions = DeepSearchOptions & {
    maxMatches?: number;
};
export type DeepQueryView = {
    has: (needle: unknown, options?: DeepSearchOptions) => boolean;
    first: (needle: unknown, options?: DeepSearchOptions) => ObjectTraversalEntry | undefined;
    value: (needle: unknown, options?: DeepSearchOptions) => unknown;
    parent: (needle: unknown, options?: DeepSearchOptions) => ObjectTraversalEntry["parent"];
    all: (needle: unknown, options?: DeepMatchCollectionOptions) => ObjectTraversalEntry[];
    values: (needle: unknown, options?: DeepMatchCollectionOptions) => unknown[];
    parents: (needle: unknown, options?: DeepMatchCollectionOptions) => ObjectTraversalEntry["parent"][];
    where: (predicate: (entry: ObjectTraversalEntry) => boolean, options?: ObjectTraversalOptions) => ObjectTraversalEntry | undefined;
    allWhere: (predicate: (entry: ObjectTraversalEntry) => boolean, options?: ObjectTraversalOptions & {
        maxMatches?: number;
    }) => ObjectTraversalEntry[];
    unwrap: () => Record<PropertyKey, unknown> | unknown[];
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
 * @typedef {ObjectTraversalOptions & {
 *   by?: "value" | "key" | "either",
 *   equals?: (actual: unknown, needle: unknown, entry: ObjectTraversalEntry) => boolean
 * }} DeepSearchOptions
 */
/**
 * @typedef {DeepSearchOptions & {maxMatches?: number}} DeepMatchCollectionOptions
 */
/**
 * @typedef {object} DeepQueryView
 * @property {(needle: unknown, options?: DeepSearchOptions) => boolean} has
 * @property {(needle: unknown, options?: DeepSearchOptions) => ObjectTraversalEntry | undefined} first
 * @property {(needle: unknown, options?: DeepSearchOptions) => unknown} value
 * @property {(needle: unknown, options?: DeepSearchOptions) => ObjectTraversalEntry["parent"]} parent
 * @property {(needle: unknown, options?: DeepMatchCollectionOptions) => ObjectTraversalEntry[]} all
 * @property {(needle: unknown, options?: DeepMatchCollectionOptions) => unknown[]} values
 * @property {(needle: unknown, options?: DeepMatchCollectionOptions) => ObjectTraversalEntry["parent"][]} parents
 * @property {(predicate: (entry: ObjectTraversalEntry) => boolean, options?: ObjectTraversalOptions) => ObjectTraversalEntry | undefined} where
 * @property {(predicate: (entry: ObjectTraversalEntry) => boolean, options?: ObjectTraversalOptions & {maxMatches?: number}) => ObjectTraversalEntry[]} allWhere
 * @property {() => Record<PropertyKey, unknown> | unknown[]} unwrap
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
 * Parses an RFC 6901 JSON Pointer into decoded string reference tokens. The
 * empty pointer addresses the document root. Non-empty pointers must begin
 * with `/`; `~0` decodes to `~` and `~1` decodes to `/`. Prototype-mutating
 * tokens are rejected even though they could be ordinary JSON keys, preserving
 * the package-wide safe-path boundary.
 *
 * @param {string} pointer JSON Pointer text, not a URI-fragment `#` representation.
 * @returns {string[]} Fresh decoded token array; numeric-looking tokens remain strings until evaluated against an array.
 * @throws {TypeError} If pointer syntax or an escape/prototype-mutating token is invalid.
 * @throws {RangeError} If the pointer exceeds 10,000 code units or 100 tokens.
 * @example
 * parseJsonPointer("/profile/a~1b/m~0n"); // ["profile", "a/b", "m~n"]
 * @since 2.0.0
 */
export declare function parseJsonPointer(pointer: string): string[];
/**
 * Reads a value through an RFC 6901 JSON Pointer. Traversal enters only arrays
 * and plain objects, uses own data properties, and never invokes accessors.
 * Array tokens use canonical unsigned decimal spelling (`0` or a nonzero digit
 * followed by digits); sparse/missing elements and `-` are absent. A fallback
 * is returned only for absence, not for an existing `undefined` value.
 *
 * @template T
 * @param {unknown} value JSON-like document root.
 * @param {string} pointer Safe JSON Pointer text; the empty string returns value itself.
 * @param {T} [fallback] Value returned only when a reference token cannot be resolved.
 * @returns {unknown | T} Referenced own data-property value, root, or fallback.
 * @throws {TypeError | RangeError} If pointer syntax is invalid or traversal encounters an accessor.
 * @example
 * getAtJsonPointer({ users: [{ name: "Ember" }] }, "/users/0/name"); // "Ember"
 * @since 2.0.0
 */
export declare function getAtJsonPointer<T>(value: unknown, pointer: string, fallback?: T): unknown | T;
/**
 * Checks whether an RFC 6901 JSON Pointer resolves through own data properties.
 * The empty pointer always resolves to the supplied root, including an
 * `undefined` root. Array, accessor, unsafe-token, and work-bound behavior is
 * identical to `getAtJsonPointer`.
 *
 * @param {unknown} value JSON-like document root.
 * @param {string} pointer Safe JSON Pointer text.
 * @returns {boolean} Whether the complete pointer resolves, even when its value is undefined.
 * @throws {TypeError | RangeError} If pointer syntax is invalid or traversal encounters an accessor.
 * @example
 * hasAtJsonPointer({ value: undefined }, "/value"); // true
 * @since 2.0.0
 */
export declare function hasAtJsonPointer(value: unknown, pointer: string): boolean;
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
 * Returns every deep traversal entry accepted by a predicate. Traversal order,
 * cycle behavior, property safety, and node/depth limits match `findDeep`.
 * `maxMatches` adds a separate output bound and throws instead of truncating.
 *
 * @param {Record<PropertyKey, unknown> | unknown[]} value Plain-object or array root.
 * @param {(entry: ObjectTraversalEntry) => boolean} predicate Match predicate evaluated in preorder.
 * @param {ObjectTraversalOptions & {maxMatches?: number}} [options] Traversal and output work bounds.
 * @returns {ObjectTraversalEntry[]} Every accepted entry in traversal order.
 * @throws {TypeError} If the root, predicate, or options are invalid.
 * @throws {RangeError} If maxNodes, maxDepth, or maxMatches is invalid/exceeded.
 * @example
 * findAllDeep(data, ({ key }) => key === "id");
 * @since 2.0.0
 */
export declare function findAllDeep(value: Record<PropertyKey, unknown> | unknown[], predicate: (entry: ObjectTraversalEntry) => boolean, options?: ObjectTraversalOptions & {
    maxMatches?: number;
}): ObjectTraversalEntry[];
/**
 * Checks whether any deep entry's value, key, or either side matches a needle.
 * Matching uses `Object.is` by default; object needles therefore use identity,
 * not implicit serialization or structural equality.
 *
 * @param {Record<PropertyKey, unknown> | unknown[]} value Plain-object or array root.
 * @param {unknown} needle Value or key sought without coercion.
 * @param {DeepSearchOptions} [options] Match side, equality callback, and traversal bounds.
 * @returns {boolean} Whether a matching entry exists.
 * @throws {TypeError} If the root or options are invalid.
 * @throws {RangeError} If traversal bounds are invalid or exceeded.
 * @example
 * hasDeep({ user: { id: 1 } }, "id", { by: "key" }); // true
 * @since 2.0.0
 */
export declare function hasDeep(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: DeepSearchOptions): boolean;
/**
 * Returns the first deep entry whose value/key matches a needle, retaining its
 * key, path, parent, and value. Use the dedicated projection wrappers when only
 * the value or parent is needed.
 *
 * @param {Record<PropertyKey, unknown> | unknown[]} value Plain-object or array root.
 * @param {unknown} needle Value or key sought without coercion.
 * @param {DeepSearchOptions} [options] Match side, equality callback, and traversal bounds.
 * @returns {ObjectTraversalEntry | undefined} First matching entry or undefined.
 * @throws {TypeError} If the root or options are invalid.
 * @throws {RangeError} If traversal bounds are invalid or exceeded.
 * @example
 * findDeepMatch({ status: "ready" }, "ready")?.path; // ["status"]
 * @since 2.0.0
 */
export declare function findDeepMatch(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: DeepSearchOptions): ObjectTraversalEntry | undefined;
/**
 * Returns the value of the first deep needle match. A matching `undefined`
 * value and no match both project to undefined; use `findDeepMatch` when that
 * distinction matters.
 *
 * @param {Record<PropertyKey, unknown> | unknown[]} value Plain-object or array root.
 * @param {unknown} needle Value or key sought without coercion.
 * @param {DeepSearchOptions} [options] Match side, equality callback, and traversal bounds.
 * @returns {unknown} First matched value, or undefined when absent.
 * @throws {TypeError} If the root or options are invalid.
 * @throws {RangeError} If traversal bounds are invalid or exceeded.
 * @example
 * findDeepValue({ profile: { name: "Ada" } }, "name", { by: "key" }); // "Ada"
 * @since 2.0.0
 */
export declare function findDeepValue(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: DeepSearchOptions): unknown;
/**
 * Returns the immediate container of the first deep needle match. Root matches
 * and absent matches both project to undefined; use `findDeepMatch` when that
 * distinction matters.
 *
 * @param {Record<PropertyKey, unknown> | unknown[]} value Plain-object or array root.
 * @param {unknown} needle Value or key sought without coercion.
 * @param {DeepSearchOptions} [options] Match side, equality callback, and traversal bounds.
 * @returns {ObjectTraversalEntry["parent"]} First matching parent or undefined.
 * @throws {TypeError} If the root or options are invalid.
 * @throws {RangeError} If traversal bounds are invalid or exceeded.
 * @example
 * findDeepParent({ user: { id: 1 } }, 1); // { id: 1 }
 * @since 2.0.0
 */
export declare function findDeepParent(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: DeepSearchOptions): ObjectTraversalEntry["parent"];
/**
 * Returns every entry whose value/key matches a needle, preserving traversal
 * metadata and deterministic preorder.
 *
 * @param {Record<PropertyKey, unknown> | unknown[]} value Plain-object or array root.
 * @param {unknown} needle Value or key sought without coercion.
 * @param {DeepMatchCollectionOptions} [options] Match policy and traversal/output bounds.
 * @returns {ObjectTraversalEntry[]} All matching entries in traversal order.
 * @throws {TypeError} If the root or options are invalid.
 * @throws {RangeError} If traversal/output bounds are invalid or exceeded.
 * @example
 * findAllDeepMatches({ one: 1, nested: { two: 1 } }, 1).length; // 2
 * @since 2.0.0
 */
export declare function findAllDeepMatches(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: DeepMatchCollectionOptions): ObjectTraversalEntry[];
/**
 * Returns the value projection of every deep needle match. Repeated values are
 * retained so indexes stay aligned with `findAllDeepMatches`.
 *
 * @param {Record<PropertyKey, unknown> | unknown[]} value Plain-object or array root.
 * @param {unknown} needle Value or key sought without coercion.
 * @param {DeepMatchCollectionOptions} [options] Match policy and traversal/output bounds.
 * @returns {unknown[]} Matched values in traversal order.
 * @throws {TypeError} If the root or options are invalid.
 * @throws {RangeError} If traversal/output bounds are invalid or exceeded.
 * @example
 * findAllDeepValues({ id: 1, nested: { id: 2 } }, "id", { by: "key" }); // [1, 2]
 * @since 2.0.0
 */
export declare function findAllDeepValues(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: DeepMatchCollectionOptions): unknown[];
/**
 * Returns the parent projection of every deep needle match. Duplicate parents
 * are retained, and an included root match contributes undefined.
 *
 * @param {Record<PropertyKey, unknown> | unknown[]} value Plain-object or array root.
 * @param {unknown} needle Value or key sought without coercion.
 * @param {DeepMatchCollectionOptions} [options] Match policy and traversal/output bounds.
 * @returns {ObjectTraversalEntry["parent"][]} Matching parents in traversal order.
 * @throws {TypeError} If the root or options are invalid.
 * @throws {RangeError} If traversal/output bounds are invalid or exceeded.
 * @example
 * findAllDeepParents({ one: 1, two: 1 }, 1).length; // 2
 * @since 2.0.0
 */
export declare function findAllDeepParents(value: Record<PropertyKey, unknown> | unknown[], needle: unknown, options?: DeepMatchCollectionOptions): ObjectTraversalEntry["parent"][];
/**
 * Creates a frozen, side-effect-free dot-style query view over structured data.
 * Methods delegate to the same atomic traversal/search functions; creating a
 * view never mutates the root or any global/built-in prototype.
 *
 * @param {Record<PropertyKey, unknown> | unknown[]} value Plain-object or array root retained by reference.
 * @param {ObjectTraversalOptions} [options] Base traversal options overridden per method call.
 * @returns {Readonly<DeepQueryView>} Frozen fluent search/projection view.
 * @throws {TypeError} If the root or base options are invalid.
 * @throws {RangeError} If base traversal bounds are invalid.
 * @example
 * deepQuery({ user: { id: 1 } }).has("id", { by: "key" }); // true
 * @since 2.0.0
 */
export declare function deepQuery(value: Record<PropertyKey, unknown> | unknown[], options?: ObjectTraversalOptions): Readonly<DeepQueryView>;
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
