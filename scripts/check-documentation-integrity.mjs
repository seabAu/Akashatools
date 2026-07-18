import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { TextDecoder } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultRootUrl = new URL("../", import.meta.url);
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
const inlineLink = /\[[^\]\n]*\]\(([^)\n]+)\)/gu;

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await checkDocumentationIntegrity();
  if (result.failures.length > 0) {
    console.error(`Documentation integrity check failed for ${result.failures.length} issue(s):`);
    for (const failure of result.failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(
      `Documentation integrity passed for ${result.fileCount} Markdown files, ${result.localLinkCount} local links, and ${result.fragmentCount} heading fragments.`,
    );
  }
}

/**
 * Validate packaged Markdown encoding and local link targets.
 *
 * @param {URL} [rootUrl] Package root URL.
 * @returns {Promise<{
 *   failures: string[],
 *   fileCount: number,
 *   localLinkCount: number,
 *   fragmentCount: number
 * }>} Validation result.
 */
export async function checkDocumentationIntegrity(rootUrl = defaultRootUrl) {
  const rootPath = fileURLToPath(rootUrl);
  const packageJson = JSON.parse(await readUtf8(new URL("package.json", rootUrl)));
  const markdownFiles = [new URL("CHANGELOG.md", rootUrl), new URL("README.md", rootUrl)];
  await collectMarkdownFiles(new URL("docs/", rootUrl), markdownFiles);
  markdownFiles.sort((left, right) => compareCodeUnits(left.href, right.href));

  const failures = [];
  const documents = new Map();
  let localLinkCount = 0;
  let fragmentCount = 0;

  for (const fileUrl of markdownFiles) {
    const filename = fileURLToPath(fileUrl);
    try {
      const source = await readUtf8(fileUrl);
      documents.set(filename, source);
      if (hasForbiddenText(source))
        failures.push(`${relativePath(rootPath, filename)} contains forbidden control text.`);
      if (!source.endsWith("\n")) failures.push(`${relativePath(rootPath, filename)} must end with a newline.`);
    } catch (error) {
      failures.push(`${relativePath(rootPath, filename)} is not valid UTF-8: ${error.message}`);
    }
  }

  for (const [filename, source] of documents) {
    for (const link of markdownLinks(source)) {
      const destination = link.destination;
      if (isExternalDestination(destination)) continue;

      localLinkCount += 1;
      const line = lineAt(source, link.index);
      const location = `${relativePath(rootPath, filename)}:${line}`;
      const hashIndex = destination.indexOf("#");
      const rawTarget = hashIndex < 0 ? destination : destination.slice(0, hashIndex);
      const rawFragment = hashIndex < 0 ? "" : destination.slice(hashIndex + 1);
      let decodedTarget;
      let decodedFragment;

      try {
        decodedTarget = decodeURIComponent(rawTarget);
        decodedFragment = decodeURIComponent(rawFragment);
      } catch {
        failures.push(`${location} has invalid percent-encoding in ${JSON.stringify(destination)}.`);
        continue;
      }

      if (isPortableAbsolutePath(decodedTarget)) {
        failures.push(`${location} uses an absolute filesystem path: ${JSON.stringify(destination)}.`);
        continue;
      }

      const targetPath = decodedTarget === "" ? filename : path.resolve(path.dirname(filename), decodedTarget);
      if (!isWithinRoot(rootPath, targetPath)) {
        failures.push(`${location} escapes the package root: ${JSON.stringify(destination)}.`);
        continue;
      }
      if (!isPackagedPath(rootPath, targetPath, packageJson.files ?? [])) {
        failures.push(`${location} links to an unpackaged path: ${JSON.stringify(destination)}.`);
        continue;
      }

      let targetStats;
      try {
        targetStats = await stat(targetPath);
      } catch {
        failures.push(`${location} links to a missing path: ${JSON.stringify(destination)}.`);
        continue;
      }
      if (!targetStats.isFile()) {
        failures.push(`${location} local link target is not a file: ${JSON.stringify(destination)}.`);
        continue;
      }

      if (decodedFragment !== "") {
        fragmentCount += 1;
        let targetSource = documents.get(targetPath);
        if (targetSource === undefined) {
          try {
            targetSource = await readUtf8(pathToFileURL(targetPath));
          } catch {
            failures.push(`${location} cannot read fragment target: ${JSON.stringify(destination)}.`);
            continue;
          }
        }
        if (!markdownHeadingAnchors(targetSource).has(decodedFragment)) {
          failures.push(`${location} links to a missing heading fragment: ${JSON.stringify(destination)}.`);
        }
      }
    }
  }

  return { failures, fileCount: markdownFiles.length, localLinkCount, fragmentCount };
}

/**
 * Extract inline Markdown link destinations and source offsets.
 *
 * @param {string} source Markdown source.
 * @returns {Array<{destination: string, index: number}>} Parsed links.
 */
export function markdownLinks(source) {
  const links = [];
  let fence = "";
  let offset = 0;

  while (offset < source.length) {
    const newline = source.indexOf("\n", offset);
    const end = newline < 0 ? source.length : newline + 1;
    const line = source.slice(offset, end);
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/u.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === "") fence = marker;
      else if (fence === marker) fence = "";
      offset = end;
      continue;
    }

    if (fence === "") {
      const codeRanges = [...line.matchAll(/(`+)(.*?)\1/gu)].map((match) => [
        match.index,
        match.index + match[0].length,
      ]);
      inlineLink.lastIndex = 0;
      for (const match of line.matchAll(inlineLink)) {
        if (codeRanges.some(([start, finish]) => match.index >= start && match.index < finish)) continue;
        const rawDestination = match[1].trim();
        const closingAngle = rawDestination.indexOf(">");
        const destination =
          rawDestination.startsWith("<") && closingAngle > 0
            ? rawDestination.slice(1, closingAngle)
            : rawDestination.split(/\s+/u, 1)[0];
        links.push({ destination, index: offset + match.index });
      }
    }
    offset = end;
  }
  return links;
}

/**
 * Derive GitHub-style anchors for ATX Markdown headings.
 *
 * @param {string} source Markdown source.
 * @returns {Set<string>} Heading anchors.
 */
export function markdownHeadingAnchors(source) {
  const anchors = new Set();
  const occurrences = new Map();
  let fence = "";

  for (const line of source.split(/\r?\n/u)) {
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/u.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === "") fence = marker;
      else if (fence === marker) fence = "";
      continue;
    }
    if (fence !== "") continue;

    const heading = /^ {0,3}#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/u.exec(line)?.[1];
    if (!heading) continue;
    const base = githubHeadingSlug(heading);
    if (base === "") continue;
    const occurrence = occurrences.get(base) ?? 0;
    occurrences.set(base, occurrence + 1);
    anchors.add(occurrence === 0 ? base : `${base}-${occurrence}`);
  }

  return anchors;
}

/**
 * Normalize one Markdown heading using GitHub's relevant slug rules.
 *
 * @param {string} heading Heading text.
 * @returns {string} Anchor slug.
 */
export function githubHeadingSlug(heading) {
  return heading
    .replace(/<[^>]*>/gu, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/gu, "$1")
    .replace(/[`*_~]/gu, "")
    .toLocaleLowerCase("en-US")
    .trim()
    .replace(/[^\p{Letter}\p{Mark}\p{Number}\s_-]/gu, "")
    .replace(/\s+/gu, "-");
}

async function collectMarkdownFiles(directory, output) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => compareCodeUnits(left.name, right.name));
  for (const entry of entries) {
    const url = new URL(entry.name, directory);
    if (entry.isDirectory()) await collectMarkdownFiles(new URL(`${entry.name}/`, directory), output);
    else if (entry.isFile() && entry.name.endsWith(".md")) output.push(url);
  }
}

async function readUtf8(url) {
  return utf8Decoder.decode(await readFile(url));
}

function isWithinRoot(rootPath, targetPath) {
  const relative = path.relative(rootPath, targetPath);
  return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function isExternalDestination(destination) {
  if (destination.startsWith("//")) return true;
  return /^[A-Za-z][A-Za-z\d+.-]*:/u.test(destination) && !/^[A-Za-z]:[\\/]/u.test(destination);
}

function isPortableAbsolutePath(filename) {
  return path.isAbsolute(filename) || /^[A-Za-z]:[\\/]/u.test(filename) || /^[\\/]{2}/u.test(filename);
}

function isPackagedPath(rootPath, targetPath, packagedRoots) {
  const relative = relativePath(rootPath, targetPath);
  return (
    relative === "package.json" ||
    packagedRoots.some((root) => relative === root || relative.startsWith(`${root.replaceAll("\\", "/")}/`))
  );
}

function relativePath(rootPath, filename) {
  return path.relative(rootPath, filename).replaceAll(path.sep, "/");
}

function lineAt(source, offset) {
  return source.slice(0, offset).split(/\r?\n/u).length;
}

function hasForbiddenText(source) {
  for (const character of source) {
    const codePoint = character.codePointAt(0);
    if (
      codePoint === 0xfffd ||
      codePoint === 0x7f ||
      codePoint <= 0x08 ||
      codePoint === 0x0b ||
      codePoint === 0x0c ||
      (codePoint >= 0x0e && codePoint <= 0x1f)
    ) {
      return true;
    }
  }
  return false;
}

function compareCodeUnits(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}
