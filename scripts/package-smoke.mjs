import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporaryRoot = await mkdtemp(path.join(tmpdir(), "akashatools-package-"));
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("test:package must be launched through npm.");

try {
  const packed = run(process.execPath, [npmCli, "pack", "--json", "--pack-destination", temporaryRoot], root, true);
  const packResult = JSON.parse(packed.stdout);
  assert.equal(packResult.length, 1);
  const tarball = path.join(temporaryRoot, packResult[0].filename);
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
import akasha, { chunk, isEmail } from "akashatools";
import { chunk as categoryChunk } from "akashatools/array";
import { defaultValueForType, initializeLike } from "akashatools/data";
import { resolveContainedPath } from "akashatools/node";

assert.deepEqual(chunk([1, 2, 3], 2), [[1, 2], [3]]);
assert.equal(categoryChunk, chunk);
assert.equal(akasha.array.chunk, chunk);
assert.equal(akasha.chunk, chunk);
assert.equal(isEmail("person@example.com"), true);
assert.equal(defaultValueForType(Boolean), false);
assert.deepEqual(initializeLike({ title: "Draft" }), { title: "" });
assert.equal(resolveContainedPath("/srv/data", "report.json"), path.resolve("/srv/data", "report.json"));
`,
  );
  run(process.execPath, ["smoke.mjs"], consumer);

  await writeFile(
    path.join(consumer, "smoke.ts"),
    `
import akasha, { chunk, request } from "akashatools";
import { analyzeArrayTypes } from "akashatools/data";
import { HttpError } from "akashatools/http";
import type { JsonContract } from "akashatools/validation";

const chunks: number[][] = chunk([1, 2, 3], 2);
const nested: number[][] = akasha.array.chunk([1, 2, 3], 2);
const primaryType: string | undefined = analyzeArrayTypes([1, 2]).primaryType;
const response: Promise<{ ok: boolean }> = request<{ ok: boolean }>("https://example.com");
const contract: JsonContract = { type: "object", properties: { ok: { type: "boolean" } } };
const code: HttpError["code"] = "TIMEOUT";
void [chunks, nested, primaryType, response, contract, code];
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
  console.log("Fresh installed-tarball JavaScript and TypeScript smoke tests passed.");
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
