import { isPlainObject } from "./object.js";
import { typeOf } from "./validation.js";

/**
 * @typedef {object} DefaultValueOptions
 * @property {"epoch" | "now"} [date="epoch"] Date initialization policy.
 * @property {ReadonlyMap<string | Function, () => unknown> | Readonly<Record<string, () => unknown>>} [factories]
 * Descriptor- or canonical-type-specific factories checked before built-in defaults.
 * @property {"throw" | "undefined"} [unsupported="throw"] Unsupported-type policy.
 */

/**
 * @typedef {object} InitializeLikeOptions
 * @property {"epoch" | "now"} [date="epoch"] Date initialization policy.
 * @property {ReadonlyMap<string | Function, () => unknown> | Readonly<Record<string, () => unknown>>} [factories]
 * Descriptor- or canonical-type-specific factories checked before built-in defaults.
 * @property {"throw" | "undefined"} [unsupported="throw"] Unsupported-type policy.
 * @property {"empty" | "items" | "sample"} [arrays="empty"] Array initialization policy.
 * @property {"empty" | "shape"} [objects="shape"] Plain-object initialization policy.
 * @property {number} [maxDepth=100] Maximum recursive edge depth.
 * @property {number} [maxNodes=20000] Maximum values initialized.
 */

const blockedKeys = new Set(["__proto__", "constructor", "prototype"]);
const typedArrayTypes = new Set([
  "bigint64array",
  "biguint64array",
  "float32array",
  "float64array",
  "int8array",
  "int16array",
  "int32array",
  "uint8array",
  "uint8clampedarray",
  "uint16array",
  "uint32array",
]);
const aliases = new Map([
  ["any", "undefined"],
  ["bool", "boolean"],
  ["datetime", "date"],
  ["datetimelocal", "date"],
  ["decimal", "number"],
  ["decimal128", "number"],
  ["double", "number"],
  ["float", "number"],
  ["int", "number"],
  ["int32", "number"],
  ["integer", "number"],
  ["long", "number"],
  ["objectarray", "array"],
  ["objectid", "object"],
  ["void", "undefined"],
]);
const canonicalTypes = new Set([
  "array",
  "arraybuffer",
  "bigint",
  "blob",
  "boolean",
  "data",
  "dataview",
  "date",
  "error",
  "file",
  "formdata",
  "function",
  "map",
  "nan",
  "null",
  "number",
  "object",
  "promise",
  "regexp",
  "set",
  "sharedarraybuffer",
  "string",
  "symbol",
  "undefined",
  "url",
  "urlsearchparams",
  "weakmap",
  "weakset",
  ...typedArrayTypes,
]);
/** @type {Map<Function, string>} */
const constructorTypes = new Map();
for (const [constructor, type] of [
  [Array, "array"],
  [ArrayBuffer, "arraybuffer"],
  [BigInt, "bigint"],
  [Boolean, "boolean"],
  [DataView, "dataview"],
  [Date, "date"],
  [Error, "error"],
  [Function, "function"],
  [Map, "map"],
  [Number, "number"],
  [Object, "object"],
  [Promise, "promise"],
  [RegExp, "regexp"],
  [Set, "set"],
  [String, "string"],
  [Symbol, "symbol"],
  [WeakMap, "weakmap"],
  [WeakSet, "weakset"],
]) {
  constructorTypes.set(/** @type {Function} */ (constructor), /** @type {string} */ (type));
}

for (const type of [
  "BigInt64Array",
  "BigUint64Array",
  "Blob",
  "File",
  "Float32Array",
  "Float64Array",
  "FormData",
  "Int8Array",
  "Int16Array",
  "Int32Array",
  "SharedArrayBuffer",
  "Uint8Array",
  "Uint8ClampedArray",
  "Uint16Array",
  "Uint32Array",
  "URL",
  "URLSearchParams",
]) {
  const constructor = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (globalThis))[type];
  if (typeof constructor === "function") constructorTypes.set(constructor, type.toLowerCase());
}

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
export function normalizeDataType(descriptor) {
  if (typeof descriptor === "function") return constructorTypes.get(descriptor) ?? "object";
  if (typeof descriptor !== "string" || descriptor.trim() === "") {
    throw new TypeError("descriptor must be a nonblank type string or constructor.");
  }

  const trimmed = descriptor.trim();
  if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || trimmed.endsWith("[]") || /^array\s*[<(]/i.test(trimmed)) {
    return "array";
  }

  const compact = trimmed.replace(/[\s_-]/g, "").toLowerCase();
  return aliases.get(compact) ?? (canonicalTypes.has(compact) ? compact : compact);
}

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
export function analyzeArrayTypes(values) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  const counts = Object.create(null);
  const types = [];

  for (let index = 0; index < values.length; index += 1) {
    const type = typeOf(values[index]);
    if (!Object.hasOwn(counts, type)) {
      counts[type] = 0;
      types.push(type);
    }
    counts[type] += 1;
  }

  return Object.freeze({
    length: values.length,
    empty: values.length === 0,
    homogeneous: types.length <= 1,
    primaryType: types[0],
    types: Object.freeze(types),
    counts: Object.freeze(counts),
  });
}

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
export function defaultValueForType(descriptor, options = {}) {
  assertDefaultOptions(options);
  const directFactory = getFactory(options.factories, descriptor);
  if (directFactory) return directFactory();

  const type = normalizeDataType(descriptor);
  const typeFactory = getFactory(options.factories, type);
  if (typeFactory) return typeFactory();
  const value = createBuiltInDefault(type, options.date ?? "epoch");
  if (value.supported) return value.value;
  if ((options.unsupported ?? "throw") === "undefined") return undefined;
  throw new TypeError(`No default value is supported for type: ${type}`);
}

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
export function defaultValueFor(value, options = {}) {
  return defaultValueForType(typeOf(value), options);
}

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
export function initializeLike(value, options = {}) {
  assertInitializeOptions(options);
  const arrays = options.arrays ?? "empty";
  const objects = options.objects ?? "shape";
  const maxDepth = options.maxDepth ?? 100;
  const maxNodes = options.maxNodes ?? 20_000;
  const seen = new WeakMap();
  let nodes = 0;

  /** @param {unknown} current @param {number} depth @returns {unknown} */
  const visit = (current, depth) => {
    nodes += 1;
    if (nodes > maxNodes) throw new RangeError("initializeLike exceeded maxNodes.");
    if (depth > maxDepth) throw new RangeError("initializeLike exceeded maxDepth.");

    if (Array.isArray(current)) {
      const existing = seen.get(current);
      if (existing) return existing;
      assertArrayDataProperties(current);
      /** @type {unknown[]} */
      const output = [];
      seen.set(current, output);
      if (arrays === "empty" || current.length === 0) return output;
      if (arrays === "sample") {
        output.push(visit(current[0], depth + 1));
        return output;
      }
      for (let index = 0; index < current.length; index += 1) output.push(visit(current[index], depth + 1));
      return output;
    }

    if (isPlainObject(current)) {
      const existing = seen.get(current);
      if (existing) return existing;
      const entries = ownEnumerableDataEntries(current);
      const output = Object.create(Object.getPrototypeOf(current) === null ? null : Object.prototype);
      seen.set(current, output);
      if (objects === "empty") return output;
      for (const [key, nested] of entries) {
        Object.defineProperty(output, key, {
          configurable: true,
          enumerable: true,
          value: visit(nested, depth + 1),
          writable: true,
        });
      }
      return output;
    }

    return defaultValueFor(current, options);
  };

  return visit(value, 0);
}

/** @param {DefaultValueOptions} options */
function assertDefaultOptions(options) {
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  if (options.date !== undefined && options.date !== "epoch" && options.date !== "now") {
    throw new TypeError('date must be "epoch" or "now".');
  }
  if (options.unsupported !== undefined && options.unsupported !== "throw" && options.unsupported !== "undefined") {
    throw new TypeError('unsupported must be "throw" or "undefined".');
  }
  assertFactories(options.factories);
}

/** @param {InitializeLikeOptions} options */
function assertInitializeOptions(options) {
  assertDefaultOptions(options);
  if (options.arrays !== undefined && !["empty", "items", "sample"].includes(options.arrays)) {
    throw new TypeError('arrays must be "empty", "items", or "sample".');
  }
  if (options.objects !== undefined && options.objects !== "empty" && options.objects !== "shape") {
    throw new TypeError('objects must be "empty" or "shape".');
  }
  assertNonNegativeSafeInteger(options.maxDepth ?? 100, "maxDepth");
  assertPositiveSafeInteger(options.maxNodes ?? 20_000, "maxNodes");
}

/** @param {DefaultValueOptions["factories"]} factories */
function assertFactories(factories) {
  if (factories === undefined) return;
  if (factories instanceof Map) {
    for (const [descriptor, factory] of factories) {
      if ((typeof descriptor !== "string" && typeof descriptor !== "function") || typeof factory !== "function") {
        throw new TypeError("factories Map entries must pair type descriptors with functions.");
      }
    }
    return;
  }
  if (!isPlainObject(factories) || Object.values(factories).some((factory) => typeof factory !== "function")) {
    throw new TypeError("factories must be a Map or plain object of functions.");
  }
}

/**
 * @param {DefaultValueOptions["factories"]} factories
 * @param {string | Function} descriptor
 * @returns {(() => unknown) | undefined}
 */
function getFactory(factories, descriptor) {
  if (factories === undefined) return undefined;
  if (factories instanceof Map) return factories.get(descriptor);
  const factoryRecord = /** @type {Readonly<Record<string, () => unknown>>} */ (factories);
  return typeof descriptor === "string" && Object.hasOwn(factoryRecord, descriptor)
    ? factoryRecord[descriptor]
    : undefined;
}

/** @param {string} type @param {"epoch" | "now"} date */
function createBuiltInDefault(type, date) {
  if (type === "undefined" || type === "any") return supported(undefined);
  if (type === "null") return supported(null);
  if (type === "boolean") return supported(false);
  if (type === "number" || type === "nan") return supported(0);
  if (type === "bigint") return supported(0n);
  if (type === "string") return supported("");
  if (type === "symbol") return supported(Symbol());
  if (type === "function") return supported(function initializedFunction() {});
  if (type === "array") return supported([]);
  if (type === "object" || type === "data") return supported({});
  if (type === "date") return supported(new Date(date === "now" ? Date.now() : 0));
  if (type === "regexp") return supported(new RegExp(""));
  if (type === "map") return supported(new Map());
  if (type === "set") return supported(new Set());
  if (type === "weakmap") return supported(new WeakMap());
  if (type === "weakset") return supported(new WeakSet());
  if (type === "promise") return supported(Promise.resolve(undefined));
  if (type === "error") return supported(new Error());
  if (type === "arraybuffer") return supported(new ArrayBuffer(0));
  if (type === "dataview") return supported(new DataView(new ArrayBuffer(0)));
  if (type === "url") return supported(new URL("about:blank"));
  if (type === "urlsearchparams") return supported(new URLSearchParams());

  const constructor = [...constructorTypes].find(([, knownType]) => knownType === type)?.[0];
  const BuiltIn = /** @type {any} */ (constructor);
  if (typedArrayTypes.has(type) && constructor) return supported(new BuiltIn(0));
  if (type === "sharedarraybuffer" && constructor) return supported(new BuiltIn(0));
  if (type === "blob" && constructor) return supported(new BuiltIn([]));
  if (type === "file" && constructor) return supported(new BuiltIn([], ""));
  if (type === "formdata" && constructor) return supported(new BuiltIn());
  return { supported: false, value: undefined };
}

/** @param {unknown} value */
function supported(value) {
  return { supported: true, value };
}

/** @param {unknown[]} value */
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

/** @param {Record<PropertyKey, unknown>} value @returns {Array<[string, unknown]>} */
function ownEnumerableDataEntries(value) {
  /** @type {Array<[string, unknown]>} */
  const entries = [];
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable) continue;
    if (typeof key === "symbol") throw new TypeError("objects cannot contain enumerable symbol properties.");
    if (blockedKeys.has(key)) throw new TypeError(`Unsafe property: ${key}`);
    if (!Object.hasOwn(descriptor, "value")) throw new TypeError("objects cannot contain enumerable accessors.");
    entries.push([key, descriptor.value]);
  }
  return entries;
}

/** @param {unknown} value @param {string} name */
function assertNonNegativeSafeInteger(value, name) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer.`);
  }
}

/** @param {unknown} value @param {string} name */
function assertPositiveSafeInteger(value, name) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive safe integer.`);
  }
}
