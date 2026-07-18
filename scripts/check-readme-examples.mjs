import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";

const readmeUrl = new URL("../README.md", import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await checkReadmeExamples();
  if (result.failures.length > 0) {
    console.error(`README example check failed for ${result.failures.length} issue(s):`);
    for (const failure of result.failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(
      `README examples passed for ${result.exampleCount} JavaScript blocks, ${result.importCount} package imports, and ${result.bindingCount} imported bindings.`,
    );
  }
}

/**
 * Parse README JavaScript examples and resolve their documented package imports.
 *
 * @param {URL} [url] README URL.
 * @param {(specifier: string) => Promise<object>} [loadModule] Module loader.
 * @returns {Promise<{
 *   failures: string[],
 *   exampleCount: number,
 *   importCount: number,
 *   bindingCount: number
 * }>} Verification result.
 */
export async function checkReadmeExamples(url = readmeUrl, loadModule = (specifier) => import(specifier)) {
  const source = await readFile(url, "utf8");
  const examples = extractJavascriptExamples(source);
  const failures = [];
  const modules = new Map();
  let importCount = 0;
  let bindingCount = 0;

  for (const example of examples) {
    let program;
    try {
      program = parse(example.source, { sourceType: "module" }).program;
    } catch (error) {
      const line = example.line + (error.loc?.line ?? 1) - 1;
      failures.push(`README.md:${line} has invalid JavaScript: ${error.message}`);
      continue;
    }

    for (const declaration of program.body) {
      if (declaration.type !== "ImportDeclaration") continue;
      const specifier = declaration.source.value;
      if (specifier !== "akashatools" && !specifier.startsWith("akashatools/")) continue;
      importCount += 1;

      let loaded = modules.get(specifier);
      if (!loaded) {
        loaded = Promise.resolve().then(() => loadModule(specifier));
        modules.set(specifier, loaded);
      }

      let namespace;
      try {
        namespace = await loaded;
      } catch (error) {
        failures.push(
          `README.md:${example.line + declaration.loc.start.line - 1} cannot resolve ${JSON.stringify(specifier)}: ${error.message}`,
        );
        continue;
      }

      for (const binding of declaration.specifiers) {
        bindingCount += 1;
        if (binding.type === "ImportNamespaceSpecifier") continue;
        const imported =
          binding.type === "ImportDefaultSpecifier"
            ? "default"
            : binding.imported.type === "Identifier"
              ? binding.imported.name
              : binding.imported.value;
        if (!Object.hasOwn(namespace, imported)) {
          failures.push(
            `README.md:${example.line + binding.loc.start.line - 1} imports missing ${JSON.stringify(imported)} from ${JSON.stringify(specifier)}.`,
          );
        }
      }
    }
  }

  return { failures, exampleCount: examples.length, importCount, bindingCount };
}

/**
 * Extract JavaScript fenced blocks with their first source line.
 *
 * @param {string} markdown Markdown source.
 * @returns {Array<{source: string, line: number}>} JavaScript examples.
 */
export function extractJavascriptExamples(markdown) {
  const examples = [];
  const fence = /^```(?:js|javascript)[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gimu;
  for (const match of markdown.matchAll(fence)) {
    examples.push({ source: match[1], line: lineAt(markdown, match.index) + 1 });
  }
  return examples;
}

function lineAt(source, offset) {
  return source.slice(0, offset).split(/\r?\n/u).length;
}
