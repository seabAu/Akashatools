import { plainObjectOptionsErrorMessage } from "./internal/error-messages.js";
import { dataTypes } from "./internal/type-vocabulary.js";
import { isPlainObject } from "./object.js";
import { typeOf } from "./validation.js";

/** @typedef {typeof dataTypes} DataTypeMap */

/**
 * Frozen enum-style identifiers for every data type recognized by Akashatools
 * contracts. Values remain the existing lowercase strings, so constants and
 * serialized descriptors are interchangeable.
 *
 * @type {DataTypeMap}
 * @example
 * defaultValueForType(DATA_TYPES.BOOLEAN); // false
 * @since 2.0.0
 */
export const DATA_TYPES = dataTypes;

/** @typedef {(typeof DATA_TYPES)[keyof typeof DATA_TYPES]} DataType */

/**
 * @typedef {object} DefaultValueOptions
 * @property {"epoch" | "now"} [date="epoch"] Date initialization policy.
 * @property {ReadonlyMap<string | Function, () => unknown> | Readonly<Record<string, () => unknown>>} [factories]
 * Descriptor- or canonical-type-specific factories checked before built-in defaults.
 * @property {"throw" | typeof DATA_TYPES.UNDEFINED} [unsupported="throw"] Unsupported-type policy.
 */

/**
 * @typedef {object} InitializeLikeOptions
 * @property {"epoch" | "now"} [date="epoch"] Date initialization policy.
 * @property {ReadonlyMap<string | Function, () => unknown> | Readonly<Record<string, () => unknown>>} [factories]
 * Descriptor- or canonical-type-specific factories checked before built-in defaults.
 * @property {"throw" | typeof DATA_TYPES.UNDEFINED} [unsupported="throw"] Unsupported-type policy.
 * @property {"empty" | "items" | "sample"} [arrays="empty"] Array initialization policy.
 * @property {"empty" | "shape"} [objects="shape"] Plain-object initialization policy.
 * @property {number} [maxDepth=100] Maximum recursive edge depth.
 * @property {number} [maxNodes=20000] Maximum values initialized.
 */

const blockedKeys = new Set(["__proto__", "constructor", "prototype"]);
/** @type {Set<string>} */
const typedArrayTypes = new Set([
  DATA_TYPES.BIGINT64_ARRAY,
  DATA_TYPES.BIGUINT64_ARRAY,
  DATA_TYPES.FLOAT32_ARRAY,
  DATA_TYPES.FLOAT64_ARRAY,
  DATA_TYPES.INT8_ARRAY,
  DATA_TYPES.INT16_ARRAY,
  DATA_TYPES.INT32_ARRAY,
  DATA_TYPES.UINT8_ARRAY,
  DATA_TYPES.UINT8_CLAMPED_ARRAY,
  DATA_TYPES.UINT16_ARRAY,
  DATA_TYPES.UINT32_ARRAY,
]);
/** @type {Map<string, string>} */
const normalizedTypes = new Map();
for (const type of Object.values(DATA_TYPES)) normalizedTypes.set(type, type);
for (const [alias, type] of [
  [DATA_TYPES.ANY, DATA_TYPES.UNDEFINED],
  ["bool", DATA_TYPES.BOOLEAN],
  ["datetime", DATA_TYPES.DATE],
  ["datetimelocal", DATA_TYPES.DATE],
  ["decimal", DATA_TYPES.NUMBER],
  ["decimal128", DATA_TYPES.NUMBER],
  ["double", DATA_TYPES.NUMBER],
  ["float", DATA_TYPES.NUMBER],
  ["int", DATA_TYPES.NUMBER],
  ["int32", DATA_TYPES.NUMBER],
  [DATA_TYPES.INTEGER, DATA_TYPES.NUMBER],
  ["long", DATA_TYPES.NUMBER],
  ["objectarray", DATA_TYPES.ARRAY],
  ["objectid", DATA_TYPES.OBJECT],
  ["void", DATA_TYPES.UNDEFINED],
]) {
  normalizedTypes.set(alias, type);
}
/** @type {Map<Function, string>} */
const constructorTypes = new Map();
for (const [constructor, type] of [
  [Array, DATA_TYPES.ARRAY],
  [ArrayBuffer, DATA_TYPES.ARRAY_BUFFER],
  [BigInt, DATA_TYPES.BIGINT],
  [Boolean, DATA_TYPES.BOOLEAN],
  [DataView, DATA_TYPES.DATA_VIEW],
  [Date, DATA_TYPES.DATE],
  [Error, DATA_TYPES.ERROR],
  [Function, DATA_TYPES.FUNCTION],
  [Map, DATA_TYPES.MAP],
  [Number, DATA_TYPES.NUMBER],
  [Object, DATA_TYPES.OBJECT],
  [Promise, DATA_TYPES.PROMISE],
  [RegExp, DATA_TYPES.REGEXP],
  [Set, DATA_TYPES.SET],
  [String, DATA_TYPES.STRING],
  [Symbol, DATA_TYPES.SYMBOL],
  [WeakMap, DATA_TYPES.WEAK_MAP],
  [WeakSet, DATA_TYPES.WEAK_SET],
]) {
  constructorTypes.set(/** @type {Function} */ (constructor), /** @type {string} */ (type));
}

for (const [name, type] of [
  ["BigInt64Array", DATA_TYPES.BIGINT64_ARRAY],
  ["BigUint64Array", DATA_TYPES.BIGUINT64_ARRAY],
  ["Blob", DATA_TYPES.BLOB],
  ["File", DATA_TYPES.FILE],
  ["Float32Array", DATA_TYPES.FLOAT32_ARRAY],
  ["Float64Array", DATA_TYPES.FLOAT64_ARRAY],
  ["FormData", DATA_TYPES.FORM_DATA],
  ["Int8Array", DATA_TYPES.INT8_ARRAY],
  ["Int16Array", DATA_TYPES.INT16_ARRAY],
  ["Int32Array", DATA_TYPES.INT32_ARRAY],
  ["SharedArrayBuffer", DATA_TYPES.SHARED_ARRAY_BUFFER],
  ["Uint8Array", DATA_TYPES.UINT8_ARRAY],
  ["Uint8ClampedArray", DATA_TYPES.UINT8_CLAMPED_ARRAY],
  ["Uint16Array", DATA_TYPES.UINT16_ARRAY],
  ["Uint32Array", DATA_TYPES.UINT32_ARRAY],
  ["URL", DATA_TYPES.URL],
  ["URLSearchParams", DATA_TYPES.URL_SEARCH_PARAMS],
]) {
  const constructor = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (globalThis))[name];
  if (typeof constructor === "function") constructorTypes.set(constructor, type);
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
  if (typeof descriptor === "function") return constructorTypes.get(descriptor) ?? DATA_TYPES.OBJECT;
  if (typeof descriptor !== "string" || descriptor.trim() === "") {
    throw new TypeError("descriptor must be a nonblank type string or constructor.");
  }

  const trimmed = descriptor.trim();
  if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || trimmed.endsWith("[]") || /^array\s*[<(]/i.test(trimmed)) {
    return DATA_TYPES.ARRAY;
  }

  const compact = trimmed.replace(/[\s_-]/g, "").toLowerCase();
  return normalizedTypes.get(compact) ?? compact;
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
  if ((options.unsupported ?? "throw") === DATA_TYPES.UNDEFINED) return undefined;
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
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
  if (options.date !== undefined && options.date !== "epoch" && options.date !== "now") {
    throw new TypeError('date must be "epoch" or "now".');
  }
  if (
    options.unsupported !== undefined &&
    options.unsupported !== "throw" &&
    options.unsupported !== DATA_TYPES.UNDEFINED
  ) {
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
  if (type === DATA_TYPES.UNDEFINED || type === DATA_TYPES.ANY) return supported(undefined);
  if (type === DATA_TYPES.NULL) return supported(null);
  if (type === DATA_TYPES.BOOLEAN) return supported(false);
  if (type === DATA_TYPES.NUMBER || type === DATA_TYPES.NAN) return supported(0);
  if (type === DATA_TYPES.BIGINT) return supported(0n);
  if (type === DATA_TYPES.STRING) return supported("");
  if (type === DATA_TYPES.SYMBOL) return supported(Symbol());
  if (type === DATA_TYPES.FUNCTION) return supported(function initializedFunction() {});
  if (type === DATA_TYPES.ARRAY) return supported([]);
  if (type === DATA_TYPES.OBJECT || type === DATA_TYPES.DATA) return supported({});
  if (type === DATA_TYPES.DATE) return supported(new Date(date === "now" ? Date.now() : 0));
  if (type === DATA_TYPES.REGEXP) return supported(new RegExp(""));
  if (type === DATA_TYPES.MAP) return supported(new Map());
  if (type === DATA_TYPES.SET) return supported(new Set());
  if (type === DATA_TYPES.WEAK_MAP) return supported(new WeakMap());
  if (type === DATA_TYPES.WEAK_SET) return supported(new WeakSet());
  if (type === DATA_TYPES.PROMISE) return supported(Promise.resolve(undefined));
  if (type === DATA_TYPES.ERROR) return supported(new Error());
  if (type === DATA_TYPES.ARRAY_BUFFER) return supported(new ArrayBuffer(0));
  if (type === DATA_TYPES.DATA_VIEW) return supported(new DataView(new ArrayBuffer(0)));
  if (type === DATA_TYPES.URL) return supported(new URL("about:blank"));
  if (type === DATA_TYPES.URL_SEARCH_PARAMS) return supported(new URLSearchParams());

  const constructor = [...constructorTypes].find(([, knownType]) => knownType === type)?.[0];
  const BuiltIn = /** @type {any} */ (constructor);
  if (typedArrayTypes.has(type) && constructor) return supported(new BuiltIn(0));
  if (type === DATA_TYPES.SHARED_ARRAY_BUFFER && constructor) return supported(new BuiltIn(0));
  if (type === DATA_TYPES.BLOB && constructor) return supported(new BuiltIn([]));
  if (type === DATA_TYPES.FILE && constructor) return supported(new BuiltIn([], ""));
  if (type === DATA_TYPES.FORM_DATA && constructor) return supported(new BuiltIn());
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
