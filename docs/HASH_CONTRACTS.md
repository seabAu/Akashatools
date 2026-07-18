# Hashing and checksum contracts

The universal `akashatools/hash` category keeps four related but materially
different operations separate:

| Function | Result | Intended use |
| --- | --- | --- |
| `sha256Hex` | 64-character lowercase hexadecimal SHA-256 | Cryptographic content digest. |
| `crc32` | Unsigned 32-bit CRC-32/ISO-HDLC number | Fast accidental-corruption checks and format fields such as ZIP. |
| `sha256Json` | `sha256:` plus a stable-JSON digest | Deterministic strict-JSON comparison and manifests. |
| `stableJsonId` | Caller prefix plus a truncated stable-JSON digest | Compact reproducible local keys with an explicit collision policy. |

`sha256Hex` delegates to native Web Crypto `SubtleCrypto.digest("SHA-256", ...)`
rather than maintaining a handwritten cryptographic implementation. Node 22's
Web Crypto implementation and the browser standard both accept BufferSource
input and return a Promise for an ArrayBuffer digest. See the
[Web Cryptography specification](https://www.w3.org/TR/WebCryptoAPI/) and
[Node 22 Web Crypto documentation](https://nodejs.org/download/release/v22.18.0/docs/api/webcrypto.html#subtledigestalgorithm-data).

Strings use UTF-8. ArrayBuffer views hash only `byteOffset` through
`byteOffset + byteLength`, and bytes are copied before asynchronous work so a
caller cannot race the digest by mutating its view. Every operation has an
explicit positive byte limit. SHA-256 failures from the runtime propagate.

## JSON composition

`sha256Json` and `stableJsonId` call `string.stableJson`; they do not define a
second canonicalizer. Object keys therefore use Unicode code-unit ordering and
the existing strict JSON rules reject accessors, enumerable symbols, sparse
arrays, cycles, non-finite numbers, and unsupported values. Depth, node, output
length, encoded byte, and crypto limits remain caller-configurable.

`stableJsonId` truncates hexadecimal SHA-256 to 24 characters by default. The
length can be selected from 8 through 64, but truncation necessarily changes
collision probability. The helper does not create a secret, random,
unguessable, globally unique, or authenticated identifier. Applications must
select a domain prefix, length, and collision response appropriate to their
records.

## Security boundary

CRC-32 is deliberately named and documented as a checksum. It is not
collision-resistant and cannot authenticate content. SHA-256 establishes only
that equal bytes produce an equal digest; it does not prove origin, freshness,
authorization, or trust. Password hashing, keyed MACs, signatures, streaming
Node hashes, archive manifests, and trust/key policy remain outside this small
portable category.
