export type DefaultValueOptions = {
    /**
     * Date initialization policy.
     */
    date?: "epoch" | "now";
    /**
     * Descriptor- or canonical-type-specific factories checked before built-in defaults.
     */
    factories?: ReadonlyMap<string | Function, () => unknown> | Readonly<Record<string, () => unknown>>;
    /**
     * Unsupported-type policy.
     */
    unsupported?: "throw" | "undefined";
};
export type InitializeLikeOptions = {
    /**
     * Date initialization policy.
     */
    date?: "epoch" | "now";
    /**
     * Descriptor- or canonical-type-specific factories checked before built-in defaults.
     */
    factories?: ReadonlyMap<string | Function, () => unknown> | Readonly<Record<string, () => unknown>>;
    /**
     * Unsupported-type policy.
     */
    unsupported?: "throw" | "undefined";
    /**
     * Array initialization policy.
     */
    arrays?: "empty" | "items" | "sample";
    /**
     * Plain-object initialization policy.
     */
    objects?: "empty" | "shape";
    /**
     * Maximum recursive edge depth.
     */
    maxDepth?: number;
    /**
     * Maximum values initialized.
     */
    maxNodes?: number;
};
/**
 * Normalizes a built-in constructor or common schema-style type name to the
 * lowercase runtime vocabulary used by `typeOf`. Array descriptors such as
 * `[String]`, `String[]`, and `array<object>` normalize to `array`; custom
 * constructors normalize to `object` without being invoked.
 *
 * @param {string | Function} descriptor Type label or constructor to normalize.
 * @returns {string} Canonical lowercase data type.
 * @throws {TypeError} If descriptor is neither a nonblank string nor a function.
 * @example
 * normalizeDataType("DateTimeLocal"); // "date"
 * @since 2.0.0
 */
export declare function normalizeDataType(descriptor: string | Function): string;
/**
 * Scans every slot in an array and reports its complete runtime type profile.
 * Sparse slots are intentionally counted as `undefined`, making the result
 * reflect indexed reads rather than only present properties.
 *
 * @param {readonly unknown[]} values Array whose complete type distribution is inspected.
 * @returns {{length: number, empty: boolean, homogeneous: boolean, primaryType: string | undefined, types: readonly string[], counts: Readonly<Record<string, number>>}} Frozen type analysis in first-seen order.
 * @throws {TypeError} If values is not an array.
 * @example
 * analyzeArrayTypes([1, "2", 3]).types; // ["number", "string"]
 * @since 2.0.0
 */
export declare function analyzeArrayTypes(values: readonly unknown[]): {
    length: number;
    empty: boolean;
    homogeneous: boolean;
    primaryType: string | undefined;
    types: readonly string[];
    counts: Readonly<Record<string, number>>;
};
/**
 * Creates a fresh initialized value for a type descriptor without invoking
 * custom constructors. Built-in collection, buffer, URL, Blob, File, and typed
 * array defaults are supported when the current runtime exposes them.
 *
 * @param {string | Function} descriptor Type label or constructor to initialize.
 * @param {DefaultValueOptions} [options] Date, override-factory, and unsupported-type policies.
 * @returns {unknown} Fresh initialized value for the normalized type.
 * @throws {TypeError} If descriptor/options are invalid or no default is supported.
 * @example
 * defaultValueForType(Boolean); // false
 * @since 2.0.0
 */
export declare function defaultValueForType(descriptor: string | Function, options?: DefaultValueOptions): unknown;
/**
 * Creates a fresh initialized value based on a runtime value's intrinsic type.
 * This is the value-oriented counterpart to `defaultValueForType`; it does not
 * preserve the input's content or invoke custom constructors.
 *
 * @param {unknown} value Runtime value whose type selects a default.
 * @param {DefaultValueOptions} [options] Date, override-factory, and unsupported-type policies.
 * @returns {unknown} Fresh initialized value for the runtime type.
 * @throws {TypeError} If options are invalid or no default is supported.
 * @example
 * defaultValueFor({ populated: true }); // {}
 * @since 2.0.0
 */
export declare function defaultValueFor(value: unknown, options?: DefaultValueOptions): unknown;
/**
 * Builds an initialized skeleton from plain data without mutating it. Objects
 * can retain their key shape or collapse to empty containers; arrays can be
 * emptied, initialize every item, or retain one representative item. Circular
 * plain-data references are recreated. Enumerable accessors, symbols, custom
 * array properties, and prototype-mutating keys are rejected without executing
 * getters.
 *
 * @param {unknown} value Value whose containers and leaves are initialized.
 * @param {InitializeLikeOptions} [options] Container policies, work bounds, and leaf-default options.
 * @returns {unknown} Independent initialized skeleton.
 * @throws {TypeError} If options or traversed property semantics are unsafe.
 * @throws {RangeError} If maxDepth or maxNodes is exceeded.
 * @example
 * initializeLike({ name: "Ada", active: true }); // { name: "", active: false }
 * @since 2.0.0
 */
export declare function initializeLike(value: unknown, options?: InitializeLikeOptions): unknown;
