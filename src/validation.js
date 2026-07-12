import { isPlainObject } from "./object.js";

const brandCheckKey = Object.freeze({});
const supportedContractKeywords = new Set([
  "$ref",
  "type",
  "const",
  "enum",
  "required",
  "properties",
  "items",
  "additionalProperties",
  "definitions",
]);
const supportedJsonTypes = new Set(["array", "object", "integer", "null", "string", "number", "boolean"]);

/**
 * Checks whether a value is neither null nor undefined.
 *
 * @template T
 * @param {T | null | undefined} value
 * @returns {value is T}
 */
export function isDefined(value) {
  return value !== null && value !== undefined;
}

/**
 * Checks for nullish values or strings containing only whitespace.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isBlank(value) {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

/**
 * Checks common empty values: blank strings, empty arrays, empty Maps/Sets, and
 * plain objects without enumerable own properties. Zero and false are not empty.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (isBlank(value)) return true;
  if (Array.isArray(value) || typeof value === "string") return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (value !== null && typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Checks whether a value is a finite primitive number.
 *
 * @param {unknown} value
 * @returns {value is number}
 */
export function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Checks whether a value is a safe primitive integer.
 *
 * @param {unknown} value
 * @returns {value is number}
 */
export function isSafeInteger(value) {
  return typeof value === "number" && Number.isSafeInteger(value);
}

/**
 * Checks for a Map, including Maps created in another JavaScript realm.
 *
 * @param {unknown} value
 * @returns {value is Map<unknown, unknown>}
 */
export function isMap(value) {
  try {
    Map.prototype.has.call(value, brandCheckKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks for a Set, including Sets created in another JavaScript realm.
 *
 * @param {unknown} value
 * @returns {value is Set<unknown>}
 */
export function isSet(value) {
  try {
    Set.prototype.has.call(value, brandCheckKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks for any typed-array view while excluding DataView. Cross-realm typed
 * arrays are accepted.
 *
 * @param {unknown} value
 * @returns {value is Exclude<ArrayBufferView, DataView>}
 */
export function isTypedArray(value) {
  return ArrayBuffer.isView(value) && typeof /** @type {any} */ (value).BYTES_PER_ELEMENT === "number";
}

/**
 * Checks whether every item in an array is a plain object. Empty arrays satisfy
 * the contract; use `isNonEmptyArray` as an additional condition when needed.
 *
 * @param {unknown} value
 * @returns {value is Record<PropertyKey, unknown>[]}
 */
export function isPlainObjectArray(value) {
  return Array.isArray(value) && value.every(isPlainObject);
}

/**
 * Checks for a Blob when the current runtime exposes `globalThis.Blob`.
 * Returns false instead of throwing in runtimes without Blob support.
 *
 * @param {unknown} value
 * @returns {value is Blob}
 */
export function isBlob(value) {
  const BlobConstructor = globalThis.Blob;
  return typeof BlobConstructor === "function" && value instanceof BlobConstructor;
}

/**
 * Checks for a File when the current runtime exposes `globalThis.File`.
 * Returns false instead of throwing in runtimes without File support.
 *
 * @param {unknown} value
 * @returns {value is File}
 */
export function isFile(value) {
  const FileConstructor = globalThis.File;
  return typeof FileConstructor === "function" && value instanceof FileConstructor;
}

/**
 * Returns a precise, lowercase runtime type name.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isNaN(value)) return "nan";
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

/**
 * Checks whether a string contains valid JSON. Valid scalar JSON is accepted.
 *
 * @param {unknown} value
 * @returns {value is string}
 */
export function isJson(value) {
  if (typeof value !== "string") return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Performs pragmatic email syntax validation. It does not attempt deliverability
 * or full RFC mailbox validation.
 *
 * @param {unknown} value
 * @returns {value is string}
 */
export function isEmail(value) {
  if (typeof value !== "string" || value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Normalizes a North American phone number into ten digits, or returns null.
 * A leading country code of 1 is accepted.
 *
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizeNanpPhone(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  let digits = String(value).replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.length === 10 ? digits : null;
}

/**
 * Formats a valid North American phone number as `(555) 123-4567`.
 *
 * @param {unknown} value
 * @returns {string | null}
 */
export function formatNanpPhone(value) {
  const digits = normalizeNanpPhone(value);
  return digits ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : null;
}

/**
 * Validates a value against a useful JSON Schema subset. Supported keywords are
 * `$ref`, `type`, `const`, `enum`, `required`, `properties`, `items`,
 * `additionalProperties`, and `definitions`. Unsupported keywords and malformed
 * schemas throw instead of being silently ignored.
 *
 * @param {unknown} value
 * @param {Record<string, any>} schema
 * @returns {string[]}
 */
export function validateJsonContract(value, schema) {
  assertSupportedSchema(schema);
  return validateContractNode(value, schema, schema, "$");
}

/**
 * Asserts a value against the supported JSON Schema subset.
 *
 * @template T
 * @param {T} value
 * @param {Record<string, any>} schema
 * @returns {T}
 */
export function assertJsonContract(value, schema) {
  const errors = validateJsonContract(value, schema);
  if (errors.length > 0) throw new TypeError(errors.join("\n"));
  return value;
}

/**
 * @param {unknown} value
 * @param {Record<string, any>} schema
 * @param {Record<string, any>} root
 * @param {string} path
 * @returns {string[]}
 */
function validateContractNode(value, schema, root, path) {
  const contract = schema.$ref ? resolveReference(root, schema.$ref) : schema;
  if (!contract) return [`${path}: unresolved contract reference`];
  const errors = [];

  if (Object.hasOwn(contract, "const") && !Object.is(value, contract.const)) errors.push(`${path}: unexpected constant value`);
  if (Array.isArray(contract.enum) && !contract.enum.some((/** @type {unknown} */ entry) => Object.is(entry, value))) errors.push(`${path}: unsupported enum value`);
  if (contract.type && !matchesJsonType(value, contract.type)) {
    errors.push(`${path}: expected ${contract.type}`);
    return errors;
  }

  if (contract.type === "object") {
    const objectValue = /** @type {Record<string, unknown>} */ (value);
    const properties = contract.properties ?? {};
    for (const key of contract.required ?? []) {
      if (!Object.hasOwn(objectValue, key)) errors.push(`${path}: missing ${key}`);
    }
    if (contract.additionalProperties === false) {
      for (const key of Object.keys(objectValue)) {
        if (!Object.hasOwn(properties, key)) errors.push(`${path}: unexpected ${key}`);
      }
    }
    for (const [key, child] of Object.entries(properties)) {
      if (Object.hasOwn(objectValue, key)) errors.push(...validateContractNode(objectValue[key], child, root, `${path}.${key}`));
    }
  }

  if (contract.type === "array" && contract.items) {
    const arrayValue = /** @type {unknown[]} */ (value);
    for (let index = 0; index < arrayValue.length; index += 1) {
      errors.push(...validateContractNode(arrayValue[index], contract.items, root, `${path}[${index}]`));
    }
  }
  return errors;
}

/** @param {Record<string, any>} root @param {string} reference */
function resolveReference(root, reference) {
  if (typeof reference !== "string" || !reference.startsWith("#/")) {
    throw new TypeError(`Unsupported contract reference: ${String(reference)}`);
  }
  return reference.slice(2).split("/").reduce((current, segment) => {
    if (current === null || typeof current !== "object") return undefined;
    const key = segment.replace(/~1/g, "/").replace(/~0/g, "~");
    return Object.hasOwn(current, key) ? current[key] : undefined;
  }, /** @type {any} */ (root));
}

/** @param {unknown} value @param {string | string[]} expected @returns {boolean} */
function matchesJsonType(value, expected) {
  if (Array.isArray(expected)) return expected.some((type) => matchesJsonType(value, type));
  if (expected === "array") return Array.isArray(value);
  if (expected === "object") return isPlainObject(value);
  if (expected === "integer") return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value);
  if (expected === "number") return isFiniteNumber(value);
  if (expected === "null") return value === null;
  return typeof value === expected;
}

/** @param {unknown} schema */
function assertSupportedSchema(schema) {
  const visiting = new WeakSet();
  const verified = new WeakSet();

  /** @param {unknown} node @param {string} path */
  const assertNode = (node, path) => {
    if (!isPlainObject(node)) throw new TypeError(`${path} must be a plain schema object.`);
    if (verified.has(node)) return;
    if (visiting.has(node)) throw new TypeError(`${path} contains a circular schema object.`);
    visiting.add(node);

    /** @type {Record<string, unknown>} */
    const values = {};
    for (const key of Reflect.ownKeys(node)) {
      const descriptor = Object.getOwnPropertyDescriptor(node, key);
      if (!descriptor?.enumerable) continue;
      if (typeof key === "symbol") throw new TypeError(`${path} cannot contain symbol keywords.`);
      if (!supportedContractKeywords.has(key)) throw new TypeError(`${path} uses unsupported keyword ${key}.`);
      if (!("value" in descriptor)) throw new TypeError(`${path}.${key} must be a data property.`);
      values[key] = descriptor.value;
    }

    if (Object.hasOwn(values, "$ref")) {
      if (typeof values.$ref !== "string" || !values.$ref.startsWith("#/")) {
        throw new TypeError(`${path}.$ref must be a local JSON Pointer.`);
      }
      const siblings = Object.keys(values).filter((key) => key !== "$ref" && key !== "definitions");
      if (siblings.length > 0) throw new TypeError(`${path} cannot combine $ref with validation keywords.`);
    }

    if (Object.hasOwn(values, "type")) {
      const types = Array.isArray(values.type) ? values.type : [values.type];
      if (types.length === 0 || [...types].some((type) => typeof type !== "string" || !supportedJsonTypes.has(type))) {
        throw new TypeError(`${path}.type contains an unsupported JSON type.`);
      }
    }
    if (Object.hasOwn(values, "enum") && (!Array.isArray(values.enum) || values.enum.length === 0)) {
      throw new TypeError(`${path}.enum must be a non-empty array.`);
    }
    if (Object.hasOwn(values, "required") && (
      !Array.isArray(values.required) || [...values.required].some((key) => typeof key !== "string")
    )) throw new TypeError(`${path}.required must be an array of strings.`);
    if (Object.hasOwn(values, "additionalProperties") && typeof values.additionalProperties !== "boolean") {
      throw new TypeError(`${path}.additionalProperties must be a boolean.`);
    }

    for (const keyword of ["properties", "definitions"]) {
      if (!Object.hasOwn(values, keyword)) continue;
      const children = values[keyword];
      if (!isPlainObject(children)) throw new TypeError(`${path}.${keyword} must be a plain object.`);
      for (const key of Reflect.ownKeys(children)) {
        const descriptor = Object.getOwnPropertyDescriptor(children, key);
        if (!descriptor?.enumerable) continue;
        if (typeof key === "symbol") throw new TypeError(`${path}.${keyword} cannot contain symbol keys.`);
        if (!("value" in descriptor)) throw new TypeError(`${path}.${keyword}.${key} must be a data property.`);
        assertNode(descriptor.value, `${path}.${keyword}.${key}`);
      }
    }
    if (Object.hasOwn(values, "items")) assertNode(values.items, `${path}.items`);

    visiting.delete(node);
    verified.add(node);
  };

  assertNode(schema, "schema");
}
