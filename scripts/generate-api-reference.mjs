import { readFile, writeFile } from "node:fs/promises";

const categories = [
  "array", "async", "browser", "collection", "date", "http", "number",
  "object", "random", "sort", "string", "validation", "node",
];
const outputUrl = new URL("../docs/API_REFERENCE.md", import.meta.url);
const checkOnly = process.argv.includes("--check");
const sections = [];

for (const category of categories) {
  const filename = `src/${category}.js`;
  const source = await readFile(new URL(`../${filename}`, import.meta.url), "utf8");
  const declarations = [];

  for (const declaration of source.matchAll(/^export\s+(?:async\s+)?(class|function|const)\s+([A-Za-z_$][\w$]*)/gm)) {
    const [, kind, name] = declaration;
    const commentStart = source.lastIndexOf("/**", declaration.index);
    const commentEnd = source.indexOf("*/", commentStart);
    const comment = source.slice(commentStart + 3, commentEnd);
    const lines = comment.split(/\r?\n/).map((line) => line.replace(/^\s*\*\s?/, "").trim());
    const tagStart = lines.findIndex((line) => line.startsWith("@"));
    const summaryLines = (tagStart < 0 ? lines : lines.slice(0, tagStart));
    const summary = paragraphs(summaryLines);
    const tags = tagStart < 0 ? [] : collapseTags(lines.slice(tagStart));
    const parameters = tags.flatMap((line) => {
      const match = line.match(/^@param\s+\{(.+)\}\s+(\[[^\]]+\]|\S+)(?:\s+-\s*(.*))?$/);
      return match ? [{ type: match[1], name: match[2], description: match[3] ?? "" }] : [];
    });
    const returns = tags.find((line) => /^@returns?\s+\{/.test(line))?.match(/^@returns?\s+\{(.+)\}(?:\s+(.*))?$/);
    const thrown = tags.flatMap((line) => {
      const match = line.match(/^@throws\s+\{(.+)\}(?:\s+(.*))?$/);
      return match ? [{ type: match[1], description: match[2] ?? "" }] : [];
    });
    const deprecated = tags.find((line) => line.startsWith("@deprecated "))?.slice("@deprecated ".length);
    const since = tags.find((line) => line.startsWith("@since "))?.slice("@since ".length);
    declarations.push({ kind, name, summary, parameters, returns, thrown, deprecated, since });
  }

  sections.push(renderCategory(category, declarations));
}

const output = `# Akashatools API reference

> Generated from public source JSDoc by \`npm run docs:api\`. Edit the source
> comments, not this file. Run \`npm run check:generated\` to detect drift.

Every universal category is also available as a named root export and on the
frozen default \`akasha\` namespace. The paths below are the focused category
imports. Node-only utilities intentionally appear only under \`akashatools/node\`.

${sections.join("\n\n")}
`;

if (checkOnly) {
  const current = await readFile(outputUrl, "utf8").catch(() => "");
  if (current !== output) {
    console.error("docs/API_REFERENCE.md is stale; run npm run docs:api.");
    process.exitCode = 1;
  } else {
    console.log("Generated API reference is current.");
  }
} else {
  await writeFile(outputUrl, output);
  console.log(`Generated docs/API_REFERENCE.md for ${categories.length} categories.`);
}

function renderCategory(category, declarations) {
  const runtime = category === "browser"
    ? "Modern browser at effect time; safe to import universally."
    : category === "node" ? "Node.js 22+." : "Universal JavaScript on the supported runtime floor.";
  const importPath = category === "node" ? "akashatools/node" : `akashatools/${category}`;
  const entries = declarations.map((declaration) => renderDeclaration(declaration, importPath, category));
  return `## ${category}\n\nRuntime: ${runtime}\n\nFocused import: \`${importPath}\`\n\n${entries.join("\n\n")}`;
}

function renderDeclaration(declaration, importPath, category) {
  const names = declaration.parameters.map(({ name }) => normalizeParameterName(name));
  const signature = declaration.kind === "class"
    ? `class ${declaration.name}`
    : `${declaration.name}(${names.join(", ")})`;
  const lines = [
    `### ${declaration.name}`,
    "",
    declaration.summary,
    "",
    `- Signature: \`${signature}\``,
    `- Import: \`import { ${declaration.name} } from "${importPath}"\``,
    `- Input mutation: ${mutationNote(category, declaration.name)}`,
    `- Since: ${declaration.since}`,
  ];
  if (declaration.returns) lines.push(`- Returns: \`${declaration.returns[1]}\`${declaration.returns[2] ? ` — ${declaration.returns[2]}` : ""}`);
  if (declaration.deprecated) lines.push(`- Deprecated: ${declaration.deprecated}`);
  if (declaration.parameters.length > 0) {
    lines.push("", "| Parameter | Type | Description |", "| --- | --- | --- |");
    for (const parameter of declaration.parameters) {
      lines.push(`| \`${escapeCell(parameter.name)}\` | \`${escapeCell(parameter.type)}\` | ${escapeCell(parameter.description || "Not documented.")} |`);
    }
  }
  if (declaration.thrown.length > 0) {
    lines.push("", "Throws:");
    for (const error of declaration.thrown) lines.push(`- \`${error.type}\`${error.description ? ` — ${error.description}` : ""}`);
  }
  return lines.join("\n");
}

function mutationNote(category, name) {
  if (category === "browser") return "Does not mutate inputs; performs a browser download effect.";
  if (category === "http" && name === "request") return "Does not mutate inputs; performs one network request.";
  if (category === "async" && name === "delay") return "Does not mutate inputs; schedules a timer.";
  if (category === "node" && name === "resolveExistingContainedPath") return "Does not mutate inputs; reads filesystem metadata.";
  return "Does not mutate inputs.";
}

function paragraphs(lines) {
  return lines.join(" ").replace(/\s+/g, " ").trim();
}

function collapseTags(lines) {
  const tags = [];
  for (const line of lines) {
    if (line.startsWith("@")) tags.push(line);
    else if (line !== "" && tags.length > 0) tags[tags.length - 1] += ` ${line}`;
  }
  return tags;
}

function normalizeParameterName(name) {
  if (!name.startsWith("[")) return name;
  return `${name.slice(1, -1).split("=")[0]}?`;
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}
