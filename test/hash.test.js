import assert from "node:assert/strict";
import test from "node:test";

import { crc32, sha256Hex, sha256Json, stableJsonId } from "akashatools/hash";

test("sha256Hex uses native Web Crypto for text and exact binary view ranges", async () => {
  assert.equal(await sha256Hex(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  assert.equal(await sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");

  const surrounding = Uint8Array.from([0, 97, 98, 99, 0]);
  assert.equal(await sha256Hex(surrounding.subarray(1, 4)), await sha256Hex("abc"));
  assert.notEqual(await sha256Hex(surrounding.buffer), await sha256Hex("abc"));
});

test("sha256Hex snapshots mutable input before asynchronous settlement", async () => {
  const bytes = new TextEncoder().encode("abc");
  const pending = sha256Hex(bytes);
  bytes.fill(0);
  assert.equal(await pending, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("crc32 implements the standard ZIP-compatible unsigned checksum", () => {
  assert.equal(crc32("123456789"), 0xcbf4_3926);
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf4_3926);
  assert.equal(crc32(""), 0);
  assert.equal(crc32("123456789"), crc32("123456789"));
});

test("JSON digests and IDs compose the strict stable JSON contract", async () => {
  const first = await sha256Json({ z: 1, nested: { b: false, a: null } });
  const second = await sha256Json({ nested: { a: null, b: false }, z: 1 });
  assert.equal(first, second);
  assert.match(first, /^sha256:[a-f0-9]{64}$/u);
  assert.notEqual(first, await sha256Json({ z: 2, nested: { b: false, a: null } }));

  const id = await stableJsonId("profile", { tenant: "local", revision: 1 });
  assert.match(id, /^profile_[a-f0-9]{24}$/u);
  assert.equal(id, await stableJsonId("profile", { revision: 1, tenant: "local" }));
  assert.match(await stableJsonId("profile", { tenant: "local" }, { hashLength: 64 }), /^profile_[a-f0-9]{64}$/u);
});

test("hash utilities reject ambiguous inputs, excessive work, and invalid crypto", async () => {
  await assert.rejects(sha256Hex(/** @type {any} */ (123)), TypeError);
  await assert.rejects(sha256Hex("abc", /** @type {any} */ ([])), TypeError);
  await assert.rejects(sha256Hex("abc", { maximumBytes: 2 }), RangeError);
  await assert.rejects(sha256Hex("abc", { maximumBytes: 0 }), RangeError);
  await assert.rejects(sha256Hex("abc", { crypto: /** @type {any} */ ({}) }), TypeError);
  await assert.rejects(
    sha256Hex("abc", {
      crypto: /** @type {any} */ ({ subtle: { digest: async () => new ArrayBuffer(1) } }),
    }),
    TypeError,
  );
  assert.throws(() => crc32("abc", /** @type {any} */ (null)), TypeError);
  assert.throws(() => crc32(new Uint8Array(3), { maximumBytes: 2 }), RangeError);
  await assert.rejects(sha256Json({ invalid: undefined }), TypeError);
  await assert.rejects(stableJsonId("invalid prefix", {}), TypeError);
  await assert.rejects(stableJsonId("profile", {}, /** @type {any} */ ([])), TypeError);
  await assert.rejects(stableJsonId("profile", {}, { hashLength: 7 }), RangeError);
  await assert.rejects(stableJsonId("profile", {}, { hashLength: 65 }), RangeError);
});
