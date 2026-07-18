import { readFile, writeFile } from "node:fs/promises";

const categories = [
  "array",
  "async",
  "browser",
  "collection",
  "data",
  "date",
  "http",
  "hash",
  "input",
  "number",
  "object",
  "random",
  "sort",
  "string",
  "validation",
  "node",
];
const expectedModules = new Map([
  ["AO.js", 49],
  ["Val.js", 30],
  ["Time.js", 14],
  ["String.js", 6],
  ["Math.js", 9],
  ["Rand.js", 2],
  ["Http.js", 6],
  ["File.js", 2],
  ["Debug.js", 1],
]);
const inventory = await readFile(new URL("../docs/UTILITY_INVENTORY.md", import.meta.url), "utf8");
const canonical = new Map();

for (const category of categories) {
  const source = await readFile(new URL(`../src/${category}.js`, import.meta.url), "utf8");
  for (const match of source.matchAll(/^export\s+(?:async\s+)?(?:class|function|const)\s+([A-Za-z_$][\w$]*)/gm)) {
    canonical.set(match[1], {
      name: match[1],
      category,
      runtime: category === "node" ? "node" : category === "browser" ? "browser-effect" : "universal",
      mutation: mutation(category, match[1]),
      importPath: `akashatools/${category}/${match[1]}`,
    });
  }
}

const legacyEntries = [];
for (const [moduleName, expectedCount] of expectedModules) {
  const heading = `## Akashatools 1.0.2 — \`lib/${moduleName}\``;
  const start = inventory.indexOf(heading);
  const end = inventory.indexOf("\n## ", start + heading.length);
  if (start < 0) throw new Error(`Missing inventory section for ${moduleName}.`);
  const section = inventory.slice(start, end < 0 ? inventory.length : end);
  const rows = [...section.matchAll(/^\| `([^`]+)` \| (.*?) \| (.*?) \| (.*?) \|$/gm)];
  if (rows.length !== expectedCount) {
    throw new Error(`${moduleName} inventory has ${rows.length} rows; expected ${expectedCount}.`);
  }
  for (const [, legacyName, behavior, decision, evidence] of rows) {
    const canonicalReferences = [];
    const definiteReplacement = /^(Adopted|Replace(?:d)? with)/.test(decision);
    for (const code of decision.matchAll(/`([^`]+)`/g)) {
      const token = code[1];
      const reference = token.split("(")[0];
      const name = reference.includes(".") ? reference.slice(reference.lastIndexOf(".") + 1) : reference;
      const target = canonical.get(name);
      if (target && !canonicalReferences.some((entry) => entry.name === name)) {
        canonicalReferences.push({ ...target, relation: definiteReplacement ? "replacement" : "related" });
      }
    }
    legacyEntries.push({ module: moduleName, name: legacyName, canonicalReferences, decision, behavior, evidence });
  }
}

if (legacyEntries.length !== 119) throw new Error(`Expected 119 legacy exports; found ${legacyEntries.length}.`);

const manifest = `${JSON.stringify(
  {
    schemaVersion: 1,
    sourcePackageVersion: "1.0.2",
    entryCount: legacyEntries.length,
    entries: legacyEntries,
  },
  null,
  2,
)}\n`;
const index = renderIndex([...canonical.values()], legacyEntries);
const outputs = [
  [new URL("../docs/LEGACY_MANIFEST.json", import.meta.url), manifest],
  [new URL("../docs/FUNCTION_INDEX.md", import.meta.url), index],
];

if (process.argv.includes("--check")) {
  let stale = false;
  for (const [url, content] of outputs) {
    if ((await readFile(url, "utf8").catch(() => "")) !== content) {
      console.error(`${url.pathname.split("/").at(-1)} is stale; run npm run docs:migration.`);
      stale = true;
    }
  }
  if (stale) process.exitCode = 1;
  else console.log("Generated migration manifest and function index are current.");
} else {
  await Promise.all(outputs.map(([url, content]) => writeFile(url, content)));
  console.log(`Generated migration data for ${canonical.size} canonical and ${legacyEntries.length} legacy exports.`);
}

function renderIndex(canonicalEntries, entries) {
  const legacyByCanonical = new Map();
  for (const entry of entries) {
    for (const reference of entry.canonicalReferences) {
      const names = legacyByCanonical.get(reference.name) ?? [];
      names.push(`${entry.module.replace(".js", "")}.${entry.name}`);
      legacyByCanonical.set(reference.name, names);
    }
  }
  const canonicalRows = canonicalEntries
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(
      (entry) =>
        `| \`${entry.name}\` | ${entry.category} | ${entry.runtime} | ${entry.mutation} | \`${entry.importPath}\` | ${(legacyByCanonical.get(entry.name) ?? []).map((name) => `\`${name}\``).join(", ") || "None"} |`,
    );
  const legacyRows = entries.map(
    (entry) =>
      `| \`${entry.module.replace(".js", "")}.${entry.name}\` | ${entry.canonicalReferences.map(({ category, name, relation }) => `${relation}: \`${category}.${name}\``).join(", ") || "None"} | ${escapeCell(entry.decision)} |`,
  );
  return `# Akashatools function and migration index

> Generated from public source exports and \`UTILITY_INVENTORY.md\` by
> \`npm run docs:migration\`. Edit those sources, not this file.

Use browser/editor search on this page for either a canonical name or a 1.x
\`module.export\` name. A blank replacement means the behavior is native,
rejected, deferred, or application-owned; read the decision rather than assuming
drop-in compatibility.

## Canonical 2.0 exports

| Name | Category | Runtime | Mutation/effect | Focused import | Related 1.x names |
| --- | --- | --- | --- | --- | --- |
${canonicalRows.join("\n")}

## Akashatools 1.0.2 migration lookup

| Legacy name | Canonical replacement or related 2.0 API | Decision |
| --- | --- | --- |
${legacyRows.join("\n")}
`;
}

function mutation(category, name) {
  if (category === "browser") return "browser effect";
  if (category === "http" && name === "request") return "network effect";
  if (category === "async" && name === "delay") return "timer effect";
  if (category === "node" && name === "resolveExistingContainedPath") return "filesystem read";
  return "no input mutation";
}

function escapeCell(value) {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}
