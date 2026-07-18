import { analyzeArrayTypes, normalizeDataType } from "./data.js";
import { isPlainObject } from "./object.js";
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
