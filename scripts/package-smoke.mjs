import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expectedEntryCount = 533;
const maximumPackedBytes = 400_000;
const maximumUnpackedBytes = 1_500_000;
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const temporaryRoot = await mkdtemp(path.join(tmpdir(), "akashatools-package-"));
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("test:package must be launched through npm.");

try {
  const packed = run(process.execPath, [npmCli, "pack", "--json", "--pack-destination", temporaryRoot], root, true);
  const packResult = JSON.parse(packed.stdout);
  assert.equal(packResult.length, 1);
  const [manifest] = packResult;
  assertPackageManifest(manifest);
  const tarball = path.join(temporaryRoot, manifest.filename);
  await access(tarball);

  const consumer = path.join(temporaryRoot, "consumer");
  await mkdir(consumer);
  await writeFile(
    path.join(consumer, "package.json"),
    `${JSON.stringify(
      {
        name: "akashatools-installed-smoke",
        private: true,
        type: "module",
      },
      null,
      2,
    )}\n`,
  );
  run(process.execPath, [npmCli, "install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], consumer);

  await writeFile(
    path.join(consumer, "smoke.mjs"),
    `
import assert from "node:assert/strict";
import path from "node:path";
import akasha, { chunk, CONTROL_TYPES, DATA_TYPES, INPUT_TYPES, isEmail } from "akashatools";
import { chunk as categoryChunk } from "akashatools/array";
import methodChunk, { chunk as granularChunk } from "akashatools/array/chunk";
import { DATA_TYPES as categoryDataTypes, defaultValueForType, initializeLike } from "akashatools/data";
import granularDataTypes from "akashatools/data/DATA_TYPES";
import { fieldsFromData, inputTypeForValue } from "akashatools/input";
import { debounce, memoize, once, throttle } from "akashatools/function";
import { crc32, sha256Hex } from "akashatools/hash";
import { deepQuery, findAllDeepValues } from "akashatools/object";
import granularHasDeep from "akashatools/object/hasDeep";
import { resolveContainedPath } from "akashatools/node";
import { normalizePortableRelativePath, normalizePortableRelativePaths } from "akashatools/validation";

assert.deepEqual(chunk([1, 2, 3], 2), [[1, 2], [3]]);
assert.equal(categoryChunk, chunk);
assert.equal(methodChunk, chunk);
assert.equal(granularChunk, chunk);
assert.equal(akasha.array.chunk, chunk);
assert.equal(akasha.chunk, chunk);
assert.equal(DATA_TYPES, categoryDataTypes);
assert.equal(DATA_TYPES, granularDataTypes);
assert.equal(akasha.DATA_TYPES, DATA_TYPES);
assert.equal(DATA_TYPES.BOOLEAN, "boolean");
assert.equal(INPUT_TYPES.CHECKBOX, "checkbox");
assert.equal(CONTROL_TYPES.INPUT, "input");
assert.equal(isEmail("person@example.com"), true);
assert.equal(defaultValueForType(Boolean), false);
assert.deepEqual(initializeLike({ title: "Draft" }), { title: "" });
assert.equal(inputTypeForValue(false), "checkbox");
assert.equal(fieldsFromData({ title: "Draft" })[0].name, "title");
assert.equal(deepQuery({ id: 1 }).has("id", { by: "key" }), true);
assert.deepEqual(findAllDeepValues({ one: { id: 1 } }, "id", { by: "key" }), [1]);
assert.equal(granularHasDeep({ id: 1 }, "id", { by: "key" }), true);
assert.equal(crc32("123456789"), 0xcbf43926);
assert.match(await sha256Hex("abc"), /^[a-f0-9]{64}$/u);
const initialize = once(() => ({ ready: true }));
assert.equal(initialize(), initialize());
const cachedLength = memoize((value) => value.length, (value) => value);
assert.equal(cachedLength("Akasha"), 6);
const debouncedLength = debounce((value) => value.length, 100);
const pendingLength = debouncedLength("Akasha");
assert.equal(await debouncedLength.flush(), 6);
assert.equal(await pendingLength, 6);
const throttledLength = throttle((value) => value.length, 100, { trailing: false });
assert.equal(await throttledLength("Akasha"), 6);
assert.equal(throttledLength.cancel(), true);
assert.equal(normalizePortableRelativePath("reports/2026.json"), "reports/2026.json");
assert.deepEqual(
  normalizePortableRelativePaths(["assets/", "assets/logo.svg"], { kind: "either" }),
  ["assets/", "assets/logo.svg"],
);
assert.equal(resolveContainedPath("/srv/data", "report.json"), path.resolve("/srv/data", "report.json"));
`,
  );
  run(process.execPath, ["smoke.mjs"], consumer);

  await writeFile(
    path.join(consumer, "smoke.ts"),
    `
import akasha, { chunk, CONTROL_TYPES, DATA_TYPES, INPUT_TYPES, request } from "akashatools";
import granularChunk from "akashatools/array/chunk";
import { analyzeArrayTypes } from "akashatools/data";
import type { DataType } from "akashatools/data";
import { controlTypeForValue } from "akashatools/input";
import type { ControlType, InputType } from "akashatools/input";
import { deepQuery } from "akashatools/object";
import granularDeepQuery from "akashatools/object/deepQuery";
import { HttpError } from "akashatools/http";
import { crc32, sha256Hex } from "akashatools/hash";
import { debounce, memoize, once, throttle } from "akashatools/function";
import { normalizePortableRelativePath, normalizePortableRelativePaths } from "akashatools/validation";
import type { JsonContract } from "akashatools/validation";

const chunks: number[][] = chunk([1, 2, 3], 2);
const granularChunks: number[][] = granularChunk([1, 2, 3], 2);
const nested: number[][] = akasha.array.chunk([1, 2, 3], 2);
const primaryType: string | undefined = analyzeArrayTypes([1, 2]).primaryType;
const control: string = controlTypeForValue([{ id: 1 }]);
const dataType: DataType = DATA_TYPES.OBJECT;
const inputType: InputType = INPUT_TYPES.TEXT;
const controlType: ControlType = CONTROL_TYPES.INPUT;
const hasId: boolean = deepQuery({ id: 1 }).has("id", { by: "key" });
const granularHasId: boolean = granularDeepQuery({ id: 1 }).has("id", { by: "key" });
const response: Promise<{ ok: boolean }> = request<{ ok: boolean }>("https://example.com");
const contract: JsonContract = { type: "object", properties: { ok: { type: "boolean" } } };
const code: HttpError["code"] = "TIMEOUT";
const checksum: number = crc32("content");
const digest: Promise<string> = sha256Hex("content");
const archivePath: string = normalizePortableRelativePath("reports/2026.json");
const archivePaths: ReadonlyArray<string> = normalizePortableRelativePaths(["assets/", "assets/logo.svg"], { kind: "either" });
const initialize: () => { ready: boolean } = once(() => ({ ready: true }));
const cachedLength = memoize((value: string) => value.length, (value: string) => value);
const length: number = cachedLength("Akasha");
const debouncedLength = debounce((value: string) => value.length, 25);
const pendingLength: Promise<number> = debouncedLength("Akasha");
const throttledLength = throttle((value: string) => value.length, 25, { trailing: false });
const throttledPending: Promise<number> = throttledLength("Akasha");
void [chunks, granularChunks, nested, primaryType, control, dataType, inputType, controlType, hasId, granularHasId, response, contract, code, checksum, digest, archivePath, archivePaths, initialize, cachedLength, length, debouncedLength, pendingLength, throttledLength, throttledPending];
`,
  );
  await writeFile(
    path.join(consumer, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          noEmit: true,
          target: "ES2023",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          lib: ["ES2023", "DOM"],
        },
        include: ["smoke.ts"],
      },
      null,
      2,
    )}\n`,
  );
  run(process.execPath, [path.join(root, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.json"], consumer);

  const installedPackage = JSON.parse(
    await readFile(path.join(consumer, "node_modules", "akashatools", "package.json"), "utf8"),
  );
  assert.equal(installedPackage.dependencies, undefined);
  await Promise.all([
    access(path.join(consumer, "node_modules", "akashatools", "types", "index.d.ts")),
    access(path.join(consumer, "node_modules", "akashatools", "src", "index.js")),
  ]);
  console.log(
    `Exact ${manifest.entryCount}-file artifact safety and fresh installed-tarball JavaScript/TypeScript smoke tests passed.`,
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

function run(command, args, cwd, capture = false) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
  });
  if (result.status !== 0) {
    if (capture) process.stderr.write(result.stderr ?? "");
    throw new Error(`${command} ${args.join(" ")} failed with status ${result.status}.`);
  }
  return result;
}

function assertPackageManifest(manifest) {
  assert.equal(
    manifest.entryCount,
    expectedEntryCount,
    "packed file count changed without an intentional baseline update",
  );
  assert.equal(manifest.files.length, manifest.entryCount, "npm file manifest count is inconsistent");
  assert.deepEqual(manifest.bundled, [], "runtime dependencies must not be bundled");
  assert(manifest.size <= maximumPackedBytes, `packed artifact exceeds ${maximumPackedBytes} bytes`);
  assert(manifest.unpackedSize <= maximumUnpackedBytes, `unpacked artifact exceeds ${maximumUnpackedBytes} bytes`);

  const allowedRoots = new Set(["package.json", ...packageJson.files]);
  const forbiddenSegments = new Set([
    ".git",
    "coverage",
    "fixtures",
    "node_modules",
    "playwright-report",
    "scripts",
    "test",
    "test-results",
    "tests",
  ]);
  let unpackedSize = 0;

  for (const file of manifest.files) {
    assert.equal(typeof file.path, "string");
    assert.equal(path.posix.normalize(file.path), file.path, `non-portable artifact path: ${file.path}`);
    assert.equal(path.posix.isAbsolute(file.path), false, `absolute artifact path: ${file.path}`);
    const segments = file.path.split("/");
    assert(allowedRoots.has(segments[0]), `unexpected artifact root: ${file.path}`);
    for (const segment of segments) {
      const normalized = segment.toLocaleLowerCase("en-US");
      assert(!segment.startsWith("."), `hidden artifact path: ${file.path}`);
      assert(!forbiddenSegments.has(normalized), `development-only artifact path: ${file.path}`);
    }
    assert(!/\.(?:jks|key|keystore|p12|pfx|pem)$/iu.test(file.path), `credential-like artifact path: ${file.path}`);
    assert(
      !/(?:^|\/)(?:credentials?|id_ed25519|id_rsa|secrets?)(?:\.|$)/iu.test(file.path),
      `credential-like artifact path: ${file.path}`,
    );
    assert(Number.isSafeInteger(file.size) && file.size >= 0, `invalid artifact size: ${file.path}`);
    assert(Number.isSafeInteger(file.mode), `invalid artifact mode: ${file.path}`);
    assert.equal(file.mode & 0o111, 0, `unexpected executable artifact: ${file.path}`);
    unpackedSize += file.size;
  }

  assert.equal(unpackedSize, manifest.unpackedSize, "npm unpacked-size total is inconsistent");
}
