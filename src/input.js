import { analyzeArrayTypes, DATA_TYPES, normalizeDataType } from "./data.js";
import { plainObjectOptionsErrorMessage } from "./internal/error-messages.js";
import { controlTypes, inputTypes } from "./internal/type-vocabulary.js";
import { cloneJson, isPlainObject } from "./object.js";
import { typeOf } from "./validation.js";

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
export const INPUT_TYPES = inputTypes;

/**
 * Frozen enum-style identifiers returned by renderer-level control
 * classification. They distinguish native inputs from composite data controls.
 *
 * @type {ControlTypeMap}
 * @example
 * controlTypeForValue([{ id: 1 }]) === CONTROL_TYPES.OBJECT_ARRAY; // true
 * @since 2.0.0
 */
export const CONTROL_TYPES = controlTypes;

/** @typedef {(typeof INPUT_TYPES)[keyof typeof INPUT_TYPES]} InputType */
/** @typedef {(typeof CONTROL_TYPES)[keyof typeof CONTROL_TYPES]} ControlType */

/**
 * @typedef {object} InputTypeOptions
 * @property {typeof INPUT_TYPES.DATE | typeof INPUT_TYPES.DATETIME_LOCAL} [dateType="datetime-local"] Native input type used for Date data.
 * @property {Readonly<Record<string, string | undefined>>} [overrides] Descriptor/type-specific mappings.
 * @property {typeof INPUT_TYPES.TEXT | typeof DATA_TYPES.UNDEFINED | "throw"} [unsupported="undefined"] Unsupported-type policy.
 */

/**
 * @typedef {InputTypeOptions & {
 *   label?: string,
 *   path?: readonly (string | number)[],
 *   defaultValue?: unknown
 * }} InputFieldOptions
 */

/**
 * @typedef {InputTypeOptions & {
 *   path?: readonly (string | number)[],
 *   labelFor?: (name: string, value: unknown, index: number) => string,
 *   maximumFields?: number
 * }} FieldsFromDataOptions
 */

/**
 * @typedef {object} InputValueParserOptions
 * @property {"preserve" | typeof DATA_TYPES.NULL | typeof DATA_TYPES.UNDEFINED | "throw"} [empty] Empty-string policy. Text preserves by default; other types throw by default.
 * @property {boolean} [trim=false] Whether syntactic scalar parsers ignore outer whitespace. String output is never trimmed.
 * @property {number} [maximumLength=1000000] Greatest serialized string length and strict JSON byte budget.
 * @property {number} [maximumItems=100000] Greatest direct item count for parsed containers and binary arrays.
 * @property {typeof DATA_TYPES.DATE | "timestamp" | typeof DATA_TYPES.STRING} [dateOutput="date"] Representation returned for Date data.
 * @property {"reject" | "utc" | "local"} [dateAssumption="reject"] Zone policy for a date-time string without an offset.
 * @property {"reject" | "earlier" | "later"} [dateDisambiguation="reject"] Selection policy when a host-local date-time occurs twice during an offset transition.
 * @property {string} [regexpFlags=""] Flags used when constructing a RegExp from text.
 * @property {string | URL} [baseUrl] Explicit base for relative URL input.
 */

const blockedKeys = new Set(["__proto__", "constructor", "prototype"]);
/** @type {Set<string>} */
const directInputTypes = new Set(Object.values(INPUT_TYPES));

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
export function inputTypeForType(descriptor, options = {}) {
  assertInputTypeOptions(options);
  const descriptorName = descriptorKey(descriptor);
  const dataType = normalizeDataType(descriptor);
  const override = findOverride(options.overrides, descriptorName, dataType);
  if (override.found) return override.value;

  if (typeof descriptor === "string" && directInputTypes.has(descriptorName)) return descriptorName;
  if (dataType === DATA_TYPES.STRING || dataType === DATA_TYPES.REGEXP || descriptorName === "objectid")
    return INPUT_TYPES.TEXT;
  if (dataType === DATA_TYPES.NUMBER || dataType === DATA_TYPES.NAN || dataType === DATA_TYPES.BIGINT)
    return INPUT_TYPES.NUMBER;
  if (dataType === DATA_TYPES.BOOLEAN) return INPUT_TYPES.CHECKBOX;
  if (dataType === DATA_TYPES.DATE) return options.dateType ?? INPUT_TYPES.DATETIME_LOCAL;
  if (dataType === DATA_TYPES.BLOB || dataType === DATA_TYPES.FILE) return INPUT_TYPES.FILE;
  if (dataType === DATA_TYPES.URL) return INPUT_TYPES.URL;
  if (descriptorName === "phone" || descriptorName === "telephone") return INPUT_TYPES.TEL;
  if (directInputTypes.has(descriptorName)) return descriptorName;

  const unsupported = options.unsupported ?? DATA_TYPES.UNDEFINED;
  if (unsupported === INPUT_TYPES.TEXT) return INPUT_TYPES.TEXT;
  if (unsupported === DATA_TYPES.UNDEFINED) return undefined;
  throw new TypeError(`No native input type is supported for data type: ${dataType}`);
}

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
export function inputTypeForValue(value, options = {}) {
  const dataType = typeOf(value);
  return inputTypeForType(dataType === DATA_TYPES.DATE ? Date : dataType, options);
}

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
export function controlTypeForType(descriptor, options = {}) {
  assertInputTypeOptions(options);
  const dataType = normalizeDataType(descriptor);
  if (dataType === DATA_TYPES.ARRAY) return CONTROL_TYPES.ARRAY;
  if (dataType === DATA_TYPES.OBJECT) return CONTROL_TYPES.OBJECT;
  if (dataType === DATA_TYPES.MAP || dataType === DATA_TYPES.WEAK_MAP) return CONTROL_TYPES.MAP;
  if (dataType === DATA_TYPES.SET || dataType === DATA_TYPES.WEAK_SET) return CONTROL_TYPES.SET;
  return inputTypeForType(descriptor, options) === undefined ? CONTROL_TYPES.UNSUPPORTED : CONTROL_TYPES.INPUT;
}

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
export function controlTypeForValue(value, options = {}) {
  assertInputTypeOptions(options);
  if (Array.isArray(value)) {
    const analysis = analyzeArrayTypes(value);
    if (analysis.empty) return CONTROL_TYPES.ARRAY;
    if (analysis.types.length > 1) return CONTROL_TYPES.MIXED_ARRAY;
    if (analysis.primaryType === DATA_TYPES.OBJECT) return CONTROL_TYPES.OBJECT_ARRAY;
    if (analysis.primaryType === DATA_TYPES.ARRAY) return CONTROL_TYPES.NESTED_ARRAY;
    return CONTROL_TYPES.SCALAR_ARRAY;
  }

  return controlTypeForType(typeOf(value), options);
}

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
export function fieldDescriptorFor(name, value, options = {}) {
  if (typeof name !== "string" || name.trim() === "") throw new TypeError("name must be a nonblank string.");
  if (blockedKeys.has(name)) throw new TypeError(`Unsafe field name: ${name}`);
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
  assertInputTypeOptions(options);
  if (options.label !== undefined && typeof options.label !== "string") throw new TypeError("label must be a string.");
  const path = options.path === undefined ? [name] : copyPath(options.path);

  return Object.freeze({
    name,
    label: options.label ?? name,
    path: Object.freeze(path),
    dataType: typeOf(value),
    inputType: inputTypeForValue(value, options),
    controlType: controlTypeForValue(value, options),
    defaultValue: Object.hasOwn(options, "defaultValue") ? options.defaultValue : value,
    arrayAnalysis: Array.isArray(value) ? analyzeArrayTypes(value) : undefined,
  });
}

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
export function fieldsFromData(value, options = {}) {
  if (!Array.isArray(value) && !isPlainObject(value)) throw new TypeError("value must be a plain object or array.");
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
  assertInputTypeOptions(options);
  if (options.labelFor !== undefined && typeof options.labelFor !== "function") {
    throw new TypeError("labelFor must be a function.");
  }
  const maximumFields = options.maximumFields ?? 1_000;
  if (!Number.isSafeInteger(maximumFields) || maximumFields < 0) {
    throw new RangeError("maximumFields must be a non-negative safe integer.");
  }
  const basePath = options.path === undefined ? [] : copyPath(options.path);
  const entries = directDataEntries(value);
  if (entries.length > maximumFields) throw new RangeError("fieldsFromData exceeded maximumFields.");

  const fields = entries.map(([name, pathKey, fieldValue], index) => {
    const label = options.labelFor?.(name, fieldValue, index) ?? name;
    if (typeof label !== "string") throw new TypeError("labelFor must return a string.");
    return fieldDescriptorFor(name, fieldValue, {
      dateType: options.dateType,
      overrides: options.overrides,
      unsupported: options.unsupported,
      label,
      path: [...basePath, pathKey],
    });
  });
  return Object.freeze(fields);
}

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
export function createInputValueParser(descriptor, options = {}) {
  const parserOptions = normalizeInputValueParserOptions(options);
  const key = descriptorKey(descriptor);
  const type = parserDataType(descriptor, key);

  if (typeof descriptor === "function" && type === DATA_TYPES.OBJECT && descriptor !== Object) {
    throw new TypeError("Custom constructors cannot be reconstructed from serialized input.");
  }

  if (isTextDescriptor(key, type)) return (value) => parseStringValue(value, parserOptions);
  if (key === INPUT_TYPES.TIME) return (value) => parseTemporalText(value, INPUT_TYPES.TIME, parserOptions);
  if (key === INPUT_TYPES.MONTH) return (value) => parseTemporalText(value, INPUT_TYPES.MONTH, parserOptions);
  if (key === INPUT_TYPES.WEEK) return (value) => parseTemporalText(value, INPUT_TYPES.WEEK, parserOptions);
  if (key === INPUT_TYPES.RADIO) return (value) => parseStringValue(value, parserOptions);

  switch (type) {
    case DATA_TYPES.BOOLEAN:
      return (value) => parseBooleanValue(value, parserOptions);
    case DATA_TYPES.NUMBER:
      return (value) => parseNumberValue(value, parserOptions, integerDescriptorKeys.has(key));
    case DATA_TYPES.NAN:
      return (value) => parseNanValue(value, parserOptions);
    case DATA_TYPES.BIGINT:
      return (value) => parseBigIntValue(value, parserOptions);
    case DATA_TYPES.NULL:
      return (value) => parseNullValue(value, parserOptions);
    case DATA_TYPES.UNDEFINED:
      return (value) => parseUndefinedValue(value, parserOptions);
    case DATA_TYPES.DATE:
      return (value) => parseDateValue(value, parserOptions);
    case DATA_TYPES.ARRAY:
      return (value) => parseJsonContainer(value, DATA_TYPES.ARRAY, parserOptions);
    case DATA_TYPES.OBJECT:
      return (value) => parseJsonContainer(value, DATA_TYPES.OBJECT, parserOptions);
    case DATA_TYPES.DATA:
      return (value) => parseJsonContainer(value, DATA_TYPES.DATA, parserOptions);
    case DATA_TYPES.MAP:
      return (value) => parseMapValue(value, parserOptions);
    case DATA_TYPES.SET:
      return (value) => parseSetValue(value, parserOptions);
    case DATA_TYPES.REGEXP:
      return (value) => parseRegExpValue(value, parserOptions);
    case DATA_TYPES.URL:
      return (value) => parseUrlValue(value, parserOptions);
    case DATA_TYPES.URL_SEARCH_PARAMS:
      return (value) => parseUrlSearchParamsValue(value, parserOptions);
    case DATA_TYPES.ARRAY_BUFFER:
    case DATA_TYPES.DATA_VIEW:
    case DATA_TYPES.SHARED_ARRAY_BUFFER:
      return (value) => parseBufferValue(value, type, parserOptions);
    case DATA_TYPES.BIGINT64_ARRAY:
    case DATA_TYPES.BIGUINT64_ARRAY:
    case DATA_TYPES.FLOAT32_ARRAY:
    case DATA_TYPES.FLOAT64_ARRAY:
    case DATA_TYPES.INT8_ARRAY:
    case DATA_TYPES.INT16_ARRAY:
    case DATA_TYPES.INT32_ARRAY:
    case DATA_TYPES.UINT8_ARRAY:
    case DATA_TYPES.UINT8_CLAMPED_ARRAY:
    case DATA_TYPES.UINT16_ARRAY:
    case DATA_TYPES.UINT32_ARRAY:
      return (value) => parseTypedArrayValue(value, type, parserOptions);
    case DATA_TYPES.ERROR:
      return (value) => parseErrorValue(value, parserOptions);
    case DATA_TYPES.BLOB:
    case DATA_TYPES.FILE:
    case DATA_TYPES.FORM_DATA:
    case DATA_TYPES.FUNCTION:
    case DATA_TYPES.PROMISE:
    case DATA_TYPES.SYMBOL:
    case DATA_TYPES.WEAK_MAP:
    case DATA_TYPES.WEAK_SET:
      return (value) => passThroughBrandedValue(value, type);
    default:
      throw new TypeError(`No serialized input parser is supported for data type: ${type}`);
  }
}

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
export function parseInputValue(value, descriptor, options = {}) {
  return createInputValueParser(descriptor, options)(value);
}

const integerDescriptorKeys = new Set(["int", "int32", "integer", "long"]);
const textDescriptorKeys = new Set([
  INPUT_TYPES.BUTTON,
  INPUT_TYPES.COLOR,
  INPUT_TYPES.EMAIL,
  INPUT_TYPES.HIDDEN,
  INPUT_TYPES.IMAGE,
  "objectid",
  INPUT_TYPES.PASSWORD,
  "phone",
  INPUT_TYPES.RESET,
  INPUT_TYPES.SEARCH,
  INPUT_TYPES.SUBMIT,
  INPUT_TYPES.TEL,
  "telephone",
  INPUT_TYPES.TEXT,
]);
const finiteNumberPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
const integerPattern = /^[+-]?\d+$/;
/** @type {Map<string, string>} */
const typedArrayConstructors = new Map([
  [DATA_TYPES.BIGINT64_ARRAY, "BigInt64Array"],
  [DATA_TYPES.BIGUINT64_ARRAY, "BigUint64Array"],
  [DATA_TYPES.FLOAT32_ARRAY, "Float32Array"],
  [DATA_TYPES.FLOAT64_ARRAY, "Float64Array"],
  [DATA_TYPES.INT8_ARRAY, "Int8Array"],
  [DATA_TYPES.INT16_ARRAY, "Int16Array"],
  [DATA_TYPES.INT32_ARRAY, "Int32Array"],
  [DATA_TYPES.UINT8_ARRAY, "Uint8Array"],
  [DATA_TYPES.UINT8_CLAMPED_ARRAY, "Uint8ClampedArray"],
  [DATA_TYPES.UINT16_ARRAY, "Uint16Array"],
  [DATA_TYPES.UINT32_ARRAY, "Uint32Array"],
]);

/** @param {InputValueParserOptions} options */
function normalizeInputValueParserOptions(options) {
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
  const empty = options.empty;
  if (
    empty !== undefined &&
    empty !== "preserve" &&
    empty !== DATA_TYPES.NULL &&
    empty !== DATA_TYPES.UNDEFINED &&
    empty !== "throw"
  ) {
    throw new TypeError('empty must be "preserve", "null", "undefined", or "throw".');
  }
  if (options.trim !== undefined && typeof options.trim !== "boolean") throw new TypeError("trim must be a boolean.");
  const maximumLength = options.maximumLength ?? 1_000_000;
  const maximumItems = options.maximumItems ?? 100_000;
  if (!Number.isSafeInteger(maximumLength) || maximumLength < 0) {
    throw new RangeError("maximumLength must be a non-negative safe integer.");
  }
  if (!Number.isSafeInteger(maximumItems) || maximumItems < 0) {
    throw new RangeError("maximumItems must be a non-negative safe integer.");
  }
  const dateOutput = options.dateOutput ?? DATA_TYPES.DATE;
  if (dateOutput !== DATA_TYPES.DATE && dateOutput !== "timestamp" && dateOutput !== DATA_TYPES.STRING) {
    throw new TypeError('dateOutput must be "date", "timestamp", or "string".');
  }
  const dateAssumption = options.dateAssumption ?? "reject";
  if (dateAssumption !== "reject" && dateAssumption !== "utc" && dateAssumption !== "local") {
    throw new TypeError('dateAssumption must be "reject", "utc", or "local".');
  }
  const dateDisambiguation = options.dateDisambiguation ?? "reject";
  if (dateDisambiguation !== "reject" && dateDisambiguation !== "earlier" && dateDisambiguation !== "later") {
    throw new TypeError('dateDisambiguation must be "reject", "earlier", or "later".');
  }
  const regexpFlags = options.regexpFlags ?? "";
  if (typeof regexpFlags !== "string") throw new TypeError("regexpFlags must be a string.");
  try {
    new RegExp("", regexpFlags);
  } catch (error) {
    throw new TypeError("regexpFlags must contain valid non-duplicated RegExp flags.", { cause: error });
  }
  let baseUrl;
  if (options.baseUrl !== undefined) {
    try {
      baseUrl = new URL(options.baseUrl).href;
    } catch (error) {
      throw new TypeError("baseUrl must be an absolute URL string or URL.", { cause: error });
    }
  }
  return {
    empty,
    trim: options.trim ?? false,
    maximumLength,
    maximumItems,
    dateOutput,
    dateAssumption,
    dateDisambiguation,
    regexpFlags,
    baseUrl,
  };
}

/** @param {string | Function} descriptor @param {string} key */
function parserDataType(descriptor, key) {
  if (key === INPUT_TYPES.CHECKBOX) return DATA_TYPES.BOOLEAN;
  if (key === INPUT_TYPES.RANGE) return DATA_TYPES.NUMBER;
  if (key === INPUT_TYPES.FILE) return DATA_TYPES.FILE;
  return normalizeDataType(descriptor);
}

/** @param {string} key @param {string} type */
function isTextDescriptor(key, type) {
  return type === DATA_TYPES.STRING || textDescriptorKeys.has(key);
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseStringValue(value, options) {
  if (typeof value !== "string") throw new TypeError("value must be a string.");
  const source = boundedSource(value, options);
  if (source !== "" || options.empty === undefined) return source;
  return resolveEmpty(source, options).value;
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseBooleanValue(value, options) {
  if (typeof value === "boolean") return value;
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  if (empty.handled) return empty.value;
  if (source === "true") return true;
  if (source === "false") return false;
  throw new TypeError('Boolean input must be true, false, "true", or "false".');
}

/**
 * @param {unknown} value
 * @param {ReturnType<typeof normalizeInputValueParserOptions>} options
 * @param {boolean} integerOnly
 */
function parseNumberValue(value, options, integerOnly) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Number input must be finite.");
    if (integerOnly && !Number.isSafeInteger(value)) throw new TypeError("Integer input must be a safe integer.");
    return value;
  }
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  if (empty.handled) return empty.value;
  if (!finiteNumberPattern.test(source)) throw new TypeError("Number input must be a complete finite numeric literal.");
  const parsed = Number(source);
  if (!Number.isFinite(parsed)) throw new RangeError("Number input is outside the finite range.");
  if (integerOnly && !Number.isSafeInteger(parsed)) throw new TypeError("Integer input must be a safe integer.");
  return parsed;
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseNanValue(value, options) {
  if (typeof value === "number" && Number.isNaN(value)) return value;
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  if (empty.handled) return empty.value;
  if (source === "NaN") return Number.NaN;
  throw new TypeError('NaN input must be NaN or "NaN".');
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseBigIntValue(value, options) {
  if (typeof value === "bigint") return value;
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  if (empty.handled) return empty.value;
  if (!integerPattern.test(source)) throw new TypeError("BigInt input must be a complete integer literal.");
  return BigInt(source);
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseNullValue(value, options) {
  if (value === null) return null;
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  if (empty.handled) return empty.value;
  if (source === DATA_TYPES.NULL) return null;
  throw new TypeError('Null input must be null or "null".');
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseUndefinedValue(value, options) {
  if (value === undefined) return undefined;
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  if (empty.handled) return empty.value;
  if (source === DATA_TYPES.UNDEFINED) return undefined;
  throw new TypeError('Undefined input must be undefined or "undefined".');
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseDateValue(value, options) {
  if (typeOf(value) === DATA_TYPES.DATE) {
    const timestamp = /** @type {Date} */ (value).getTime();
    if (!Number.isFinite(timestamp)) throw new TypeError("Date input must be valid.");
    return formatParsedDate(new Date(timestamp), options.dateOutput);
  }
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  if (empty.handled) return empty.value;
  const validationAssumption = options.dateOutput === DATA_TYPES.STRING ? "utc" : options.dateAssumption;
  const date = dateFromInputText(source, validationAssumption, options.dateDisambiguation);
  return options.dateOutput === DATA_TYPES.STRING ? source : formatParsedDate(date, options.dateOutput);
}

/** @param {Date} date @param {"date" | "timestamp" | "string"} output */
function formatParsedDate(date, output) {
  if (output === "timestamp") return date.getTime();
  if (output === DATA_TYPES.STRING) return date.toISOString();
  return date;
}

/**
 * @param {string} source
 * @param {"reject" | "utc" | "local"} assumption
 * @param {"reject" | "earlier" | "later"} disambiguation
 */
function dateFromInputText(source, assumption, disambiguation) {
  const dateOnly = source.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) return dateFromParts(dateOnly.slice(1).map(Number), "utc");

  const local = source.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/);
  if (local) {
    if (assumption === "reject") {
      throw new TypeError('A date-time without an offset requires dateAssumption "utc" or "local".');
    }
    const parts = local.slice(1, 7).map((part) => Number(part ?? 0));
    parts.push(Number((local[7] ?? "").padEnd(3, "0")));
    return dateFromParts(parts, assumption, disambiguation);
  }

  const zoned = source.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-](\d{2}):(\d{2}))$/,
  );
  if (!zoned) {
    throw new TypeError("Date input must be ISO date or date-time text.");
  }
  const parts = zoned.slice(1, 7).map((part) => Number(part ?? 0));
  parts.push(Number((zoned[7] ?? "").padEnd(3, "0")));
  try {
    dateFromParts(parts, "utc");
  } catch (error) {
    throw new TypeError("Date input is not a valid ISO calendar value.", { cause: error });
  }
  if (zoned[8] !== "Z" && (Number(zoned[9]) > 23 || Number(zoned[10]) > 59)) {
    throw new TypeError("Date input is not a valid ISO offset value.");
  }
  const date = new Date(source);
  if (!Number.isFinite(date.getTime())) throw new TypeError("Date input must be valid ISO text.");
  return date;
}

/**
 * @param {number[]} parts
 * @param {"utc" | "local"} assumption
 * @param {"reject" | "earlier" | "later"} [disambiguation="reject"]
 */
function dateFromParts(parts, assumption, disambiguation = "reject") {
  const [year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0] = parts;
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
    throw new TypeError("Date input contains an invalid calendar or clock component.");
  }
  const date = new Date(0);
  if (assumption === "utc") {
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(hour, minute, second, millisecond);
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day ||
      date.getUTCHours() !== hour ||
      date.getUTCMinutes() !== minute ||
      date.getUTCSeconds() !== second
    ) {
      throw new TypeError("Date input is not a valid UTC calendar value.");
    }
  } else {
    date.setFullYear(year, month - 1, day);
    date.setHours(hour, minute, second, millisecond);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day ||
      date.getHours() !== hour ||
      date.getMinutes() !== minute ||
      date.getSeconds() !== second
    ) {
      throw new TypeError("Date input is not a valid local calendar value.");
    }
    const candidates = localDateCandidates(date, parts);
    if (candidates.length > 1) {
      if (disambiguation === "reject") {
        throw new TypeError('Host-local date-time input is ambiguous; use dateDisambiguation "earlier" or "later".');
      }
      const selected = disambiguation === "earlier" ? candidates[0] : candidates[candidates.length - 1];
      return new Date(/** @type {number} */ (selected));
    }
  }
  return date;
}

/** @param {Date} date @param {number[]} parts */
function localDateCandidates(date, parts) {
  const timestamp = date.getTime();
  const currentOffset = date.getTimezoneOffset();
  const offsets = new Set([currentOffset]);
  for (const hours of [-48, -36, -24, -12, 12, 24, 36, 48]) {
    offsets.add(new Date(timestamp + hours * 3_600_000).getTimezoneOffset());
  }
  const candidates = new Set([timestamp]);
  for (const offset of offsets) {
    const alternative = timestamp + (offset - currentOffset) * 60_000;
    if (alternative !== timestamp && hasLocalDateParts(new Date(alternative), parts)) candidates.add(alternative);
  }
  return [...candidates].sort((left, right) => left - right);
}

/** @param {Date} date @param {number[]} parts */
function hasLocalDateParts(date, parts) {
  const [year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0] = parts;
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute &&
    date.getSeconds() === second &&
    date.getMilliseconds() === millisecond
  );
}

/**
 * @param {unknown} value
 * @param {"time" | "month" | "week"} kind
 * @param {ReturnType<typeof normalizeInputValueParserOptions>} options
 */
function parseTemporalText(value, kind, options) {
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  if (empty.handled) return empty.value;
  if (kind === INPUT_TYPES.TIME && !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?$/.test(source)) {
    throw new TypeError("Time input must use a valid HH:mm[:ss[.sss]] value.");
  }
  if (kind === INPUT_TYPES.MONTH && !/^\d{4}-(?:0[1-9]|1[0-2])$/.test(source)) {
    throw new TypeError("Month input must use a valid YYYY-MM value.");
  }
  const week = source.match(/^(\d{4})-W(\d{2})$/);
  if (
    kind === INPUT_TYPES.WEEK &&
    (!week || Number(week[2]) < 1 || Number(week[2]) > isoWeeksInYear(Number(week[1])))
  ) {
    throw new TypeError("Week input must use a valid ISO YYYY-Www value.");
  }
  return source;
}

/** @param {number} year */
function isoWeeksInYear(year) {
  const december28 = new Date(0);
  december28.setUTCFullYear(year, 11, 28);
  const yearStart = new Date(0);
  yearStart.setUTCFullYear(year, 0, 1);
  const day = (december28.getUTCDay() + 6) % 7;
  return Math.floor((Math.floor((december28.getTime() - yearStart.getTime()) / 86_400_000) + 10 - day) / 7);
}

/**
 * @param {unknown} value
 * @param {"array" | "object" | "data"} expected
 * @param {ReturnType<typeof normalizeInputValueParserOptions>} options
 */
function parseJsonContainer(value, expected, options) {
  let parsed = value;
  if (typeof value === "string") {
    const source = boundedSource(value, options);
    const empty = resolveEmpty(options.trim ? source.trim() : source, options);
    if (empty.handled) return empty.value;
    try {
      parsed = JSON.parse(source);
    } catch (error) {
      throw new TypeError("Input must contain valid JSON.", { cause: error });
    }
  }
  if (expected === DATA_TYPES.ARRAY && !Array.isArray(parsed)) throw new TypeError("Input JSON must contain an array.");
  if (expected === DATA_TYPES.OBJECT && !isPlainObject(parsed))
    throw new TypeError("Input JSON must contain a plain object.");
  return cloneJson(parsed, {
    maximumArrayLength: options.maximumItems,
    maximumBytes: options.maximumLength,
    maximumStringLength: options.maximumLength,
  });
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseMapValue(value, options) {
  if (typeOf(value) === DATA_TYPES.MAP) return value;
  const entries = parseJsonContainer(value, DATA_TYPES.ARRAY, options);
  for (const entry of /** @type {unknown[]} */ (entries)) {
    if (!Array.isArray(entry) || entry.length !== 2)
      throw new TypeError("Map input must contain two-item entry arrays.");
  }
  return new Map(/** @type {[unknown, unknown][]} */ (entries));
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseSetValue(value, options) {
  if (typeOf(value) === DATA_TYPES.SET) return value;
  return new Set(/** @type {unknown[]} */ (parseJsonContainer(value, DATA_TYPES.ARRAY, options)));
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseRegExpValue(value, options) {
  if (typeOf(value) === DATA_TYPES.REGEXP) {
    const expression = /** @type {RegExp} */ (value);
    return new RegExp(expression.source, expression.flags);
  }
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  if (empty.handled) return empty.value;
  try {
    return new RegExp(source, options.regexpFlags);
  } catch (error) {
    throw new TypeError("RegExp input must contain a valid expression.", { cause: error });
  }
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseUrlValue(value, options) {
  if (typeOf(value) === DATA_TYPES.URL) return value;
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  if (empty.handled) return empty.value;
  try {
    return options.baseUrl === undefined ? new URL(source) : new URL(source, options.baseUrl);
  } catch (error) {
    throw new TypeError("URL input is invalid for the configured base.", { cause: error });
  }
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseUrlSearchParamsValue(value, options) {
  if (typeOf(value) === DATA_TYPES.URL_SEARCH_PARAMS) return value;
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  return empty.handled ? empty.value : new URLSearchParams(source);
}

/**
 * @param {unknown} value
 * @param {"arraybuffer" | "dataview" | "sharedarraybuffer"} type
 * @param {ReturnType<typeof normalizeInputValueParserOptions>} options
 */
function parseBufferValue(value, type, options) {
  if (typeOf(value) === type) return value;
  const bytes = /** @type {unknown[]} */ (parseJsonContainer(value, DATA_TYPES.ARRAY, options));
  const normalized = bytes.map((byte) => {
    if (!Number.isInteger(byte) || /** @type {number} */ (byte) < 0 || /** @type {number} */ (byte) > 255) {
      throw new TypeError("Binary input items must be integers from 0 through 255.");
    }
    return /** @type {number} */ (byte);
  });
  if (type === DATA_TYPES.SHARED_ARRAY_BUFFER) {
    const Constructor = globalThis.SharedArrayBuffer;
    if (typeof Constructor !== "function") throw new TypeError("SharedArrayBuffer is unavailable in this runtime.");
    const buffer = new Constructor(normalized.length);
    new Uint8Array(buffer).set(normalized);
    return buffer;
  }
  const buffer = Uint8Array.from(normalized).buffer;
  return type === DATA_TYPES.DATA_VIEW ? new DataView(buffer) : buffer;
}

/**
 * @param {unknown} value
 * @param {string} type
 * @param {ReturnType<typeof normalizeInputValueParserOptions>} options
 */
function parseTypedArrayValue(value, type, options) {
  if (typeOf(value) === type) return value;
  const items = /** @type {unknown[]} */ (parseJsonContainer(value, DATA_TYPES.ARRAY, options));
  const constructorName = typedArrayConstructors.get(type);
  const Constructor =
    constructorName && /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (globalThis))[constructorName];
  if (typeof Constructor !== "function")
    throw new TypeError(`${constructorName ?? type} is unavailable in this runtime.`);
  const normalized = items.map((item) => normalizeTypedArrayItem(item, type));
  return Reflect.construct(Constructor, [normalized]);
}

/** @param {unknown} value @param {string} type */
function normalizeTypedArrayItem(value, type) {
  if (type === DATA_TYPES.BIGINT64_ARRAY || type === DATA_TYPES.BIGUINT64_ARRAY) {
    if (typeof value === "string" && integerPattern.test(value)) value = BigInt(value);
    if (typeof value !== "bigint") throw new TypeError("BigInt typed-array items must be bigint or integer strings.");
    const minimum = type === DATA_TYPES.BIGINT64_ARRAY ? -(2n ** 63n) : 0n;
    const maximum = type === DATA_TYPES.BIGINT64_ARRAY ? 2n ** 63n - 1n : 2n ** 64n - 1n;
    if (value < minimum || value > maximum) throw new RangeError(`${type} item is outside its representable range.`);
    return value;
  }
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new TypeError("Typed-array items must be finite numbers.");
  if (type === DATA_TYPES.FLOAT32_ARRAY) {
    if (!Number.isFinite(Math.fround(value))) throw new RangeError(`${type} item is outside its representable range.`);
    return value;
  }
  if (type === DATA_TYPES.FLOAT64_ARRAY) return value;
  if (!Number.isInteger(value)) throw new TypeError("Integer typed-array items must be integers.");
  const [minimum, maximum] = typedArrayRange(type);
  if (value < minimum || value > maximum) throw new RangeError(`${type} item is outside its representable range.`);
  return value;
}

/** @param {string} type @returns {[number, number]} */
function typedArrayRange(type) {
  if (type === DATA_TYPES.INT8_ARRAY) return [-128, 127];
  if (type === DATA_TYPES.UINT8_ARRAY || type === DATA_TYPES.UINT8_CLAMPED_ARRAY) return [0, 255];
  if (type === DATA_TYPES.INT16_ARRAY) return [-32_768, 32_767];
  if (type === DATA_TYPES.UINT16_ARRAY) return [0, 65_535];
  if (type === DATA_TYPES.INT32_ARRAY) return [-2_147_483_648, 2_147_483_647];
  return [0, 4_294_967_295];
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseErrorValue(value, options) {
  if (typeOf(value) === DATA_TYPES.ERROR) return value;
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  return empty.handled ? empty.value : new Error(source);
}

/** @param {unknown} value @param {string} type */
function passThroughBrandedValue(value, type) {
  const matches =
    type === DATA_TYPES.FUNCTION
      ? typeof value === "function"
      : type === DATA_TYPES.SYMBOL
        ? typeof value === "symbol"
        : typeOf(value) === type;
  if (!matches)
    throw new TypeError(`${type} input must already be a ${type} value; serialized reconstruction is unsupported.`);
  return value;
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function scalarSource(value, options) {
  if (typeof value !== "string") throw new TypeError("Serialized scalar input must be a string.");
  const source = boundedSource(value, options);
  return options.trim ? source.trim() : source;
}

/** @param {string} source @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function boundedSource(source, options) {
  if (source.length > options.maximumLength) throw new RangeError("Input exceeded maximumLength.");
  return source;
}

/** @param {string} source @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function resolveEmpty(source, options) {
  if (source !== "") return { handled: false, value: undefined };
  const policy = options.empty ?? "throw";
  if (policy === "preserve") return { handled: true, value: "" };
  if (policy === DATA_TYPES.NULL) return { handled: true, value: null };
  if (policy === DATA_TYPES.UNDEFINED) return { handled: true, value: undefined };
  throw new TypeError("Empty input is not valid for this datatype.");
}

/** @param {InputTypeOptions} options */
function assertInputTypeOptions(options) {
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
  if (
    options.dateType !== undefined &&
    options.dateType !== INPUT_TYPES.DATE &&
    options.dateType !== INPUT_TYPES.DATETIME_LOCAL
  ) {
    throw new TypeError('dateType must be "date" or "datetime-local".');
  }
  if (
    options.unsupported !== undefined &&
    options.unsupported !== INPUT_TYPES.TEXT &&
    options.unsupported !== DATA_TYPES.UNDEFINED &&
    options.unsupported !== "throw"
  ) {
    throw new TypeError('unsupported must be "text", "undefined", or "throw".');
  }
  if (options.overrides === undefined) return;
  if (!isPlainObject(options.overrides)) throw new TypeError("overrides must be a plain object.");
  for (const key of Reflect.ownKeys(options.overrides)) {
    const descriptor = Object.getOwnPropertyDescriptor(options.overrides, key);
    if (!descriptor?.enumerable) continue;
    if (typeof key === "symbol") throw new TypeError("overrides cannot contain enumerable symbols.");
    if (!Object.hasOwn(descriptor, "value")) throw new TypeError("overrides cannot contain enumerable accessors.");
    if (descriptor.value !== undefined && (typeof descriptor.value !== "string" || descriptor.value.trim() === "")) {
      throw new TypeError("override values must be nonblank strings or undefined.");
    }
  }
}

/** @param {string | Function} descriptor */
function descriptorKey(descriptor) {
  if (typeof descriptor === "function") return normalizeDataType(descriptor);
  if (typeof descriptor !== "string" || descriptor.trim() === "") return normalizeDataType(descriptor);
  return descriptor.trim().replace(/[\s_]/g, "").toLowerCase();
}

/**
 * @param {InputTypeOptions["overrides"]} overrides
 * @param {string} descriptorName
 * @param {string} dataType
 */
function findOverride(overrides, descriptorName, dataType) {
  if (overrides === undefined) return { found: false, value: undefined };
  if (Object.hasOwn(overrides, descriptorName)) return { found: true, value: overrides[descriptorName] };
  if (Object.hasOwn(overrides, dataType)) return { found: true, value: overrides[dataType] };
  return { found: false, value: undefined };
}

/** @param {readonly (string | number)[]} path */
function copyPath(path) {
  if (!Array.isArray(path)) throw new TypeError("path must be an array.");
  return path.map((segment) => {
    if (typeof segment === "number") {
      if (!Number.isSafeInteger(segment) || segment < 0)
        throw new TypeError("numeric path segments must be non-negative integers.");
      return segment;
    }
    if (typeof segment !== "string" || segment === "" || blockedKeys.has(segment)) {
      throw new TypeError("string path segments must be nonblank and safe.");
    }
    return segment;
  });
}

/**
 * @param {Record<PropertyKey, unknown> | readonly unknown[]} value
 * @returns {Array<[string, string | number, unknown]>}
 */
function directDataEntries(value) {
  if (Array.isArray(value)) {
    assertArrayDataProperties(value);
    return Array.from(
      { length: value.length },
      (_, index) => /** @type {[string, number, unknown]} */ ([String(index), index, value[index]]),
    );
  }

  /** @type {Array<[string, string, unknown]>} */
  const entries = [];
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable) continue;
    if (typeof key === "symbol") throw new TypeError("objects cannot contain enumerable symbol properties.");
    if (blockedKeys.has(key)) throw new TypeError(`Unsafe field name: ${key}`);
    if (!Object.hasOwn(descriptor, "value")) throw new TypeError("objects cannot contain enumerable accessors.");
    entries.push([key, key, descriptor.value]);
  }
  return entries;
}

/** @param {readonly unknown[]} value */
function assertArrayDataProperties(value) {
  for (const key of Reflect.ownKeys(value)) {
    if (key === "length") continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable) continue;
    if (typeof key === "symbol" || !/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length) {
      throw new TypeError("arrays cannot contain custom enumerable properties.");
    }
    if (!Object.hasOwn(descriptor, "value")) throw new TypeError("arrays cannot contain enumerable accessors.");
  }
}
