import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parse } from "@babel/parser";

const excludedDirectories = new Set([
  ".git",
  ".venv",
  "__pycache__",
  "_backups",
  "_defunct",
  "backups",
  "build",
  "coverage",
  "defunct",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
  "venv",
  "{defunct}",
]);
const sourceExtension = /\.(?:[cm]?[jt]sx?)$/i;
const summaryOnly = process.argv.includes("--summary");
const countsOnly = process.argv.includes("--counts-only");
const roots = process.argv.slice(2).filter((argument) => argument !== "--summary" && argument !== "--counts-only");
const manifest = JSON.parse(await readFile(new URL("../docs/LEGACY_MANIFEST.json", import.meta.url), "utf8"));
const manifestEntries = new Map(manifest.entries.map((entry) => [`${entry.module}:${entry.name}`, entry]));
const moduleByNamespace = {
  ao: "AO.js",
  debug: "Debug.js",
  file: "File.js",
  http: "Http.js",
  math: "Math.js",
  rand: "Rand.js",
  str: "String.js",
  time: "Time.js",
  val: "Val.js",
};

if (roots.length === 0) {
  console.error(
    "Usage: node scripts/audit-legacy-consumers.mjs [--summary | --counts-only] <source-root> [...source-root]",
  );
  process.exitCode = 1;
} else {
  const reports = [];
  for (const rootArgument of roots) reports.push(await auditRoot(rootArgument));
  let output = summaryOnly || countsOnly ? reports.map(summarizeReport) : reports;
  if (countsOnly) {
    output = output.map((report) => {
      const counts = { ...report };
      delete counts.accesses;
      return counts;
    });
  }
  console.log(JSON.stringify(output, null, 2));
}

async function auditRoot(rootArgument) {
  const root = path.resolve(rootArgument);
  const sourceFiles = [];
  const skippedDirectories = [];
  await collectSourceFiles(root, sourceFiles, skippedDirectories);
  sourceFiles.sort(compareCodeUnits);

  const rootNamespaceFiles = new Set();
  const rootNamespaceDeclarations = [];
  const namedRootImports = [];
  const subpathImports = [];
  const accessRecords = new Map();
  const parseFailures = [];
  const parseDiagnostics = [];

  for (const filename of sourceFiles) {
    const source = await readFile(filename, "utf8");
    const relativeFilename = path.relative(root, filename).replaceAll(path.sep, "/");
    let program;
    try {
      const parsed = parse(source, {
        allowAwaitOutsideFunction: true,
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        allowUndeclaredExports: true,
        errorRecovery: true,
        plugins: ["jsx", "typescript", ["optionalChainingAssign", { version: "2023-07" }]],
        sourceType: "unambiguous",
      });
      program = parsed.program;
      for (const diagnostic of parsed.errors) {
        parseDiagnostics.push({
          file: relativeFilename,
          line: diagnostic.loc?.line,
          message: diagnostic.message,
        });
      }
    } catch (error) {
      parseFailures.push({ file: relativeFilename, message: error.message });
      continue;
    }
    const namespaceAliases = new Map();

    for (const statement of program.body) {
      if (statement.type !== "ImportDeclaration" || typeof statement.source.value !== "string") continue;
      const specifier = statement.source.value;
      if (specifier !== "akashatools" && !specifier.startsWith("akashatools/")) continue;

      if (specifier === "akashatools") {
        for (const importSpecifier of statement.specifiers) {
          if (
            importSpecifier.type === "ImportDefaultSpecifier" ||
            importSpecifier.type === "ImportNamespaceSpecifier"
          ) {
            const kind = importSpecifier.type === "ImportDefaultSpecifier" ? "default" : "namespace";
            namespaceAliases.set(importSpecifier.local.name, kind);
            rootNamespaceFiles.add(relativeFilename);
            rootNamespaceDeclarations.push({ file: relativeFilename, kind, local: importSpecifier.local.name });
          } else if (importSpecifier.type === "ImportSpecifier") {
            namedRootImports.push({
              file: relativeFilename,
              imported: importedName(importSpecifier.imported),
              local: importSpecifier.local.name,
            });
          }
        }
      } else {
        subpathImports.push({
          file: relativeFilename,
          names: importNames(statement.specifiers),
          specifier,
        });
      }
    }

    if (namespaceAliases.size === 0) continue;
    visit(program, undefined);

    function visit(node, parent) {
      if (isOutermostAccess(node, parent)) {
        const chain = propertyChain(node);
        if (chain && namespaceAliases.has(chain[0]) && chain.length > 1) {
          const access = chain.slice(1).join(".");
          let record = accessRecords.get(access);
          if (!record) {
            record = { access, files: new Set(), occurrences: 0, samples: [] };
            accessRecords.set(access, record);
          }
          record.files.add(relativeFilename);
          record.occurrences += 1;
          if (record.samples.length < 5) {
            record.samples.push(`${relativeFilename}:${node.loc.start.line}`);
          }
        }
      }
      for (const [key, value] of Object.entries(node)) {
        if (key === "loc" || key === "range" || key === "tokens" || key === "comments") continue;
        if (Array.isArray(value)) {
          for (const child of value) if (child?.type) visit(child, node);
        } else if (value?.type) {
          visit(value, node);
        }
      }
    }
  }

  return {
    root,
    sourceFileCount: sourceFiles.length,
    skippedDirectories: skippedDirectories.map((directory) => path.relative(root, directory).replaceAll(path.sep, "/")),
    parseFailures,
    parseDiagnostics,
    rootNamespaceImportFileCount: rootNamespaceFiles.size,
    rootNamespaceDeclarationCount: rootNamespaceDeclarations.length,
    rootNamespaceDeclarations: rootNamespaceDeclarations.sort(compareImportRecords),
    namedRootImports: namedRootImports.sort(compareImportRecords),
    subpathImports: subpathImports.sort(compareImportRecords),
    accesses: [...accessRecords.values()]
      .map((record) => ({
        access: record.access,
        occurrences: record.occurrences,
        fileCount: record.files.size,
        samples: record.samples,
        disposition: dispositionFor(record.access),
      }))
      .sort((left, right) => right.occurrences - left.occurrences || compareCodeUnits(left.access, right.access)),
  };
}

async function collectSourceFiles(directory, output, skippedDirectories) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "EACCES" || error?.code === "EPERM") {
      skippedDirectories.push(directory);
      return;
    }
    throw error;
  }

  entries.sort((left, right) => compareCodeUnits(left.name, right.name));
  for (const entry of entries) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name.toLowerCase())) {
        await collectSourceFiles(filename, output, skippedDirectories);
      }
    } else if (entry.isFile() && sourceExtension.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      output.push(filename);
    }
  }
}

function importNames(specifiers) {
  if (specifiers.length === 0) return ["side-effect"];
  return specifiers.map((specifier) => {
    if (specifier.type === "ImportDefaultSpecifier") return `default:${specifier.local.name}`;
    if (specifier.type === "ImportNamespaceSpecifier") return `namespace:${specifier.local.name}`;
    return `${importedName(specifier.imported)}:${specifier.local.name}`;
  });
}

function isOutermostAccess(node, parent) {
  if (!isMemberExpression(node)) return false;
  return !(isMemberExpression(parent) && parent.object === node);
}

function propertyChain(node) {
  const segments = [];
  let current = node;
  while (isMemberExpression(current)) {
    if (!current.computed && current.property.type === "Identifier") {
      segments.unshift(current.property.name);
    } else if (current.computed && current.property.type === "StringLiteral") {
      segments.unshift(current.property.value);
    } else {
      return undefined;
    }
    current = current.object;
  }
  if (current.type !== "Identifier") return undefined;
  segments.unshift(current.name);
  return segments;
}

function importedName(imported) {
  return imported.type === "Identifier" ? imported.name : imported.value;
}

function isMemberExpression(node) {
  return node?.type === "MemberExpression" || node?.type === "OptionalMemberExpression";
}

function compareImportRecords(left, right) {
  return compareCodeUnits(left.file, right.file) || compareCodeUnits(JSON.stringify(left), JSON.stringify(right));
}

function summarizeReport(report) {
  const namedRootNames = [...new Set(report.namedRootImports.map(({ imported }) => imported))].sort(compareCodeUnits);
  const packageSubpaths = [...new Set(report.subpathImports.map(({ specifier }) => specifier))].sort(compareCodeUnits);
  const legacySubpaths = packageSubpaths.filter((specifier) => /^akashatools\/lib(?:\/|$)/.test(specifier));
  const modernSubpaths = packageSubpaths.filter((specifier) => !legacySubpaths.includes(specifier));
  return {
    root: report.root,
    sourceFileCount: report.sourceFileCount,
    skippedDirectories: report.skippedDirectories,
    parseFailureCount: report.parseFailures.length,
    parseFailures: report.parseFailures,
    recoverableParseDiagnosticCount: report.parseDiagnostics.length,
    rootNamespaceImportFileCount: report.rootNamespaceImportFileCount,
    rootNamespaceDeclarationCount: report.rootNamespaceDeclarationCount,
    namedRootImportCount: report.namedRootImports.length,
    namedRootNames,
    packageSubpathImportCount: report.subpathImports.length,
    packageSubpaths,
    legacySubpathImportCount: report.subpathImports.filter(({ specifier }) => legacySubpaths.includes(specifier))
      .length,
    legacySubpaths,
    modernSubpathImportCount: report.subpathImports.filter(({ specifier }) => modernSubpaths.includes(specifier))
      .length,
    modernSubpaths,
    accessOccurrenceCount: report.accesses.reduce((total, { occurrences }) => total + occurrences, 0),
    uniqueAccessCount: report.accesses.length,
    directReplacementOccurrenceCount: report.accesses.reduce(
      (total, { disposition, occurrences }) =>
        total + (disposition?.canonicalReferences.some(({ relation }) => relation === "replacement") ? occurrences : 0),
      0,
    ),
    relatedOnlyOccurrenceCount: report.accesses.reduce(
      (total, { disposition, occurrences }) =>
        total +
        (disposition?.canonicalReferences.length > 0 &&
        !disposition.canonicalReferences.some(({ relation }) => relation === "replacement")
          ? occurrences
          : 0),
      0,
    ),
    noCanonicalReferenceOccurrenceCount: report.accesses.reduce(
      (total, { disposition, occurrences }) =>
        total + (disposition && disposition.canonicalReferences.length === 0 ? occurrences : 0),
      0,
    ),
    unresolvedManifestOccurrenceCount: report.accesses.reduce(
      (total, { disposition, occurrences }) => total + (!disposition ? occurrences : 0),
      0,
    ),
    accesses: report.accesses.map(({ access, occurrences, fileCount, disposition }) => ({
      access,
      occurrences,
      fileCount,
      disposition,
    })),
  };
}

function dispositionFor(access) {
  const [namespace, name] = access.split(".");
  const module = moduleByNamespace[namespace];
  if (!module || !name) return undefined;
  const entry = manifestEntries.get(`${module}:${name}`);
  if (!entry) return undefined;
  return {
    canonicalReferences: entry.canonicalReferences.map(({ category, importPath, name: canonicalName, relation }) => ({
      name: `${category}.${canonicalName}`,
      importPath,
      relation,
    })),
    decision: entry.decision,
  };
}

function compareCodeUnits(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}
