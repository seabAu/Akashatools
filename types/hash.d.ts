export type HashInput = string | ArrayBuffer | ArrayBufferView;
export type Sha256Options = {
    /**
     * Positive safe-integer input byte bound.
     */
    maximumBytes?: number;
    /**
     * Web Crypto implementation used for the native digest.
     */
    crypto?: Crypto;
};
export type JsonHashOptions = Sha256Options & {
    maximumDepth?: number;
    maximumNodes?: number;
    maximumLength?: number;
};
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
export declare function sha256Hex(value: HashInput, options?: Sha256Options): Promise<string>;
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
export declare function crc32(value: HashInput, options?: {
    maximumBytes?: number;
}): number;
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
export declare function sha256Json(value: unknown, options?: JsonHashOptions): Promise<string>;
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
export declare function stableJsonId(prefix: string, value: unknown, options?: JsonHashOptions & {
    hashLength?: number;
}): Promise<string>;
