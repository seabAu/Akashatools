import { analyzeArrayTypes, normalizeDataType } from "./data.js";
import { cloneJson, isPlainObject } from "./object.js";
import { typeOf } from "./validation.js";

/**
 * @typedef {object} InputTypeOptions
 * @property {"date" | "datetime-local"} [dateType="datetime-local"] Native input type used for Date data.
 * @property {Readonly<Record<string, string | undefined>>} [overrides] Descriptor/type-specific mappings.
 * @property {"text" | "undefined" | "throw"} [unsupported="undefined"] Unsupported-type policy.
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
 * @property {"preserve" | "null" | "undefined" | "throw"} [empty] Empty-string policy. Text preserves by default; other types throw by default.
 * @property {boolean} [trim=false] Whether syntactic scalar parsers ignore outer whitespace. String output is never trimmed.
 * @property {number} [maximumLength=1000000] Greatest serialized string length and strict JSON byte budget.
 * @property {number} [maximumItems=100000] Greatest direct item count for parsed containers and binary arrays.
 * @property {"date" | "timestamp" | "string"} [dateOutput="date"] Representation returned for Date data.
 * @property {"reject" | "utc" | "local"} [dateAssumption="reject"] Zone policy for a date-time string without an offset.
 * @property {"reject" | "earlier" | "later"} [dateDisambiguation="reject"] Selection policy when a host-local date-time occurs twice during an offset transition.
 * @property {string} [regexpFlags=""] Flags used when constructing a RegExp from text.
 * @property {string | URL} [baseUrl] Explicit base for relative URL input.
 */

const blockedKeys = new Set(["__proto__", "constructor", "prototype"]);
const directInputTypes = new Set([
  "button",
  "checkbox",
  "color",
  "date",
  "datetime-local",
  "email",
  "file",
  "hidden",
  "image",
  "month",
  "number",
  "password",
  "radio",
  "range",
  "reset",
  "search",
  "submit",
  "tel",
  "text",
  "time",
  "url",
  "week",
]);

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
export function inputTypeForType(descriptor, options = {}) {
  assertInputTypeOptions(options);
  const descriptorName = descriptorKey(descriptor);
  const dataType = normalizeDataType(descriptor);
  const override = findOverride(options.overrides, descriptorName, dataType);
  if (override.found) return override.value;

  if (typeof descriptor === "string" && directInputTypes.has(descriptorName)) return descriptorName;
  if (dataType === "string" || dataType === "regexp" || descriptorName === "objectid") return "text";
  if (dataType === "number" || dataType === "nan" || dataType === "bigint") return "number";
  if (dataType === "boolean") return "checkbox";
  if (dataType === "date") return options.dateType ?? "datetime-local";
  if (dataType === "blob" || dataType === "file") return "file";
  if (dataType === "url") return "url";
  if (descriptorName === "phone" || descriptorName === "telephone") return "tel";
  if (directInputTypes.has(descriptorName)) return descriptorName;

  const unsupported = options.unsupported ?? "undefined";
  if (unsupported === "text") return "text";
  if (unsupported === "undefined") return undefined;
  throw new TypeError(`No native input type is supported for data type: ${dataType}`);
}

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
export function inputTypeForValue(value, options = {}) {
  const dataType = typeOf(value);
  return inputTypeForType(dataType === "date" ? Date : dataType, options);
}

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
export function controlTypeForType(descriptor, options = {}) {
  assertInputTypeOptions(options);
  const dataType = normalizeDataType(descriptor);
  if (dataType === "array") return "array";
  if (dataType === "object") return "object";
  if (dataType === "map" || dataType === "weakmap") return "map";
  if (dataType === "set" || dataType === "weakset") return "set";
  return inputTypeForType(descriptor, options) === undefined ? "unsupported" : "input";
}

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
export function controlTypeForValue(value, options = {}) {
  assertInputTypeOptions(options);
  if (Array.isArray(value)) {
    const analysis = analyzeArrayTypes(value);
    if (analysis.empty) return "array";
    if (analysis.types.length > 1) return "mixed-array";
    if (analysis.primaryType === "object") return "object-array";
    if (analysis.primaryType === "array") return "nested-array";
    return "scalar-array";
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
 * @returns {Readonly<{name: string, label: string, path: readonly (string | number)[], dataType: string, inputType: string | undefined, controlType: ReturnType<typeof controlTypeForValue>, defaultValue: unknown, arrayAnalysis: ReturnType<typeof analyzeArrayTypes> | undefined}>} Frozen framework-neutral field descriptor.
 * @throws {TypeError} If name, options, label, or path is invalid.
 * @example
 * fieldDescriptorFor("active", false).inputType; // "checkbox"
 * @since 2.0.0
 */
export function fieldDescriptorFor(name, value, options = {}) {
  if (typeof name !== "string" || name.trim() === "") throw new TypeError("name must be a nonblank string.");
  if (blockedKeys.has(name)) throw new TypeError(`Unsafe field name: ${name}`);
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
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
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
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

  if (typeof descriptor === "function" && type === "object" && descriptor !== Object) {
    throw new TypeError("Custom constructors cannot be reconstructed from serialized input.");
  }

  if (isTextDescriptor(key, type)) return (value) => parseStringValue(value, parserOptions);
  if (key === "time") return (value) => parseTemporalText(value, "time", parserOptions);
  if (key === "month") return (value) => parseTemporalText(value, "month", parserOptions);
  if (key === "week") return (value) => parseTemporalText(value, "week", parserOptions);
  if (key === "radio") return (value) => parseStringValue(value, parserOptions);

  switch (type) {
    case "boolean":
      return (value) => parseBooleanValue(value, parserOptions);
    case "number":
      return (value) => parseNumberValue(value, parserOptions, integerDescriptorKeys.has(key));
    case "nan":
      return (value) => parseNanValue(value, parserOptions);
    case "bigint":
      return (value) => parseBigIntValue(value, parserOptions);
    case "null":
      return (value) => parseNullValue(value, parserOptions);
    case "undefined":
      return (value) => parseUndefinedValue(value, parserOptions);
    case "date":
      return (value) => parseDateValue(value, parserOptions);
    case "array":
      return (value) => parseJsonContainer(value, "array", parserOptions);
    case "object":
      return (value) => parseJsonContainer(value, "object", parserOptions);
    case "data":
      return (value) => parseJsonContainer(value, "data", parserOptions);
    case "map":
      return (value) => parseMapValue(value, parserOptions);
    case "set":
      return (value) => parseSetValue(value, parserOptions);
    case "regexp":
      return (value) => parseRegExpValue(value, parserOptions);
    case "url":
      return (value) => parseUrlValue(value, parserOptions);
    case "urlsearchparams":
      return (value) => parseUrlSearchParamsValue(value, parserOptions);
    case "arraybuffer":
    case "dataview":
    case "sharedarraybuffer":
      return (value) => parseBufferValue(value, type, parserOptions);
    case "bigint64array":
    case "biguint64array":
    case "float32array":
    case "float64array":
    case "int8array":
    case "int16array":
    case "int32array":
    case "uint8array":
    case "uint8clampedarray":
    case "uint16array":
    case "uint32array":
      return (value) => parseTypedArrayValue(value, type, parserOptions);
    case "error":
      return (value) => parseErrorValue(value, parserOptions);
    case "blob":
    case "file":
    case "formdata":
    case "function":
    case "promise":
    case "symbol":
    case "weakmap":
    case "weakset":
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
  "button",
  "color",
  "email",
  "hidden",
  "image",
  "objectid",
  "password",
  "phone",
  "reset",
  "search",
  "submit",
  "tel",
  "telephone",
  "text",
]);
const finiteNumberPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
const integerPattern = /^[+-]?\d+$/;
const typedArrayConstructors = new Map([
  ["bigint64array", "BigInt64Array"],
  ["biguint64array", "BigUint64Array"],
  ["float32array", "Float32Array"],
  ["float64array", "Float64Array"],
  ["int8array", "Int8Array"],
  ["int16array", "Int16Array"],
  ["int32array", "Int32Array"],
  ["uint8array", "Uint8Array"],
  ["uint8clampedarray", "Uint8ClampedArray"],
  ["uint16array", "Uint16Array"],
  ["uint32array", "Uint32Array"],
]);

/** @param {InputValueParserOptions} options */
function normalizeInputValueParserOptions(options) {
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const empty = options.empty;
  if (empty !== undefined && empty !== "preserve" && empty !== "null" && empty !== "undefined" && empty !== "throw") {
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
  const dateOutput = options.dateOutput ?? "date";
  if (dateOutput !== "date" && dateOutput !== "timestamp" && dateOutput !== "string") {
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
  if (key === "checkbox") return "boolean";
  if (key === "range") return "number";
  if (key === "file") return "file";
  return normalizeDataType(descriptor);
}

/** @param {string} key @param {string} type */
function isTextDescriptor(key, type) {
  return type === "string" || textDescriptorKeys.has(key);
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
  if (source === "null") return null;
  throw new TypeError('Null input must be null or "null".');
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseUndefinedValue(value, options) {
  if (value === undefined) return undefined;
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  if (empty.handled) return empty.value;
  if (source === "undefined") return undefined;
  throw new TypeError('Undefined input must be undefined or "undefined".');
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseDateValue(value, options) {
  if (typeOf(value) === "date") {
    const timestamp = /** @type {Date} */ (value).getTime();
    if (!Number.isFinite(timestamp)) throw new TypeError("Date input must be valid.");
    return formatParsedDate(new Date(timestamp), options.dateOutput);
  }
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  if (empty.handled) return empty.value;
  const validationAssumption = options.dateOutput === "string" ? "utc" : options.dateAssumption;
  const date = dateFromInputText(source, validationAssumption, options.dateDisambiguation);
  return options.dateOutput === "string" ? source : formatParsedDate(date, options.dateOutput);
}

/** @param {Date} date @param {"date" | "timestamp" | "string"} output */
function formatParsedDate(date, output) {
  if (output === "timestamp") return date.getTime();
  if (output === "string") return date.toISOString();
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
  if (kind === "time" && !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?$/.test(source)) {
    throw new TypeError("Time input must use a valid HH:mm[:ss[.sss]] value.");
  }
  if (kind === "month" && !/^\d{4}-(?:0[1-9]|1[0-2])$/.test(source)) {
    throw new TypeError("Month input must use a valid YYYY-MM value.");
  }
  const week = source.match(/^(\d{4})-W(\d{2})$/);
  if (kind === "week" && (!week || Number(week[2]) < 1 || Number(week[2]) > isoWeeksInYear(Number(week[1])))) {
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
  if (expected === "array" && !Array.isArray(parsed)) throw new TypeError("Input JSON must contain an array.");
  if (expected === "object" && !isPlainObject(parsed)) throw new TypeError("Input JSON must contain a plain object.");
  return cloneJson(parsed, {
    maximumArrayLength: options.maximumItems,
    maximumBytes: options.maximumLength,
    maximumStringLength: options.maximumLength,
  });
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseMapValue(value, options) {
  if (typeOf(value) === "map") return value;
  const entries = parseJsonContainer(value, "array", options);
  for (const entry of /** @type {unknown[]} */ (entries)) {
    if (!Array.isArray(entry) || entry.length !== 2)
      throw new TypeError("Map input must contain two-item entry arrays.");
  }
  return new Map(/** @type {[unknown, unknown][]} */ (entries));
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseSetValue(value, options) {
  if (typeOf(value) === "set") return value;
  return new Set(/** @type {unknown[]} */ (parseJsonContainer(value, "array", options)));
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseRegExpValue(value, options) {
  if (typeOf(value) === "regexp") {
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
  if (typeOf(value) === "url") return value;
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
  if (typeOf(value) === "urlsearchparams") return value;
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
  const bytes = /** @type {unknown[]} */ (parseJsonContainer(value, "array", options));
  const normalized = bytes.map((byte) => {
    if (!Number.isInteger(byte) || /** @type {number} */ (byte) < 0 || /** @type {number} */ (byte) > 255) {
      throw new TypeError("Binary input items must be integers from 0 through 255.");
    }
    return /** @type {number} */ (byte);
  });
  if (type === "sharedarraybuffer") {
    const Constructor = globalThis.SharedArrayBuffer;
    if (typeof Constructor !== "function") throw new TypeError("SharedArrayBuffer is unavailable in this runtime.");
    const buffer = new Constructor(normalized.length);
    new Uint8Array(buffer).set(normalized);
    return buffer;
  }
  const buffer = Uint8Array.from(normalized).buffer;
  return type === "dataview" ? new DataView(buffer) : buffer;
}

/**
 * @param {unknown} value
 * @param {string} type
 * @param {ReturnType<typeof normalizeInputValueParserOptions>} options
 */
function parseTypedArrayValue(value, type, options) {
  if (typeOf(value) === type) return value;
  const items = /** @type {unknown[]} */ (parseJsonContainer(value, "array", options));
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
  if (type === "bigint64array" || type === "biguint64array") {
    if (typeof value === "string" && integerPattern.test(value)) value = BigInt(value);
    if (typeof value !== "bigint") throw new TypeError("BigInt typed-array items must be bigint or integer strings.");
    const minimum = type === "bigint64array" ? -(2n ** 63n) : 0n;
    const maximum = type === "bigint64array" ? 2n ** 63n - 1n : 2n ** 64n - 1n;
    if (value < minimum || value > maximum) throw new RangeError(`${type} item is outside its representable range.`);
    return value;
  }
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new TypeError("Typed-array items must be finite numbers.");
  if (type === "float32array") {
    if (!Number.isFinite(Math.fround(value))) throw new RangeError(`${type} item is outside its representable range.`);
    return value;
  }
  if (type === "float64array") return value;
  if (!Number.isInteger(value)) throw new TypeError("Integer typed-array items must be integers.");
  const [minimum, maximum] = typedArrayRange(type);
  if (value < minimum || value > maximum) throw new RangeError(`${type} item is outside its representable range.`);
  return value;
}

/** @param {string} type @returns {[number, number]} */
function typedArrayRange(type) {
  if (type === "int8array") return [-128, 127];
  if (type === "uint8array" || type === "uint8clampedarray") return [0, 255];
  if (type === "int16array") return [-32_768, 32_767];
  if (type === "uint16array") return [0, 65_535];
  if (type === "int32array") return [-2_147_483_648, 2_147_483_647];
  return [0, 4_294_967_295];
}

/** @param {unknown} value @param {ReturnType<typeof normalizeInputValueParserOptions>} options */
function parseErrorValue(value, options) {
  if (typeOf(value) === "error") return value;
  const source = scalarSource(value, options);
  const empty = resolveEmpty(source, options);
  return empty.handled ? empty.value : new Error(source);
}

/** @param {unknown} value @param {string} type */
function passThroughBrandedValue(value, type) {
  const matches =
    type === "function"
      ? typeof value === "function"
      : type === "symbol"
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
  if (policy === "null") return { handled: true, value: null };
  if (policy === "undefined") return { handled: true, value: undefined };
  throw new TypeError("Empty input is not valid for this datatype.");
}

/** @param {InputTypeOptions} options */
function assertInputTypeOptions(options) {
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  if (options.dateType !== undefined && options.dateType !== "date" && options.dateType !== "datetime-local") {
    throw new TypeError('dateType must be "date" or "datetime-local".');
  }
  if (
    options.unsupported !== undefined &&
    options.unsupported !== "text" &&
    options.unsupported !== "undefined" &&
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
