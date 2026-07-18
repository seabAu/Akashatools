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
const manifestModules = new Map(manifest.entries.map(({ module }) => [module.toLowerCase(), module]));
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
const namespaceByModule = new Map(Object.entries(moduleByNamespace).map(([namespace, module]) => [module, namespace]));

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
      delete counts.dynamicNamespaceAccessSamples;
      delete counts.legacySubpathAccesses;
      delete counts.unparsedPotentialLegacyAccesses;
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
  const legacySubpathAccessRecords = new Map();
  const importBindingNodes = new WeakSet();
  const dynamicNamespaceAccesses = { occurrences: 0, samples: [] };
  const unparsedPotentialLegacyAccesses = [];
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
      for (const candidate of findPotentialLegacyAccesses(source)) {
        unparsedPotentialLegacyAccesses.push({ file: relativeFilename, ...candidate });
      }
      continue;
    }
    const namespaceAliases = new Map();
    const legacySubpathBindings = new Map();
    const visitedNodes = new WeakSet();

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
        const legacyModule = legacyModuleForSpecifier(specifier);
        if (legacyModule) {
          const namespace = namespaceByModule.get(legacyModule);
          for (const importSpecifier of statement.specifiers) {
            importBindingNodes.add(importSpecifier.local);
            if (importSpecifier.type !== "ImportSpecifier" || !namespace) continue;
            const name = importedName(importSpecifier.imported);
            const binding = {
              access: `${namespace}.${name}`,
              file: relativeFilename,
              local: importSpecifier.local.name,
              name,
              specifier,
            };
            const key = `${relativeFilename}:${specifier}:${name}:${binding.local}`;
            binding.record = accessRecord(legacySubpathAccessRecords, key, binding);
            legacySubpathBindings.set(binding.local, binding);
          }
        }
      }
    }

    if (namespaceAliases.size === 0 && legacySubpathBindings.size === 0) continue;
    visit(program, []);

    function visit(node, ancestors) {
      if (visitedNodes.has(node)) return;
      visitedNodes.add(node);
      const parent = ancestors.at(-1);
      if (isOutermostAccess(node, parent)) {
        const chain = propertyChain(node);
        if (chain && namespaceAliases.has(chain[0]) && chain.length > 1) {
          const access = chain.slice(1).join(".");
          const record = accessRecord(accessRecords, access);
          recordAccess(record, relativeFilename, node, ancestors);
        } else if (namespaceAliases.has(memberRootIdentifier(node))) {
          dynamicNamespaceAccesses.occurrences += 1;
          if (dynamicNamespaceAccesses.samples.length < 10) {
            dynamicNamespaceAccesses.samples.push(`${relativeFilename}:${node.loc.start.line}`);
          }
        }
      } else if (
        node.type === "Identifier" &&
        legacySubpathBindings.has(node.name) &&
        !importBindingNodes.has(node) &&
        isIdentifierReference(node, parent)
      ) {
        const binding = legacySubpathBindings.get(node.name);
        recordAccess(binding.record, relativeFilename, node, ancestors);
      }
      const nextAncestors = [...ancestors, node];
      for (const [key, value] of Object.entries(node)) {
        if (key === "loc" || key === "range" || key === "tokens" || key === "comments") continue;
        if (Array.isArray(value)) {
          for (const child of value) if (child?.type) visit(child, nextAncestors);
        } else if (value?.type) {
          visit(value, nextAncestors);
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
    dynamicNamespaceAccesses,
    unparsedPotentialLegacyAccesses,
    accesses: [...accessRecords.values()]
      .map((record) => ({
        access: record.access,
        occurrences: record.occurrences,
        fileCount: record.files.size,
        samples: record.samples,
        usage: summarizeUsage(record.usage),
        disposition: dispositionFor(record.access),
      }))
      .sort((left, right) => right.occurrences - left.occurrences || compareCodeUnits(left.access, right.access)),
    legacySubpathAccesses: [...legacySubpathAccessRecords.values()]
      .map((record) => ({
        access: record.access,
        file: record.file,
        local: record.local,
        name: record.name,
        specifier: record.specifier,
        occurrences: record.occurrences,
        fileCount: record.files.size,
        samples: record.samples,
        usage: summarizeUsage(record.usage),
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
    callOccurrenceCount: report.accesses.reduce((total, { usage }) => total + usage.callCount, 0),
    nonCallReferenceCount: report.accesses.reduce((total, { usage }) => total + usage.referenceCount, 0),
    awaitedCallCount: report.accesses.reduce((total, { usage }) => total + usage.awaitedCallCount, 0),
    caughtCallCount: report.accesses.reduce((total, { usage }) => total + usage.caughtCallCount, 0),
    callResultContextCounts: combineCountObjects(report.accesses.map(({ usage }) => usage.resultContexts)),
    dynamicNamespaceAccessCount: report.dynamicNamespaceAccesses.occurrences,
    dynamicNamespaceAccessSamples: report.dynamicNamespaceAccesses.samples,
    unparsedPotentialLegacyAccessCount: report.unparsedPotentialLegacyAccesses.length,
    unparsedPotentialLegacyAccesses: report.unparsedPotentialLegacyAccesses,
    legacySubpathBindingDeclarationCount: report.legacySubpathAccesses.length,
    unusedLegacySubpathBindingCount: report.legacySubpathAccesses.filter(({ occurrences }) => occurrences === 0).length,
    legacySubpathAccessOccurrenceCount: report.legacySubpathAccesses.reduce(
      (total, { occurrences }) => total + occurrences,
      0,
    ),
    legacySubpathCallCount: report.legacySubpathAccesses.reduce((total, { usage }) => total + usage.callCount, 0),
    legacySubpathCaughtCallCount: report.legacySubpathAccesses.reduce(
      (total, { usage }) => total + usage.caughtCallCount,
      0,
    ),
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
    accesses: report.accesses.map(({ access, occurrences, fileCount, usage, disposition }) => ({
      access,
      occurrences,
      fileCount,
      usage,
      disposition,
    })),
    legacySubpathAccesses: report.legacySubpathAccesses.map(
      ({ access, file, local, name, specifier, occurrences, fileCount, usage, disposition }) => ({
        access,
        file,
        local,
        name,
        specifier,
        occurrences,
        fileCount,
        usage,
        disposition,
      }),
    ),
  };
}

function accessRecord(records, key, details = {}) {
  let record = records.get(key);
  if (!record) {
    record = {
      access: details.access ?? key,
      files: new Set(),
      occurrences: 0,
      samples: [],
      usage: createUsageRecord(),
      ...details,
    };
    records.set(key, record);
  }
  return record;
}

function recordAccess(record, relativeFilename, node, ancestors) {
  record.files.add(relativeFilename);
  record.occurrences += 1;
  if (record.samples.length < 5) record.samples.push(`${relativeFilename}:${node.loc.start.line}`);
  recordUsage(record.usage, node, ancestors);
}

function createUsageRecord() {
  return {
    argumentCounts: new Map(),
    awaitedCallCount: 0,
    callCount: 0,
    caughtCallCount: 0,
    referenceContexts: new Map(),
    referenceCount: 0,
    resultContexts: new Map(),
  };
}

function recordUsage(usage, node, ancestors) {
  const parent = ancestors.at(-1);
  if (isCallExpression(parent) && parent.callee === node) {
    usage.callCount += 1;
    increment(usage.argumentCounts, String(parent.arguments.length));
    const result = callResultContext(parent, ancestors.slice(0, -1));
    increment(usage.resultContexts, result.context);
    if (result.awaited) usage.awaitedCallCount += 1;
    if (isWithinTryBlock(ancestors)) usage.caughtCallCount += 1;
    return;
  }
  usage.referenceCount += 1;
  increment(usage.referenceContexts, referenceContext(node, parent));
}

function callResultContext(call, ancestors) {
  let expression = call;
  let index = ancestors.length - 1;
  let awaited = false;
  while (index >= 0 && isTransparentExpressionContainer(ancestors[index], expression)) {
    if (ancestors[index].type === "AwaitExpression") awaited = true;
    expression = ancestors[index];
    index -= 1;
  }
  const container = ancestors[index];
  return { awaited, context: resultContext(expression, container) };
}

function resultContext(expression, container) {
  if (!container) return "top-level";
  if (container.type === "ExpressionStatement") return "discarded";
  if (container.type === "ReturnStatement" || container.type === "YieldExpression") return "returned";
  if (container.type === "ArrowFunctionExpression" && container.body === expression) return "returned";
  if (container.type === "VariableDeclarator" && container.init === expression) return "assigned";
  if (container.type === "AssignmentExpression" && container.right === expression) return "assigned";
  if (container.type === "AssignmentPattern" && container.right === expression) return "defaulted";
  if (
    (container.type === "IfStatement" ||
      container.type === "WhileStatement" ||
      container.type === "DoWhileStatement" ||
      container.type === "SwitchStatement") &&
    container.test === expression
  ) {
    return "condition";
  }
  if (container.type === "ForStatement" && container.test === expression) return "condition";
  if (container.type === "ConditionalExpression") {
    return container.test === expression ? "condition" : "composed";
  }
  if (container.type === "LogicalExpression" || container.type === "SequenceExpression") return "composed";
  if (isCallExpression(container) && container.arguments.includes(expression)) return "argument";
  if (container.type === "NewExpression" && container.arguments.includes(expression)) return "argument";
  if (container.type === "MemberExpression" && container.object === expression) return "chained";
  if (container.type === "OptionalMemberExpression" && container.object === expression) return "chained";
  if (container.type === "JSXExpressionContainer") return "rendered";
  if (
    container.type === "ObjectProperty" ||
    container.type === "ArrayExpression" ||
    container.type === "SpreadElement"
  ) {
    return "collected";
  }
  if (
    container.type === "UnaryExpression" ||
    container.type === "BinaryExpression" ||
    container.type === "TemplateLiteral"
  ) {
    return "transformed";
  }
  return container.type;
}

function referenceContext(node, parent) {
  if (!parent) return "top-level";
  if (parent.type === "AssignmentExpression" && parent.left === node) return "written";
  if (isCallExpression(parent) && parent.arguments.includes(node)) return "argument";
  if (parent.type === "VariableDeclarator" && parent.init === node) return "assigned";
  if (parent.type === "ReturnStatement") return "returned";
  return parent.type;
}

function summarizeUsage(usage) {
  return {
    callCount: usage.callCount,
    referenceCount: usage.referenceCount,
    awaitedCallCount: usage.awaitedCallCount,
    caughtCallCount: usage.caughtCallCount,
    argumentCounts: mapToObject(usage.argumentCounts),
    resultContexts: mapToObject(usage.resultContexts),
    referenceContexts: mapToObject(usage.referenceContexts),
  };
}

function mapToObject(counts) {
  return Object.fromEntries([...counts].sort(([left], [right]) => compareCodeUnits(left, right)));
}

function combineCountObjects(objects) {
  const combined = new Map();
  for (const object of objects) {
    for (const [key, count] of Object.entries(object)) increment(combined, key, count);
  }
  return mapToObject(combined);
}

function increment(counts, key, amount = 1) {
  counts.set(key, (counts.get(key) ?? 0) + amount);
}

function isWithinTryBlock(ancestors) {
  for (let index = 0; index < ancestors.length - 1; index += 1) {
    const ancestor = ancestors[index];
    if (ancestor.type === "TryStatement" && ancestor.block === ancestors[index + 1]) return true;
  }
  return false;
}

function findPotentialLegacyAccesses(source) {
  const pattern =
    /\butils\s*\.\s*(ao|debug|file|http|math|rand|str|time|val)\s*\.\s*([\p{ID_Start}_$][\p{ID_Continue}$]*)/gu;
  const accesses = [];
  for (const match of source.matchAll(pattern)) {
    accesses.push({
      access: `${match[1]}.${match[2]}`,
      line: source.slice(0, match.index).split(/\r?\n/u).length,
    });
  }
  return accesses;
}

function legacyModuleForSpecifier(specifier) {
  const match = /^akashatools\/lib\/([^/]+)$/u.exec(specifier);
  if (!match) return undefined;
  const requested = match[1].endsWith(".js") ? match[1] : `${match[1]}.js`;
  return manifestModules.get(requested.toLowerCase());
}

function memberRootIdentifier(node) {
  let current = node;
  while (isMemberExpression(current)) current = current.object;
  return current?.type === "Identifier" ? current.name : undefined;
}

function isCallExpression(node) {
  return node?.type === "CallExpression" || node?.type === "OptionalCallExpression";
}

function isTransparentExpressionContainer(container, expression) {
  if (!container) return false;
  if (container.type === "AwaitExpression") return container.argument === expression;
  if (container.type === "ChainExpression") return container.expression === expression;
  if (container.type === "ParenthesizedExpression") return container.expression === expression;
  if (
    container.type === "TSAsExpression" ||
    container.type === "TSSatisfiesExpression" ||
    container.type === "TSNonNullExpression" ||
    container.type === "TypeCastExpression"
  ) {
    return container.expression === expression;
  }
  return false;
}

function isIdentifierReference(node, parent) {
  if (!parent) return true;
  if (parent.type === "ImportSpecifier" || parent.type === "ImportDefaultSpecifier") return false;
  if (parent.type === "ImportNamespaceSpecifier") return false;
  if (isMemberExpression(parent) && parent.property === node && !parent.computed) return false;
  if (
    (parent.type === "ObjectProperty" || parent.type === "ObjectMethod" || parent.type === "ClassMethod") &&
    parent.key === node &&
    !parent.computed &&
    !parent.shorthand
  ) {
    return false;
  }
  if (
    (parent.type === "VariableDeclarator" ||
      parent.type === "FunctionDeclaration" ||
      parent.type === "FunctionExpression" ||
      parent.type === "ClassDeclaration" ||
      parent.type === "ClassExpression") &&
    parent.id === node
  ) {
    return false;
  }
  if (
    (parent.type === "FunctionDeclaration" ||
      parent.type === "FunctionExpression" ||
      parent.type === "ArrowFunctionExpression") &&
    parent.params.includes(node)
  ) {
    return false;
  }
  if (parent.type === "CatchClause" && parent.param === node) return false;
  if (parent.type === "LabeledStatement" || parent.type === "BreakStatement" || parent.type === "ContinueStatement") {
    return false;
  }
  if (parent.type.startsWith("TS") && parent.type !== "TSAsExpression" && parent.type !== "TSNonNullExpression") {
    return false;
  }
  return true;
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
