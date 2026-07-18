import { analyzeArrayTypes } from "./data.js";
export type InputTypeOptions = {
    /**
     * Native input type used for Date data.
     */
    dateType?: "date" | "datetime-local";
    /**
     * Descriptor/type-specific mappings.
     */
    overrides?: Readonly<Record<string, string | undefined>>;
    /**
     * Unsupported-type policy.
     */
    unsupported?: "text" | "undefined" | "throw";
};
export type InputFieldOptions = InputTypeOptions & {
    label?: string;
    path?: readonly (string | number)[];
    defaultValue?: unknown;
};
export type FieldsFromDataOptions = InputTypeOptions & {
    path?: readonly (string | number)[];
    labelFor?: (name: string, value: unknown, index: number) => string;
    maximumFields?: number;
};
/**
 * Returns the native HTML input type suited to one scalar data type. Composite
 * containers return `undefined` by default because they require a higher-level
 * control; use `controlTypeForType` to classify those. Overrides are checked by
 * normalized descriptor spelling and then by canonical data type.
 *
 * @param {string | Function} descriptor Data type label or constructor.
 * @param {InputTypeOptions} [options] Date, override, and unsupported-type policies.
 * @returns {string | undefined} Native input type or undefined for unsupported/composite data.
 * @throws {TypeError} If descriptor or options do not match the contract.
 * @example
 * inputTypeForType(Date); // "datetime-local"
 * @since 2.0.0
 */
export declare function inputTypeForType(descriptor: string | Function, options?: InputTypeOptions): string | undefined;
/**
 * Returns the native HTML input type suited to a runtime scalar value. Strings
 * remain text even when their content resembles a number or boolean; this
 * function never guesses semantic types from string contents.
 *
 * @param {unknown} value Runtime value to classify.
 * @param {InputTypeOptions} [options] Date, override, and unsupported-type policies.
 * @returns {string | undefined} Native input type or undefined for unsupported/composite data.
 * @throws {TypeError} If options do not match the contract.
 * @example
 * inputTypeForValue(false); // "checkbox"
 * @since 2.0.0
 */
export declare function inputTypeForValue(value: unknown, options?: InputTypeOptions): string | undefined;
/**
 * Classifies a declared type into a renderer-level control without pretending
 * composite data can be accepted by a native input. The result is `input`,
 * `array`, `object`, `map`, `set`, or `unsupported`.
 *
 * @param {string | Function} descriptor Data type label or constructor.
 * @param {InputTypeOptions} [options] Scalar input mapping policies.
 * @returns {"input" | "array" | "object" | "map" | "set" | "unsupported"} Generic control category.
 * @throws {TypeError} If descriptor or options do not match the contract.
 * @example
 * controlTypeForType(Array); // "array"
 * @since 2.0.0
 */
export declare function controlTypeForType(descriptor: string | Function, options?: InputTypeOptions): "input" | "array" | "object" | "map" | "set" | "unsupported";
/**
 * Classifies a runtime value into a renderer-level control. Arrays are analyzed
 * in full and distinguished as empty, scalar, object, nested, or mixed rather
 * than inferred from item zero.
 *
 * @param {unknown} value Runtime value to classify.
 * @param {InputTypeOptions} [options] Scalar input mapping policies.
 * @returns {"input" | "array" | "scalar-array" | "object-array" | "nested-array" | "mixed-array" | "object" | "map" | "set" | "unsupported"} Generic control category.
 * @throws {TypeError} If options do not match the contract.
 * @example
 * controlTypeForValue([{ id: 1 }]); // "object-array"
 * @since 2.0.0
 */
export declare function controlTypeForValue(value: unknown, options?: InputTypeOptions): "input" | "array" | "scalar-array" | "object-array" | "nested-array" | "mixed-array" | "object" | "map" | "set" | "unsupported";
/**
 * Describes one generic data-backed input field without importing a UI
 * framework or schema language. The existing value becomes `defaultValue`
 * unless the option is explicitly present, so false, zero, and empty strings
 * are preserved. The value itself is retained by reference, not cloned.
 *
 * @param {string} name Stable field name.
 * @param {unknown} value Current field value used for type/control inference.
 * @param {InputFieldOptions} [options] Label, path, explicit default, and input mapping policies.
 * @returns {Readonly<{name: string, label: string, path: readonly (string | number)[], dataType: string, inputType: string | undefined, controlType: ReturnType<typeof controlTypeForValue>, defaultValue: unknown, arrayAnalysis: ReturnType<typeof analyzeArrayTypes> | undefined}>} Frozen framework-neutral field descriptor.
 * @throws {TypeError} If name, options, label, or path is invalid.
 * @example
 * fieldDescriptorFor("active", false).inputType; // "checkbox"
 * @since 2.0.0
 */
export declare function fieldDescriptorFor(name: string, value: unknown, options?: InputFieldOptions): Readonly<{
    name: string;
    label: string;
    path: readonly (string | number)[];
    dataType: string;
    inputType: string | undefined;
    controlType: ReturnType<typeof controlTypeForValue>;
    defaultValue: unknown;
    arrayAnalysis: ReturnType<typeof analyzeArrayTypes> | undefined;
}>;
/**
 * Creates descriptors for the direct fields of a plain object or array. Object
 * accessors, enumerable symbols, prototype-mutating names, and custom array
 * properties are rejected without invoking getters. Sparse array slots become
 * indexed fields with `undefined` values, matching Akashatools sequence policy.
 *
 * @param {Record<PropertyKey, unknown> | readonly unknown[]} value Plain data whose direct children become fields.
 * @param {FieldsFromDataOptions} [options] Base path, label callback, work bound, and input mapping policies.
 * @returns {readonly ReturnType<typeof fieldDescriptorFor>[]} Frozen ordered field descriptors.
 * @throws {TypeError} If value, options, labels, or property semantics are invalid.
 * @throws {RangeError} If the field count exceeds maximumFields.
 * @example
 * fieldsFromData({ name: "Ada", active: true }).map(({ inputType }) => inputType);
 * @since 2.0.0
 */
export declare function fieldsFromData(value: Record<PropertyKey, unknown> | readonly unknown[], options?: FieldsFromDataOptions): readonly ReturnType<typeof fieldDescriptorFor>[];
