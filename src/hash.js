import { isPlainObject } from "./object.js";
import { stableJson, utf8ByteLength } from "./string.js";

/** @typedef {string | ArrayBuffer | ArrayBufferView} HashInput */
/**
 * @typedef {object} Sha256Options
 * @property {number} [maximumBytes=10000000] Positive safe-integer input byte bound.
 * @property {Crypto} [crypto=globalThis.crypto] Web Crypto implementation used for the native digest.
 */
/**
 * @typedef {Sha256Options & {maximumDepth?: number, maximumNodes?: number, maximumLength?: number}} JsonHashOptions
 */

/** @type {Uint32Array | undefined} */
let crcTable;

/**
 * Computes a lowercase SHA-256 digest with the runtime's native Web Crypto
 * implementation. Strings are encoded as UTF-8; binary views hash only their
 * visible byte range. Input bytes are copied before the asynchronous digest so
 * later caller mutation cannot change the result.
 *
 * This is a cryptographic digest primitive, not a password hash, MAC,
 * signature, encryption operation, or proof that content is trustworthy.
 *
 * @param {HashInput} value UTF-8 text or binary bytes to hash.
 * @param {Sha256Options} [options] Input byte bound and injectable Web Crypto implementation.
 * @returns {Promise<string>} Promise for exactly 64 lowercase hexadecimal characters.
 * @throws {TypeError} If value, options, or crypto does not satisfy the literal contract.
 * @throws {RangeError} If maximumBytes is invalid or the encoded input exceeds it.
 * @example
 * await sha256Hex("hello");
 * @since 2.0.0
 */
export async function sha256Hex(value, options = {}) {
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const { maximumBytes = 10_000_000, crypto = globalThis.crypto } = options;
  assertMaximumBytes(maximumBytes);
  if (!crypto || typeof crypto !== "object" || typeof crypto.subtle?.digest !== "function") {
    throw new TypeError("crypto must provide SubtleCrypto.digest.");
  }

  const bytes = copyHashBytes(value, maximumBytes);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  if (digest.byteLength !== 32) throw new TypeError("crypto returned an invalid SHA-256 digest length.");
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Computes the standard unsigned CRC-32/ISO-HDLC checksum used by ZIP and many
 * file formats. Strings are encoded as UTF-8 and binary views use only their
 * visible byte range. CRC-32 detects accidental corruption efficiently but is
 * not collision resistant and must not be used as a security digest.
 *
 * @param {HashInput} value UTF-8 text or binary bytes to checksum.
 * @param {{maximumBytes?: number}} [options] Positive safe-integer input byte bound.
 * @returns {number} Unsigned 32-bit checksum in the range 0 through 4294967295.
 * @throws {TypeError} If value or options does not satisfy the literal contract.
 * @throws {RangeError} If maximumBytes is invalid or the encoded input exceeds it.
 * @example
 * crc32("123456789"); // 3421780262
 * @since 2.0.0
 */
export function crc32(value, options = {}) {
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const { maximumBytes = 10_000_000 } = options;
  assertMaximumBytes(maximumBytes);
  const bytes = copyHashBytes(value, maximumBytes);
  const table = getCrcTable();
  let checksum = 0xffff_ffff;
  for (const byte of bytes) checksum = table[(checksum ^ byte) & 0xff] ^ (checksum >>> 8);
  return (checksum ^ 0xffff_ffff) >>> 0;
}

/**
 * Produces a prefixed SHA-256 digest of strict deterministic JSON. It composes
 * `stableJson` rather than inventing another normalizer, so active properties,
 * unsupported values, sparse arrays, non-finite numbers, and cycles retain the
 * canonical JSON rejection contract.
 *
 * @param {unknown} value Strict plain JSON value to serialize and hash.
 * @param {JsonHashOptions} [options] Stable-JSON work limits, encoded byte bound, and Web Crypto implementation.
 * @returns {Promise<string>} Promise for `sha256:` followed by 64 lowercase hexadecimal characters.
 * @throws {TypeError} If value, options, crypto, or JSON shape is unsupported.
 * @throws {RangeError} If a serialization or byte work bound is invalid or exceeded.
 * @example
 * await sha256Json({ id: 1 }); // "sha256:..."
 * @since 2.0.0
 */
export async function sha256Json(value, options = {}) {
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const {
    maximumDepth = 100,
    maximumNodes = 10_000,
    maximumLength = 1_000_000,
    maximumBytes = 10_000_000,
    crypto = globalThis.crypto,
  } = options;
  const json = stableJson(value, { maximumDepth, maximumNodes, maximumLength });
  return `sha256:${await sha256Hex(json, { maximumBytes, crypto })}`;
}

/**
 * Creates a deterministic, readable identifier from strict JSON and a
 * caller-owned prefix. The identifier truncates SHA-256 for compactness; it is
 * suitable for reproducible local keys, not secrets, unguessable IDs, digital
 * signatures, or global uniqueness without a domain-specific collision plan.
 *
 * @param {string} prefix ASCII identifier prefix, 1 to 64 characters, beginning with a letter.
 * @param {unknown} value Strict plain JSON value whose canonical digest supplies the suffix.
 * @param {JsonHashOptions & {hashLength?: number}} [options] JSON/hash work limits plus a hexadecimal suffix length from 8 through 64.
 * @returns {Promise<string>} Promise for `${prefix}_${hexadecimalSuffix}`.
 * @throws {TypeError} If prefix, value, options, crypto, or JSON shape is unsupported.
 * @throws {RangeError} If hashLength or a work bound is invalid or exceeded.
 * @example
 * await stableJsonId("profile", { tenant: "local", revision: 1 });
 * @since 2.0.0
 */
export async function stableJsonId(prefix, value, options = {}) {
  if (typeof prefix !== "string" || !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/u.test(prefix)) {
    throw new TypeError("prefix must be a 1-to-64-character ASCII identifier beginning with a letter.");
  }
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const { hashLength = 24, ...hashOptions } = options;
  if (!Number.isSafeInteger(hashLength) || hashLength < 8 || hashLength > 64) {
    throw new RangeError("hashLength must be a safe integer from 8 through 64.");
  }
  const digest = await sha256Json(value, hashOptions);
  return `${prefix}_${digest.slice(7, 7 + hashLength)}`;
}

/** @param {unknown} value */
function assertMaximumBytes(value) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    throw new RangeError("maximumBytes must be a positive safe integer.");
  }
}

/** @param {HashInput} value @param {number} maximumBytes */
function copyHashBytes(value, maximumBytes) {
  if (typeof value === "string") {
    if (utf8ByteLength(value) > maximumBytes) throw new RangeError("value exceeded maximumBytes.");
    return new TextEncoder().encode(value);
  }

  let bytes;
  if (value instanceof ArrayBuffer) bytes = new Uint8Array(value);
  else if (ArrayBuffer.isView(value)) bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  else throw new TypeError("value must be a string, ArrayBuffer, or ArrayBuffer view.");
  if (bytes.byteLength > maximumBytes) throw new RangeError("value exceeded maximumBytes.");
  return bytes.slice();
}

function getCrcTable() {
  return (crcTable ??= Uint32Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb8_8320 ^ (value >>> 1) : value >>> 1;
    return value >>> 0;
  }));
}
