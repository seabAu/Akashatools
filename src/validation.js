import { plainObjectOptionsErrorMessage } from "./internal/error-messages.js";
import { dataTypes as DATA_TYPES } from "./internal/type-vocabulary.js";
import { isPlainObject } from "./object.js";

/**
 * @typedef {(typeof DATA_TYPES)["ARRAY" | "OBJECT" | "INTEGER" | "NULL" | "STRING" | "NUMBER" | "BOOLEAN"]} JsonContractType
 */
/** @typedef {"file" | "directory" | "either"} PortablePathKind */
/** @typedef {"NFC" | "NFKC" | "none"} PortablePathNormalization */
/**
 * @typedef {object} PortableRelativePathOptions
 * @property {PortablePathKind} [kind="file"] Expected final path kind and trailing-slash policy.
 * @property {PortablePathNormalization} [normalization="NFC"] Explicit Unicode normalization policy.
 * @property {boolean} [allowBackslash=false] Whether backslashes are accepted and canonicalized to slashes.
 * @property {number} [maximumLength=512] Positive safe-integer path code-unit bound.
 * @property {number} [maximumSegments=32] Positive safe-integer segment-count bound.
 * @property {number} [maximumSegmentLength=255] Positive safe-integer segment code-unit bound.
 */

/**
 * @typedef {object} JsonContract
 * @property {string} [$ref]
 * @property {JsonContractType | readonly JsonContractType[]} [type]
 * @property {unknown} [const]
 * @property {readonly unknown[]} [enum]
 * @property {readonly string[]} [required]
 * @property {Record<string, JsonContract>} [properties]
 * @property {JsonContract} [items]
 * @property {boolean} [additionalProperties]
 * @property {Record<string, JsonContract>} [definitions]
 */

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
/** @type {Set<string>} */
const supportedJsonTypes = new Set([
  DATA_TYPES.ARRAY,
  DATA_TYPES.OBJECT,
  DATA_TYPES.INTEGER,
  DATA_TYPES.NULL,
  DATA_TYPES.STRING,
  DATA_TYPES.NUMBER,
  DATA_TYPES.BOOLEAN,
]);
const emailLocalPattern = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const domainLabelPattern = /^[A-Za-z0-9-]+$/;
const nanpInputPattern = /^[\d\s()+.-]+$/;
const portablePathBidiControls = /[\u202a-\u202e\u2066-\u2069]/u;
const portablePathInvalidCharacters = /[<>:"|?*]/u;
const portableReservedSegment = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu;

/**
 * Checks whether a value is neither null nor undefined.
 *
 * @template T
 * @param {T | null | undefined} value Candidate that may be nullish.
 * @returns {value is T} Whether value is neither null nor undefined; other falsy values pass.
 * @example
 * isDefined(0); // true
 * @since 2.0.0
 */
export function isDefined(value) {
  return value !== null && value !== undefined;
}

/**
 * Checks whether a value is an array without coercion.
 *
 * @param {unknown} value Candidate value.
 * @returns {value is unknown[]} Whether the value is an array, including an empty or cross-realm array.
 * @example
 * isArray([]); // true
 * @since 2.0.0
 */
export function isArray(value) {
  return Array.isArray(value);
}

/**
 * Checks whether a value is a primitive string without accepting boxed String
 * objects.
 *
 * @param {unknown} value Candidate primitive.
 * @returns {value is string} Whether the value has the primitive string type.
 * @example
 * isString("Akasha"); // true
 * @since 2.0.0
 */
export function isString(value) {
  return typeof value === "string";
}

/**
 * Checks whether a value is a primitive number. NaN and infinities are numbers;
 * use `isFiniteNumber` when arithmetic requires a finite value.
 *
 * @param {unknown} value Candidate primitive.
 * @returns {value is number} Whether the value has the primitive number type.
 * @example
 * isNumber(Number.NaN); // true
 * @since 2.0.0
 */
export function isNumber(value) {
  return typeof value === "number";
}

/**
 * Checks whether a value is a primitive boolean without coercion.
 *
 * @param {unknown} value Candidate primitive.
 * @returns {value is boolean} Whether the value is exactly true or false.
 * @example
 * isBoolean(false); // true
 * @since 2.0.0
 */
export function isBoolean(value) {
  return typeof value === "boolean";
}

/**
 * Checks for a non-null object while excluding arrays and functions. Plain
 * objects, class instances, Dates, Maps, and Sets are accepted across realms.
 *
 * @param {unknown} value Candidate object.
 * @returns {value is object} Whether the value is a non-array object.
 * @example
 * isNonArrayObject(new Date()); // true
 * @since 2.0.0
 */
export function isNonArrayObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Checks for nullish values or strings containing only whitespace.
 *
 * @param {unknown} value Candidate for absence/whitespace semantics.
 * @returns {boolean} True only for null, undefined, or whitespace-only strings.
 * @example
 * isBlank("  "); // true
 * @since 2.0.0
 */
export function isBlank(value) {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

/**
 * Returns a fallback for nullish or whitespace-only input and otherwise returns
 * the original value unchanged. Zero and false are preserved.
 *
 * @template T
 * @template U
 * @param {T} value Candidate value.
 * @param {U} fallback Value returned when the candidate is blank.
 * @returns {T | U} Original nonblank value or the supplied fallback.
 * @example
 * defaultIfBlank("  ", "untitled"); // "untitled"
 * @since 2.0.0
 */
export function defaultIfBlank(value, fallback) {
  return isBlank(value) ? fallback : value;
}

/**
 * Checks common empty values: blank strings, empty arrays, empty Maps/Sets, and
 * plain objects without enumerable own properties. Zero and false are not empty.
 *
 * @param {unknown} value Candidate collection, string, or plain object.
 * @returns {boolean} Whether value matches one explicitly supported empty shape.
 * @example
 * isEmpty(new Map()); // true
 * @since 2.0.0
 */
export function isEmpty(value) {
  if (isBlank(value)) return true;
  if (Array.isArray(value) || typeof value === "string") return value.length === 0;
  if (isMap(value) || isSet(value)) return value.size === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
}

/**
 * Checks whether a value is a finite primitive number.
 *
 * @param {unknown} value Candidate primitive.
 * @returns {value is number} Whether value is a primitive finite number without coercion.
 * @example
 * isFiniteNumber(0); // true
 * @since 2.0.0
 */
export function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Checks whether a value is a finite primitive number with a fractional part.
 *
 * @param {unknown} value Candidate primitive.
 * @returns {value is number} Whether the value is finite and not an integer.
 * @example
 * isFiniteNonInteger(1.5); // true
 * @since 2.0.0
 */
export function isFiniteNonInteger(value) {
  return isFiniteNumber(value) && !Number.isInteger(value);
}

/**
 * Checks whether a value is a safe primitive integer.
 *
 * @param {unknown} value Candidate primitive.
 * @returns {value is number} Whether value is a primitive safe integer without coercion.
 * @example
 * isSafeInteger(1); // true
 * @since 2.0.0
 */
export function isSafeInteger(value) {
  return typeof value === "number" && Number.isSafeInteger(value);
}

/**
 * Checks for a Map, including Maps created in another JavaScript realm.
 *
 * @param {unknown} value Candidate from any JavaScript realm.
 * @returns {value is Map<unknown, unknown>} Whether the intrinsic Map brand accepts value.
 * @example
 * isMap(new Map()); // true
 * @since 2.0.0
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
 * @param {unknown} value Candidate from any JavaScript realm.
 * @returns {value is Set<unknown>} Whether the intrinsic Set brand accepts value.
 * @example
 * isSet(new Set()); // true
 * @since 2.0.0
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
 * @param {unknown} value Candidate view from any JavaScript realm.
 * @returns {value is Exclude<ArrayBufferView, DataView>} Whether value is a typed array rather than DataView.
 * @example
 * isTypedArray(new Uint16Array(2)); // true
 * @since 2.0.0
 */
export function isTypedArray(value) {
  return ArrayBuffer.isView(value) && typeof (/** @type {any} */ (value).BYTES_PER_ELEMENT) === "number";
}

/**
 * Checks whether every item in an array is a plain object. Empty arrays satisfy
 * the contract; use `isNonEmptyArray` as an additional condition when needed.
 *
 * @param {unknown} value Candidate array.
 * @returns {value is Record<PropertyKey, unknown>[]} Whether every item is a plain object; empty arrays pass.
 * @example
 * isPlainObjectArray([{}, Object.create(null)]); // true
 * @since 2.0.0
 */
export function isPlainObjectArray(value) {
  return Array.isArray(value) && value.every(isPlainObject);
}

/**
 * Checks for a Blob when the current runtime exposes `globalThis.Blob`.
 * Returns false instead of throwing in runtimes without Blob support.
 *
 * @param {unknown} value Candidate in the current runtime realm.
 * @returns {value is Blob} Whether current global Blob exists and value is its instance.
 * @example
 * isBlob(new Blob(["data"])); // true in Blob-capable runtimes
 * @since 2.0.0
 */
export function isBlob(value) {
  const BlobConstructor = globalThis.Blob;
  return typeof BlobConstructor === "function" && value instanceof BlobConstructor;
}

/**
 * Checks for a File when the current runtime exposes `globalThis.File`.
 * Returns false instead of throwing in runtimes without File support.
 *
 * @param {unknown} value Candidate in the current runtime realm.
 * @returns {value is File} Whether current global File exists and value is its instance.
 * @example
 * isFile(new File(["data"], "data.txt")); // true in File-capable runtimes
 * @since 2.0.0
 */
export function isFile(value) {
  const FileConstructor = globalThis.File;
  return typeof FileConstructor === "function" && value instanceof FileConstructor;
}

/**
 * Returns a precise, lowercase runtime type name.
 *
 * @param {unknown} value Runtime value to brand without coercive parsing.
 * @returns {string} Lowercase intrinsic brand, with explicit null/array/nan names.
 * @example
 * typeOf(new Uint8Array()); // "uint8array"
 * @since 2.0.0
 */
export function typeOf(value) {
  if (value === null) return DATA_TYPES.NULL;
  if (Array.isArray(value)) return DATA_TYPES.ARRAY;

  switch (typeof value) {
    case "undefined":
      return DATA_TYPES.UNDEFINED;
    case "boolean":
      return DATA_TYPES.BOOLEAN;
    case "number":
      return Number.isNaN(value) ? DATA_TYPES.NAN : DATA_TYPES.NUMBER;
    case "string":
      return DATA_TYPES.STRING;
    case "bigint":
      return DATA_TYPES.BIGINT;
    case "symbol":
      return DATA_TYPES.SYMBOL;
  }

  const brand = Object.prototype.toString.call(value).slice(8, -1);
  switch (brand) {
    case "ArrayBuffer":
      return DATA_TYPES.ARRAY_BUFFER;
    case "BigInt":
      return DATA_TYPES.BIGINT;
    case "BigInt64Array":
      return DATA_TYPES.BIGINT64_ARRAY;
    case "BigUint64Array":
      return DATA_TYPES.BIGUINT64_ARRAY;
    case "Blob":
      return DATA_TYPES.BLOB;
    case "Boolean":
      return DATA_TYPES.BOOLEAN;
    case "DataView":
      return DATA_TYPES.DATA_VIEW;
    case "Date":
      return DATA_TYPES.DATE;
    case "Error":
      return DATA_TYPES.ERROR;
    case "File":
      return DATA_TYPES.FILE;
    case "Float32Array":
      return DATA_TYPES.FLOAT32_ARRAY;
    case "Float64Array":
      return DATA_TYPES.FLOAT64_ARRAY;
    case "FormData":
      return DATA_TYPES.FORM_DATA;
    case "Function":
      return DATA_TYPES.FUNCTION;
    case "Int8Array":
      return DATA_TYPES.INT8_ARRAY;
    case "Int16Array":
      return DATA_TYPES.INT16_ARRAY;
    case "Int32Array":
      return DATA_TYPES.INT32_ARRAY;
    case "Map":
      return DATA_TYPES.MAP;
    case "Number":
      return DATA_TYPES.NUMBER;
    case "Object":
      return DATA_TYPES.OBJECT;
    case "Promise":
      return DATA_TYPES.PROMISE;
    case "RegExp":
      return DATA_TYPES.REGEXP;
    case "Set":
      return DATA_TYPES.SET;
    case "SharedArrayBuffer":
      return DATA_TYPES.SHARED_ARRAY_BUFFER;
    case "String":
      return DATA_TYPES.STRING;
    case "Symbol":
      return DATA_TYPES.SYMBOL;
    case "Uint8Array":
      return DATA_TYPES.UINT8_ARRAY;
    case "Uint8ClampedArray":
      return DATA_TYPES.UINT8_CLAMPED_ARRAY;
    case "Uint16Array":
      return DATA_TYPES.UINT16_ARRAY;
    case "Uint32Array":
      return DATA_TYPES.UINT32_ARRAY;
    case "URL":
      return DATA_TYPES.URL;
    case "URLSearchParams":
      return DATA_TYPES.URL_SEARCH_PARAMS;
    case "WeakMap":
      return DATA_TYPES.WEAK_MAP;
    case "WeakSet":
      return DATA_TYPES.WEAK_SET;
    default:
      return brand.toLowerCase();
  }
}

/**
 * Checks whether a string contains valid JSON. Valid scalar JSON is accepted.
 *
 * @param {unknown} value Candidate JSON source text.
 * @returns {value is string} Whether value is a string accepted by JSON.parse, including scalar JSON.
 * @example
 * isJson("false"); // true
 * @since 2.0.0
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
 * @param {unknown} value Candidate ASCII mailbox syntax.
 * @returns {value is string} Whether value satisfies bounded pragmatic syntax only.
 * @example
 * isEmail("person@example.com"); // true
 * @since 2.0.0
 */
export function isEmail(value) {
  if (typeof value !== "string" || value.length < 5 || value.length > 254) return false;
  const separator = value.indexOf("@");
  if (separator < 1 || separator !== value.lastIndexOf("@")) return false;

  const local = value.slice(0, separator);
  const domain = value.slice(separator + 1);
  if (local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  if (!emailLocalPattern.test(local) || domain.length > 253 || !domain.includes(".")) return false;

  const labels = domain.split(".");
  return labels.every(
    (label) =>
      label.length > 0 &&
      label.length <= 63 &&
      !label.startsWith("-") &&
      !label.endsWith("-") &&
      domainLabelPattern.test(label),
  );
}

/**
 * Normalizes a North American phone number into ten digits, or returns null.
 * A leading country code of 1 is accepted.
 *
 * @param {unknown} value String or non-negative safe integer containing NANP digits/punctuation.
 * @returns {string | null} Ten normalized digits, or null for unsupported syntax/ranges.
 * @example
 * normalizeNanpPhone("+1 555 123 4567"); // "5551234567"
 * @since 2.0.0
 */
export function normalizeNanpPhone(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (typeof value === "number" && (!Number.isSafeInteger(value) || value < 0)) return null;
  const input = String(value);
  if (input.length > 64 || !nanpInputPattern.test(input)) return null;
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  return digits.length === 10 ? digits : null;
}

/**
 * Formats a valid North American phone number as `(555) 123-4567`.
 *
 * @param {unknown} value Candidate accepted by normalizeNanpPhone.
 * @returns {string | null} `(555) 123-4567` text, or null when normalization fails.
 * @example
 * formatNanpPhone("555.123.4567"); // "(555) 123-4567"
 * @since 2.0.0
 */
export function formatNanpPhone(value) {
  const digits = normalizeNanpPhone(value);
  return digits ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : null;
}

/**
 * Validates and canonicalizes one portable relative path without touching the
 * filesystem. Output uses `/`, applies an explicit Unicode policy, and rejects
 * absolute/drive paths, traversal, empty segments, controls/bidi overrides,
 * Windows-invalid characters/names, and dot/space segment suffixes.
 *
 * A successful result proves only that the text satisfies this lexical
 * contract. It does not authorize extraction or a filesystem write, follow
 * symlinks, reserve a destination, or protect against time-of-check races.
 *
 * @param {string} value Candidate portable relative path.
 * @param {PortableRelativePathOptions} [options] Path kind, Unicode/separator policy, and work bounds.
 * @returns {string} Canonical forward-slash relative path; directory output ends in `/`.
 * @throws {TypeError} If value, options, policies, or path syntax is invalid.
 * @throws {RangeError} If a length/segment bound is invalid or exceeded.
 * @example
 * normalizePortableRelativePath("reports/2026.json"); // "reports/2026.json"
 * @since 2.0.0
 */
export function normalizePortableRelativePath(value, options = {}) {
  return normalizePortablePathWithPolicy(value, readPortablePathPolicy(options));
}

/**
 * Canonicalizes a bounded path list and rejects exact, Unicode-normalized,
 * optional case-folded, and file/directory-prefix collisions independent of
 * input order. Sparse slots are treated as `undefined` and therefore rejected.
 * Directory entries can contain descendants; a file entry cannot.
 *
 * This remains lexical validation only and does not authorize archive
 * extraction or any filesystem operation.
 *
 * @param {readonly string[]} values Candidate portable relative paths.
 * @param {PortableRelativePathOptions & {maximumPaths?: number, caseSensitive?: boolean}} [options] Per-path policy plus a positive list bound and collision case policy.
 * @returns {ReadonlyArray<string>} Frozen, dense canonical paths in input order.
 * @throws {TypeError} If values, options, case policy, or a path is invalid.
 * @throws {RangeError} If a work bound is invalid/exceeded or paths collide.
 * @example
 * normalizePortableRelativePaths(["assets/", "assets/logo.svg"], { kind: "either" });
 * @since 2.0.0
 */
export function normalizePortableRelativePaths(values, options = {}) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array.");
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
  const { maximumPaths = 10_000, caseSensitive = false } = options;
  if (!Number.isSafeInteger(maximumPaths) || maximumPaths < 1) {
    throw new RangeError("maximumPaths must be a positive safe integer.");
  }
  if (typeof caseSensitive !== "boolean") throw new TypeError("caseSensitive must be a boolean.");
  if (values.length > maximumPaths) throw new RangeError("values exceeded maximumPaths.");

  const policy = readPortablePathPolicy(options);
  const normalized = [...values].map((value) => normalizePortablePathWithPolicy(value, policy));
  const entries = new Map();
  normalized.forEach((path) => {
    const directory = path.endsWith("/");
    const base = directory ? path.slice(0, -1) : path;
    const key = caseSensitive ? base : base.toLowerCase();
    if (entries.has(key)) throw new RangeError(`Portable paths collide after normalization: ${path}`);
    entries.set(key, { directory, path });
  });

  for (const [key] of entries) {
    const segments = key.split("/");
    let prefix = "";
    for (let index = 0; index < segments.length - 1; index += 1) {
      prefix = prefix === "" ? segments[index] : `${prefix}/${segments[index]}`;
      const parent = entries.get(prefix);
      if (parent && !parent.directory) {
        throw new RangeError(`Portable file path conflicts with a descendant: ${parent.path}`);
      }
    }
  }
  return Object.freeze(normalized);
}

/**
 * Validates a value against a useful JSON Schema subset. Supported keywords are
 * `$ref`, `type`, `const`, `enum`, `required`, `properties`, `items`,
 * `additionalProperties`, and `definitions`. Unsupported keywords and malformed
 * schemas throw instead of being silently ignored.
 *
 * @param {unknown} value JSON-compatible candidate to validate without coercion.
 * @param {JsonContract} schema Supported, well-formed local JSON contract schema.
 * @returns {string[]} Deterministic path-prefixed validation errors; empty means valid.
 * @throws {TypeError} If schema uses unsupported/malformed behavior.
 * @example
 * validateJsonContract({ id: 1 }, { type: "object", required: ["id"] }); // []
 * @since 2.0.0
 */
export function validateJsonContract(value, schema) {
  assertSupportedSchema(schema);
  return validateContractNode(value, schema, schema, "$");
}

/**
 * Asserts a value against the supported JSON Schema subset.
 *
 * @template T
 * @param {T} value JSON-compatible candidate returned unchanged on success.
 * @param {JsonContract} schema Supported, well-formed local JSON contract schema.
 * @returns {T} Original value after successful validation.
 * @throws {TypeError} If schema is invalid or value violates one or more contracts.
 * @example
 * const payload = assertJsonContract(input, { type: "object" });
 * @since 2.0.0
 */
export function assertJsonContract(value, schema) {
  const errors = validateJsonContract(value, schema);
  if (errors.length > 0) throw new TypeError(errors.join("\n"));
  return value;
}

/**
 * @param {unknown} value
 * @param {JsonContract} schema
 * @param {JsonContract} root
 * @param {string} path
 * @returns {string[]}
 */
function validateContractNode(value, schema, root, path) {
  const contract = schema.$ref ? resolveReference(root, schema.$ref) : schema;
  if (!contract) return [`${path}: unresolved contract reference`];
  const errors = [];

  if (Object.hasOwn(contract, "const") && !Object.is(value, contract.const))
    errors.push(`${path}: unexpected constant value`);
  if (Array.isArray(contract.enum) && !contract.enum.some((/** @type {unknown} */ entry) => Object.is(entry, value)))
    errors.push(`${path}: unsupported enum value`);
  if (contract.type && !matchesJsonType(value, contract.type)) {
    errors.push(`${path}: expected ${contract.type}`);
    return errors;
  }

  if (contract.type === DATA_TYPES.OBJECT) {
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
      if (Object.hasOwn(objectValue, key))
        errors.push(...validateContractNode(objectValue[key], child, root, `${path}.${key}`));
    }
  }

  if (contract.type === DATA_TYPES.ARRAY && contract.items) {
    const arrayValue = /** @type {unknown[]} */ (value);
    for (let index = 0; index < arrayValue.length; index += 1) {
      errors.push(...validateContractNode(arrayValue[index], contract.items, root, `${path}[${index}]`));
    }
  }
  return errors;
}

/**
 * @param {unknown} options
 * @returns {{kind: PortablePathKind, normalization: PortablePathNormalization, allowBackslash: boolean, maximumLength: number, maximumSegments: number, maximumSegmentLength: number}}
 */
function readPortablePathPolicy(options) {
  if (!isPlainObject(options)) throw new TypeError(plainObjectOptionsErrorMessage);
  const {
    kind = "file",
    normalization = "NFC",
    allowBackslash = false,
    maximumLength = 512,
    maximumSegments = 32,
    maximumSegmentLength = 255,
  } = options;
  if (kind !== "file" && kind !== "directory" && kind !== "either") {
    throw new TypeError(`Unsupported portable path kind: ${kind}`);
  }
  if (normalization !== "NFC" && normalization !== "NFKC" && normalization !== "none") {
    throw new TypeError(`Unsupported portable path normalization: ${normalization}`);
  }
  if (typeof allowBackslash !== "boolean") throw new TypeError("allowBackslash must be a boolean.");
  for (const [name, limit] of [
    ["maximumLength", maximumLength],
    ["maximumSegments", maximumSegments],
    ["maximumSegmentLength", maximumSegmentLength],
  ]) {
    if (typeof limit !== "number" || !Number.isSafeInteger(limit) || limit < 1) {
      throw new RangeError(`${name} must be a positive safe integer.`);
    }
  }
  return {
    kind: /** @type {PortablePathKind} */ (kind),
    normalization: /** @type {PortablePathNormalization} */ (normalization),
    allowBackslash,
    maximumLength: /** @type {number} */ (maximumLength),
    maximumSegments: /** @type {number} */ (maximumSegments),
    maximumSegmentLength: /** @type {number} */ (maximumSegmentLength),
  };
}

/**
 * @param {unknown} value
 * @param {{kind: PortablePathKind, normalization: PortablePathNormalization, allowBackslash: boolean, maximumLength: number, maximumSegments: number, maximumSegmentLength: number}} policy
 */
function normalizePortablePathWithPolicy(value, policy) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError("value must be a non-empty string.");
  }
  if (value.length > policy.maximumLength) throw new RangeError("value exceeded maximumLength.");

  let path = policy.normalization === "none" ? value : value.normalize(policy.normalization);
  if (path.length > policy.maximumLength) throw new RangeError("value exceeded maximumLength after normalization.");
  if (path.includes("\\")) {
    if (!policy.allowBackslash) throw new TypeError("value cannot contain backslash separators.");
    path = path.replaceAll("\\", "/");
  }
  if (path.startsWith("/") || /^[A-Za-z]:/u.test(path)) {
    throw new TypeError("value must be a relative path without a drive prefix.");
  }

  const hadTrailingSlash = path.endsWith("/");
  if (hadTrailingSlash && policy.kind === "file") throw new TypeError("A file path cannot end with '/'.");
  const body = hadTrailingSlash ? path.slice(0, -1) : path;
  if (body === "") throw new TypeError("value must contain at least one path segment.");
  const segments = body.split("/");
  if (segments.length > policy.maximumSegments) throw new RangeError("value exceeded maximumSegments.");

  for (const segment of segments) {
    if (segment === "" || segment === "." || segment === "..") {
      throw new TypeError("value cannot contain empty, current-directory, or parent-directory segments.");
    }
    if (segment.length > policy.maximumSegmentLength) {
      throw new RangeError("value exceeded maximumSegmentLength.");
    }
    if (hasPortablePathControl(segment)) throw new TypeError("value cannot contain control or bidi characters.");
    if (portablePathInvalidCharacters.test(segment)) {
      throw new TypeError("value contains characters that are invalid in portable filenames.");
    }
    if (portableReservedSegment.test(segment) || /[. ]$/u.test(segment)) {
      throw new TypeError("value contains a reserved platform filename segment.");
    }
  }

  const directory = policy.kind === "directory" || (policy.kind === "either" && hadTrailingSlash);
  const normalized = `${segments.join("/")}${directory ? "/" : ""}`;
  if (normalized.length > policy.maximumLength)
    throw new RangeError("value exceeded maximumLength after normalization.");
  return normalized;
}

/** @param {string} value */
function hasPortablePathControl(value) {
  if (portablePathBidiControls.test(value)) return true;
  for (const character of value) {
    const codePoint = /** @type {number} */ (character.codePointAt(0));
    if (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) return true;
  }
  return false;
}

/** @param {JsonContract} root @param {string} reference */
function resolveReference(root, reference) {
  if (typeof reference !== "string" || !reference.startsWith("#/")) {
    throw new TypeError(`Unsupported contract reference: ${String(reference)}`);
  }
  return reference
    .slice(2)
    .split("/")
    .reduce((current, segment) => {
      if (current === null || typeof current !== "object") return undefined;
      const key = segment.replace(/~1/g, "/").replace(/~0/g, "~");
      return Object.hasOwn(current, key) ? current[key] : undefined;
    }, /** @type {any} */ (root));
}

/** @param {unknown} value @param {string | string[]} expected @returns {boolean} */
function matchesJsonType(value, expected) {
  if (Array.isArray(expected)) return expected.some((type) => matchesJsonType(value, type));
  if (expected === DATA_TYPES.ARRAY) return Array.isArray(value);
  if (expected === DATA_TYPES.OBJECT) return isPlainObject(value);
  if (expected === DATA_TYPES.INTEGER)
    return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value);
  if (expected === DATA_TYPES.NUMBER) return isFiniteNumber(value);
  if (expected === DATA_TYPES.NULL) return value === null;
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
    if (
      Object.hasOwn(values, "required") &&
      (!Array.isArray(values.required) || [...values.required].some((key) => typeof key !== "string"))
    )
      throw new TypeError(`${path}.required must be an array of strings.`);
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
