import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const directories = ["benchmark", "browser-test", "fixtures", "lib", "scripts", "src", "test"];
const files = [new URL("playwright.config.js", root)];

for (const directory of directories) {
  await collectJavaScriptFiles(new URL(`${directory}/`, root), files);
}

files.sort((left, right) => left.href.localeCompare(right.href));
for (const file of files) {
  const path = fileURLToPath(file);
  const result = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
  if (result.status !== 0) {
    const diagnostic =
      result.stderr || result.stdout || result.error?.stack || result.error?.message || "Unknown syntax-check failure.";
    process.stderr.write(`${diagnostic}\n`);
    process.exit(result.status ?? 1);
  }
}

console.log(`Syntax check passed for ${files.length} JavaScript files.`);

async function collectJavaScriptFiles(directory, output) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const url = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      await collectJavaScriptFiles(new URL(`${entry.name}/`, directory), output);
    } else if (entry.isFile() && /\.(?:cjs|js|mjs)$/.test(entry.name)) {
      output.push(url);
    }
  }
}
