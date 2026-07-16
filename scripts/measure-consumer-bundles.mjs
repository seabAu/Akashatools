import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

import { build, version } from "esbuild";

const consumers = [
  {
    name: "Mindspace universal",
    functions: [
      "chunk",
      "groupBy",
      "moveItem",
      "unique",
      "formatDuration",
      "formatRelativeTime",
      "secureRandomUuid",
      "cloneJson",
      "deepMerge",
      "pick",
    ],
  },
  {
    name: "portfolio",
    functions: ["createSingleFlight", "createKeyedSingleFlight", "parseContentDispositionFilename", "formatBytes"],
  },
  {
    name: "COMPOSR",
    functions: [
      "fulfilledValues",
      "mapSettledWithConcurrency",
      "excludeIds",
      "upsertById",
      "summarizeNumbers",
      "slugify",
      "stableJson",
    ],
  },
  {
    name: "SPLICR",
    functions: ["countWords", "splitTextByLimits", "utf8ByteLength"],
  },
];

const resolveDir = fileURLToPath(new URL("..", import.meta.url));
const measurements = [];
for (const consumer of consumers) {
  const focused = `import { ${consumer.functions.join(", ")} } from "akashatools";\nexport const selected = [${consumer.functions.join(", ")}];`;
  const defaultNamespace = `import akasha from "akashatools";\nexport const selected = [${consumer.functions.map((name) => `akasha.${name}`).join(", ")}];`;
  const [focusedResult, defaultResult] = await Promise.all([
    measure(`${consumer.name}-focused.js`, focused),
    measure(`${consumer.name}-default.js`, defaultNamespace),
  ]);
  if (focusedResult.bytes >= defaultResult.bytes || focusedResult.gzip >= defaultResult.gzip) {
    throw new Error(`${consumer.name} focused imports no longer reduce both raw and gzip bundle size.`);
  }
  measurements.push({
    consumer: consumer.name,
    functions: consumer.functions.length,
    focusedBytes: focusedResult.bytes,
    focusedGzip: focusedResult.gzip,
    defaultBytes: defaultResult.bytes,
    defaultGzip: defaultResult.gzip,
    rawSaved: defaultResult.bytes - focusedResult.bytes,
    gzipSaved: defaultResult.gzip - focusedResult.gzip,
  });
}

console.log(`Consumer import comparison; esbuild ${version}; minified ESM targeting ES2022`);
console.table(measurements);
console.log("Every representative focused import set reduces raw and gzip output versus the default namespace.");

async function measure(sourcefile, contents) {
  const result = await build({
    bundle: true,
    format: "esm",
    logLevel: "silent",
    minify: true,
    platform: "browser",
    stdin: { contents, resolveDir, sourcefile },
    target: "es2022",
    treeShaking: true,
    write: false,
  });
  const [output] = result.outputFiles;
  if (!output || result.outputFiles.length !== 1) {
    throw new Error(`esbuild produced an unexpected output set for ${sourcefile}.`);
  }
  return { bytes: output.contents.byteLength, gzip: gzipSync(output.contents).byteLength };
}
