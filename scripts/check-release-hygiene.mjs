import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const rootUrl = new URL("../", import.meta.url);
const rootPath = fileURLToPath(rootUrl);
const failures = [];
const sourceFiles = [];
const testFiles = [];

await collectMaintainedFiles(new URL("src/", rootUrl), sourceFiles);
for (const directory of ["browser-test", "test"]) {
  await collectMaintainedFiles(new URL(`${directory}/`, rootUrl), testFiles);
}

const unfinishedMarker = /\b(?:TODO|FIXME|XXX|HACK|WIP)\b/gu;
const runtimeLogging = /\bconsole\s*\.\s*(?:debug|error|info|log|trace|warn)\b|\bdebugger\b/gu;
const disabledTest = /\b(?:describe|it|test)\s*\.\s*(?:only|skip|todo)\b/gu;
const disabledTestOption = /\b(?:only|skip|todo)\s*:\s*(?:true|["'`])/gu;

for (const filename of [...sourceFiles, ...testFiles]) {
  const source = await readFile(filename, "utf8");
  recordMatches(filename, source, unfinishedMarker, "unfinished marker");
  if (sourceFiles.includes(filename)) recordMatches(filename, source, runtimeLogging, "runtime logging/debugger");
  if (testFiles.includes(filename)) {
    recordMatches(filename, source, disabledTest, "disabled or focused test");
    recordMatches(filename, source, disabledTestOption, "disabled or focused test option");
  }
}

const packageJson = JSON.parse(await readFile(new URL("package.json", rootUrl), "utf8"));
const packageLock = JSON.parse(await readFile(new URL("package-lock.json", rootUrl), "utf8"));
const lockRoot = packageLock.packages?.[""];

expect(packageJson.name === "akashatools", 'package name must remain "akashatools".');
expect(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(packageJson.version), "package version must be valid SemVer.");
expect(packageJson.private !== true, "publishable package cannot be marked private.");
expect(packageJson.type === "module", 'package type must remain "module".');
expect(packageJson.sideEffects === false, "package must declare sideEffects: false.");
expect(packageJson.engines?.node === ">=22.17", "Node engine floor must remain >=22.17.");
expect(packageJson.license === "ISC", "package license must match LICENSE and remain ISC.");
expect(isNonEmptyString(packageJson.repository?.url), "repository metadata is required.");
expect(isNonEmptyString(packageJson.bugs?.url), "issue-tracker metadata is required.");
expect(isNonEmptyString(packageJson.homepage), "homepage metadata is required.");
expect(isNonEmptyString(packageJson.author), "package author metadata is required.");
expect(packageJson.exports && typeof packageJson.exports === "object", "package exports map is required.");
expect(packageJson.main === "./src/index.js", "main must resolve the canonical ESM root.");
expect(packageJson.types === "./types/index.d.ts", "types must resolve the canonical declaration root.");

const expectedPackagedRoots = ["CHANGELOG.md", "LICENSE", "README.md", "benchmark", "docs", "lib", "src", "types"];
expect(
  arraysEqual([...(packageJson.files ?? [])].sort(compareCodeUnits), expectedPackagedRoots),
  `package files must equal ${expectedPackagedRoots.join(", ")}.`,
);

for (const field of ["dependencies", "optionalDependencies", "peerDependencies"]) {
  expect(
    packageJson[field] === undefined || Object.keys(packageJson[field]).length === 0,
    `${field} must remain empty for the dependency-free runtime contract.`,
  );
}

for (const lifecycle of [
  "preinstall",
  "install",
  "postinstall",
  "prepare",
  "prepack",
  "postpack",
  "prepublish",
  "prepublishOnly",
  "publish",
  "postpublish",
  "preversion",
  "version",
  "postversion",
]) {
  expect(packageJson.scripts?.[lifecycle] === undefined, `package must not define the ${lifecycle} lifecycle script.`);
}

expect(packageLock.lockfileVersion === 3, "package-lock must use lockfileVersion 3.");
expect(lockRoot?.name === packageJson.name, "package-lock root name must match package.json.");
expect(lockRoot?.version === packageJson.version, "package-lock root version must match package.json.");
expect(lockRoot?.license === packageJson.license, "package-lock root license must match package.json.");
expect(lockRoot?.engines?.node === packageJson.engines.node, "package-lock root engine must match package.json.");

if (failures.length > 0) {
  console.error(`Release hygiene check failed for ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Release hygiene passed for ${sourceFiles.length} source and ${testFiles.length} test files; package and lock metadata are consistent.`,
  );
}

async function collectMaintainedFiles(directory, output) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => compareCodeUnits(left.name, right.name));
  for (const entry of entries) {
    const url = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      await collectMaintainedFiles(new URL(`${entry.name}/`, directory), output);
    } else if (entry.isFile() && /\.(?:cjs|js|jsx|mjs|ts|tsx)$/u.test(entry.name)) {
      output.push(fileURLToPath(url));
    }
  }
}

function recordMatches(filename, source, pattern, description) {
  pattern.lastIndex = 0;
  for (const match of source.matchAll(pattern)) {
    const line = source.slice(0, match.index).split(/\r?\n/u).length;
    failures.push(`${relativePath(filename)}:${line} contains ${description}: ${JSON.stringify(match[0])}`);
  }
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function relativePath(filename) {
  return path.relative(rootPath, filename).replaceAll(path.sep, "/");
}

function compareCodeUnits(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}
