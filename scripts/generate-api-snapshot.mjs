import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
const surfaces = {};

for (const subpath of Object.keys(packageJson.exports)) {
  if (subpath.includes("*") || subpath === "./package.json" || subpath.startsWith("./lib")) continue;
  const specifier = subpath === "." ? packageJson.name : `${packageJson.name}/${subpath.slice(2)}`;
  surfaces[subpath] = Object.keys(await import(specifier)).sort();
}

const output = `${JSON.stringify({ schemaVersion: 1, packageVersion: packageJson.version, surfaces }, null, 2)}\n`;
const outputUrl = new URL("test/api-surface.snapshot.json", root);

if (process.argv.includes("--check")) {
  if ((await readFile(outputUrl, "utf8").catch(() => "")) !== output) {
    console.error("API surface snapshot is stale; run npm run api:snapshot.");
    process.exitCode = 1;
  } else {
    console.log(`API surface snapshot is current (${Object.keys(surfaces).length} surfaces).`);
  }
} else {
  await writeFile(outputUrl, output);
  console.log(`Generated API snapshot for ${Object.keys(surfaces).length} surfaces.`);
}
