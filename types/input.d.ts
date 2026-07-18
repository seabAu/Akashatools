import { analyzeArrayTypes, DATA_TYPES } from "./data.js";
import { controlTypes, inputTypes } from "./internal/type-vocabulary.js";
export type InputTypeMap = typeof inputTypes;
export type ControlTypeMap = typeof controlTypes;
/** @typedef {typeof inputTypes} InputTypeMap */
/** @typedef {typeof controlTypes} ControlTypeMap */
/**
 * Frozen enum-style identifiers for native HTML input types recognized by
 * Akashatools. The values can be passed anywhere the equivalent string is
 * accepted and remain suitable for serialized field descriptors.
 *
 * @type {InputTypeMap}
 * @example
 * inputTypeForType(Boolean) === INPUT_TYPES.CHECKBOX; // true
 * @since 2.0.0
 */
export declare const INPUT_TYPES: InputTypeMap;
/**
 * Frozen enum-style identifiers returned by renderer-level control
 * classification. They distinguish native inputs from composite data controls.
 *
 * @type {ControlTypeMap}
 * @example
 * controlTypeForValue([{ id: 1 }]) === CONTROL_TYPES.OBJECT_ARRAY; // true
 * @since 2.0.0
 */
export declare const CONTROL_TYPES: ControlTypeMap;
export type InputType = (typeof INPUT_TYPES)[keyof typeof INPUT_TYPES];
export type ControlType = (typeof CONTROL_TYPES)[keyof typeof CONTROL_TYPES];
export type InputTypeOptions = {
    /**
     * Native input type used for Date data.
     */
    dateType?: typeof INPUT_TYPES.DATE | typeof INPUT_TYPES.DATETIME_LOCAL;
    /**
     * Descriptor/type-specific mappings.
     */
    overrides?: Readonly<Record<string, string | undefined>>;
    /**
     * Unsupported-type policy.
     */
    unsupported?: typeof INPUT_TYPES.TEXT | typeof DATA_TYPES.UNDEFINED | "throw";
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
export type InputValueParserOptions = {
    /**
     * Empty-string policy. Text preserves by default; other types throw by default.
     */
    empty?: "preserve" | typeof DATA_TYPES.NULL | typeof DATA_TYPES.UNDEFINED | "throw";
    /**
     * Whether syntactic scalar parsers ignore outer whitespace. String output is never trimmed.
     */
    trim?: boolean;
    /**
     * Greatest serialized string length and strict JSON byte budget.
     */
    maximumLength?: number;
    /**
     * Greatest direct item count for parsed containers and binary arrays.
     */
    maximumItems?: number;
    /**
     * Representation returned for Date data.
     */
    dateOutput?: typeof DATA_TYPES.DATE | "timestamp" | typeof DATA_TYPES.STRING;
    /**
     * Zone policy for a date-time string without an offset.
     */
    dateAssumption?: "reject" | "utc" | "local";
    /**
     * Selection policy when a host-local date-time occurs twice during an offset transition.
     */
    dateDisambiguation?: "reject" | "earlier" | "later";
    /**
     * Flags used when constructing a RegExp from text.
     */
    regexpFlags?: string;
    /**
     * Explicit base for relative URL input.
     */
    baseUrl?: string | URL;
};
/**
 * Returns the native HTML input type suited to one scalar data type. Composite
 * containers return `undefined` by default because they require a higher-level
 * control; use `controlTypeForType` to classify those. Overrides are checked by
 * normalized descriptor spelling and then by canonical data type.
 *
 * @param {string | Function} descriptor Data type label or constructor.
 * @param {InputTypeOptions} [options] Date, override, and unsupported-type policies.
 * @returns {InputType | string | undefined} Native input type or configured override, or undefined for unsupported/composite data.
 * @throws {TypeError} If descriptor or options do not match the contract.
 * @example
 * inputTypeForType(Date); // "datetime-local"
 * @since 2.0.0
 */
export declare function inputTypeForType(descriptor: string | Function, options?: InputTypeOptions): InputType | string | undefined;
/**
 * Returns the native HTML input type suited to a runtime scalar value. Strings
 * remain text even when their content resembles a number or boolean; this
 * function never guesses semantic types from string contents.
 *
 * @param {unknown} value Runtime value to classify.
 * @param {InputTypeOptions} [options] Date, override, and unsupported-type policies.
 * @returns {InputType | string | undefined} Native input type or configured override, or undefined for unsupported/composite data.
 * @throws {TypeError} If options do not match the contract.
 * @example
 * inputTypeForValue(false); // "checkbox"
 * @since 2.0.0
 */
export declare function inputTypeForValue(value: unknown, options?: InputTypeOptions): InputType | string | undefined;
/**
 * Classifies a declared type into a renderer-level control without pretending
 * composite data can be accepted by a native input. The result is `input`,
 * `array`, `object`, `map`, `set`, or `unsupported`.
 *
 * @param {string | Function} descriptor Data type label or constructor.
 * @param {InputTypeOptions} [options] Scalar input mapping policies.
 * @returns {ControlType} Generic control category.
 * @throws {TypeError} If descriptor or options do not match the contract.
 * @example
 * controlTypeForType(Array); // "array"
 * @since 2.0.0
 */
export declare function controlTypeForType(descriptor: string | Function, options?: InputTypeOptions): ControlType;
/**
 * Classifies a runtime value into a renderer-level control. Arrays are analyzed
 * in full and distinguished as empty, scalar, object, nested, or mixed rather
 * than inferred from item zero.
 *
 * @param {unknown} value Runtime value to classify.
 * @param {InputTypeOptions} [options] Scalar input mapping policies.
 * @returns {ControlType} Generic control category.
 * @throws {TypeError} If options do not match the contract.
 * @example
 * controlTypeForValue([{ id: 1 }]); // "object-array"
 * @since 2.0.0
 */
export declare function controlTypeForValue(value: unknown, options?: InputTypeOptions): ControlType;
/**
 * Describes one generic data-backed input field without importing a UI
 * framework or schema language. The existing value becomes `defaultValue`
 * unless the option is explicitly present, so false, zero, and empty strings
 * are preserved. The value itself is retained by reference, not cloned.
 *
 * @param {string} name Stable field name.
 * @param {unknown} value Current field value used for type/control inference.
 * @param {InputFieldOptions} [options] Label, path, explicit default, and input mapping policies.
 * @returns {Readonly<{name: string, label: string, path: readonly (string | number)[], dataType: string, inputType: InputType | string | undefined, controlType: ReturnType<typeof controlTypeForValue>, defaultValue: unknown, arrayAnalysis: ReturnType<typeof analyzeArrayTypes> | undefined}>} Frozen framework-neutral field descriptor.
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
    inputType: InputType | string | undefined;
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
/**
 * Compiles a strict serialized-input converter for repeated form handlers. The
 * descriptor and all option policy are normalized once; returned calls perform
 * only value validation/conversion. Decimal numbers stay decimal, empty strings
 * never become zero accidentally, JSON containers are bounded, and local date
 * times require an explicit zone assumption. Host-local offset gaps are invalid,
 * and repeated times require an explicit earlier/later disambiguation.
 *
 * Correct runtime values that have no lossless serialized representation (such
 * as File, Blob, FormData, Promise, WeakMap, WeakSet, Function, and Symbol) pass
 * through unchanged. Attempting to reconstruct those types from unrelated text
 * throws instead of inventing a value.
 *
 * @param {string | Function} descriptor Declared JavaScript datatype, schema label, or native input type.
 * @param {InputValueParserOptions} [options] Empty, whitespace, work-bound, date, RegExp, and URL policies.
 * @returns {(value: unknown) => unknown} Reusable parser with precomputed policy.
 * @throws {TypeError | RangeError} If descriptor/options are invalid or conversion is unsupported.
 * @example
 * const parseAmount = createInputValueParser(Number);
 * parseAmount("12.50"); // 12.5
 * @since 2.0.0
 */
export declare function createInputValueParser(descriptor: string | Function, options?: InputValueParserOptions): (value: unknown) => unknown;
/**
 * Converts one serialized input value through the same strict contract as a
 * compiled parser. Use `createInputValueParser` when the same descriptor is
 * applied repeatedly so descriptor and option policy are not recomputed for
 * every event.
 *
 * @param {unknown} value Serialized or already-branded input value.
 * @param {string | Function} descriptor Declared JavaScript datatype, schema label, or native input type.
 * @param {InputValueParserOptions} [options] Empty, whitespace, work-bound, date, RegExp, and URL policies.
 * @returns {unknown} Parsed value appropriate to descriptor.
 * @throws {TypeError | RangeError} If descriptor, options, or value violate the conversion contract.
 * @example
 * parseInputValue("12.50", Number); // 12.5
 * @since 2.0.0
 */
export declare function parseInputValue(value: unknown, descriptor: string | Function, options?: InputValueParserOptions): unknown;
