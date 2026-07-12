import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { build, version } from "esbuild";

const fixtures = [
  { name: "named root", filename: "named-root.js", maximumBytes: 400, maximumGzip: 300 },
  { name: "category", filename: "category.js", maximumBytes: 400, maximumGzip: 300 },
  { name: "category namespace", filename: "category-namespace.js", maximumBytes: 400, maximumGzip: 300 },
  { name: "default flat", filename: "default-flat.js", maximumBytes: 45_000, maximumGzip: 15_000 },
  { name: "default category", filename: "default-category.js", maximumBytes: 45_000, maximumGzip: 15_000 },
  { name: "per-method simulation", filename: "per-method-simulation.js", maximumBytes: 400, maximumGzip: 300 },
  { name: "side-effect only", filename: "side-effect-only.js", maximumBytes: 0, maximumGzip: 20 },
];

const measurements = [];
for (const fixture of fixtures) {
  const { name, filename } = fixture;
  const result = await build({
    bundle: true,
    entryPoints: [fileURLToPath(new URL(`../fixtures/bundles/${filename}`, import.meta.url))],
    format: "esm",
    logLevel: "silent",
    minify: true,
    platform: "browser",
    target: "es2022",
    treeShaking: true,
    write: false,
  });
  const [output] = result.outputFiles;
  if (!output || result.outputFiles.length !== 1) throw new Error(`esbuild produced an unexpected output set for ${name}.`);
  measurements.push({
    name,
    bytes: output.contents.byteLength,
    gzip: gzipSync(output.contents).byteLength,
    maximumBytes: fixture.maximumBytes,
    maximumGzip: fixture.maximumGzip,
  });
}

console.log(`esbuild ${version}; minified ESM targeting ES2022`);
console.table(measurements);

const focusedNames = ["named root", "category", "category namespace", "per-method simulation"];
const focused = measurements.filter(({ name }) => focusedNames.includes(name));
if (new Set(focused.map(({ bytes, gzip }) => `${bytes}/${gzip}`)).size !== 1) {
  throw new Error("Focused and simulated per-method fixtures no longer produce identical bundles.");
}

const overBudget = measurements.filter(({ bytes, gzip, maximumBytes, maximumGzip }) => (
  bytes > maximumBytes || gzip > maximumGzip
));
if (overBudget.length > 0) {
  throw new Error(`Bundle budget exceeded: ${overBudget.map(({ name }) => name).join(", ")}.`);
}

console.log("Bundle equivalence, size budgets, and side-effect elimination passed.");
