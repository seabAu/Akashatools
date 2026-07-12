import { readFile, writeFile } from "node:fs/promises";

const publicModules = [
  "array", "async", "browser", "collection", "date", "http", "number",
  "object", "random", "sort", "string", "validation", "node",
].map((category) => `src/${category}.js`);
const completeSchemaModules = new Set([
  "src/async.js",
  "src/browser.js",
  "src/collection.js",
  "src/node.js",
]);

if (process.argv.includes("--fix-since")) {
  let updatedCount = 0;
  for (const filename of publicModules) {
    const url = new URL(`../${filename}`, import.meta.url);
    let source = await readFile(url, "utf8");
    const offsets = [...source.matchAll(/^export\s+(?:async\s+)?(?:class|function|const)\s+[A-Za-z_$][\w$]*/gm)]
      .map(({ index }) => index)
      .reverse();

    for (const declarationOffset of offsets) {
      const commentStart = source.lastIndexOf("/**", declarationOffset);
      const commentEnd = commentStart < 0 ? -1 : source.indexOf("*/", commentStart);
      if (commentStart < 0 || commentEnd < 0 || source.slice(commentEnd + 2, declarationOffset).trim() !== "") continue;
      const comment = source.slice(commentStart, commentEnd + 2);
      if (/@since\s+2\.0\.0\b/.test(comment)) continue;
      source = `${source.slice(0, commentEnd)}* @since 2.0.0\n ${source.slice(commentEnd)}`;
      updatedCount += 1;
    }
    await writeFile(url, source);
  }
  console.log(`Added @since 2.0.0 to ${updatedCount} public declarations.`);
}

const failures = [];
let declarationCount = 0;

for (const filename of publicModules) {
  const source = await readFile(new URL(`../${filename}`, import.meta.url), "utf8");
  const declarations = source.matchAll(/^export\s+(?:async\s+)?(class|function|const)\s+([A-Za-z_$][\w$]*)/gm);

  for (const declaration of declarations) {
    declarationCount += 1;
    const [fullDeclaration, kind, name] = declaration;
    const declarationOffset = declaration.index;
    const commentStart = source.lastIndexOf("/**", declarationOffset);
    const commentEnd = commentStart < 0 ? -1 : source.indexOf("*/", commentStart);
    const between = commentEnd < 0 ? "" : source.slice(commentEnd + 2, declarationOffset);
    const location = `${filename}:${lineAt(source, declarationOffset)} (${name})`;

    if (commentStart < 0 || commentEnd < 0 || between.trim() !== "") {
      failures.push(`${location}: missing adjacent JSDoc block`);
      continue;
    }

    const comment = source.slice(commentStart, commentEnd + 2);
    const prose = comment
      .replace(/^\/\*\*|\*\/$/g, "")
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*\*\s?/, "").trim())
      .filter((line) => line !== "" && !line.startsWith("@"));
    if (prose.length === 0) failures.push(`${location}: missing summary`);
    if (!/@since\s+2\.0\.0\b/.test(comment)) failures.push(`${location}: missing @since 2.0.0`);
    if (kind !== "class" && !/@returns?\s*\{/.test(comment)) failures.push(`${location}: missing @returns type`);
    if (/@deprecated\b/.test(comment) && !/@deprecated\s+\S/.test(comment)) {
      failures.push(`${location}: @deprecated must identify a replacement or rationale`);
    }

    if (fullDeclaration.includes("function") && !/@param\s*\{/.test(comment) && hasDeclaredParameters(source, declarationOffset)) {
      failures.push(`${location}: parameterized function is missing @param types`);
    }

    if (completeSchemaModules.has(filename)) {
      const lines = comment.split(/\r?\n/).map((line) => line.replace(/^\s*\*\s?/, "").trim());
      for (const line of lines.filter((line) => line.startsWith("@param "))) {
        if (!/^@param\s+\{.*\}\s+(?:\[[^\]]+\]|\S+)\s+\S/.test(line)) {
          failures.push(`${location}: @param must include a description`);
        }
      }
      const returnsLine = lines.find((line) => /^@returns?\s/.test(line));
      if (kind !== "class" && !/^@returns?\s+\{.*\}\s+\S/.test(returnsLine ?? "")) {
        failures.push(`${location}: @returns must include a description`);
      }
      if (!/@throws\s+\{/.test(comment)) failures.push(`${location}: missing @throws contract`);
      if (!/@example\b/.test(comment)) failures.push(`${location}: missing @example`);
    }
  }
}

if (failures.length > 0) {
  console.error(`API documentation check failed for ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`API documentation check passed for ${declarationCount} public declarations.`);
}

function lineAt(source, offset) {
  return source.slice(0, offset).split("\n").length;
}

function hasDeclaredParameters(source, declarationOffset) {
  const open = source.indexOf("(", declarationOffset);
  const close = source.indexOf(")", open + 1);
  return open >= 0 && close >= 0 && source.slice(open + 1, close).trim() !== "";
}
