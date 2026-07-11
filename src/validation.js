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
 * `$ref`, `type`, `const`, `enum`, `required`, `properties`, `items`, and
 * `additionalProperties: false`.
 *
 * @param {unknown} value
 * @param {Record<string, any>} schema
 * @returns {string[]}
 */
export function validateJsonContract(value, schema) {
  if (schema === null || typeof schema !== "object") throw new TypeError("schema must be an object.");
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
  if (Array.isArray(contract.enum) && !contract.enum.some((entry) => Object.is(entry, value))) errors.push(`${path}: unsupported enum value`);
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
    arrayValue.forEach((item, index) => errors.push(...validateContractNode(item, contract.items, root, `${path}[${index}]`)));
  }
  return errors;
}

/** @param {Record<string, any>} root @param {string} reference */
function resolveReference(root, reference) {
  if (typeof reference !== "string" || !reference.startsWith("#/")) {
    throw new TypeError(`Unsupported contract reference: ${String(reference)}`);
  }
  return reference.slice(2).split("/").reduce((current, segment) => current?.[segment.replace(/~1/g, "/").replace(/~0/g, "~")], root);
}

/** @param {unknown} value @param {string | string[]} expected @returns {boolean} */
function matchesJsonType(value, expected) {
  if (Array.isArray(expected)) return expected.some((type) => matchesJsonType(value, type));
  if (expected === "array") return Array.isArray(value);
  if (expected === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (expected === "integer") return Number.isInteger(value);
  if (expected === "null") return value === null;
  return typeof value === expected;
}
