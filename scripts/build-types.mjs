import { readdir, readFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const committedDirectory = path.join(root, "types");
const outputDirectory = checkOnly ? path.join(root, ".declaration-check") : committedDirectory;
const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");

await rm(outputDirectory, { recursive: true, force: true });
const result = spawnSync(process.execPath, [tsc, "-p", "tsconfig.types.json", "--outDir", outputDirectory], {
  cwd: root,
  stdio: "inherit",
});
if (result.status !== 0) process.exit(result.status ?? 1);

if (!checkOnly) {
  console.log("Generated declarations in types/.");
  process.exit(0);
}

try {
  const expectedFiles = await filesWithin(committedDirectory);
  const actualFiles = await filesWithin(outputDirectory);
  const namesMatch = JSON.stringify(expectedFiles) === JSON.stringify(actualFiles);
  let contentMatches = namesMatch;
  if (namesMatch) {
    for (const filename of expectedFiles) {
      const [expected, actual] = await Promise.all([
        readFile(path.join(committedDirectory, filename)),
        readFile(path.join(outputDirectory, filename)),
      ]);
      if (!expected.equals(actual)) {
        contentMatches = false;
        break;
      }
    }
  }
  if (!contentMatches) {
    console.error("Generated declarations are stale; run npm run types:build.");
    process.exitCode = 1;
  } else {
    console.log(`Generated declarations are current (${expectedFiles.length} files).`);
  }
} finally {
  await rm(outputDirectory, { recursive: true, force: true });
}

async function filesWithin(directory, relative = "") {
  const entries = await readdir(path.join(directory, relative), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await filesWithin(directory, child));
    else files.push(child.replaceAll(path.sep, "/"));
  }
  return files.sort();
}
