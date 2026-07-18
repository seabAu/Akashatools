import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const auditScript = fileURLToPath(new URL("../scripts/audit-legacy-consumers.mjs", import.meta.url));

test("legacy consumer audit classifies root and subpath imports against the manifest", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "akashatools-consumer-audit-"));

  try {
    await Promise.all([
      writeFile(
        path.join(root, "consumer.jsx"),
        [
          'import * as utils from "akashatools";',
          "utils.val.isString(value);",
          'utils.ao.deepGetKey(record, "id");',
          'utils["val"].isBool(false);',
          "try { utils.val.isString(value); } catch {}",
          "const validator = utils.val.isString;",
          'const method = "isString";',
          "utils.val[method](value);",
        ].join("\n"),
      ),
      writeFile(
        path.join(root, "modern.ts"),
        'import { isString } from "akashatools/validation";\nconst value: unknown = "ok";\nisString(value);\n',
      ),
      writeFile(path.join(root, "legacy.js"), 'import { isValid } from "akashatools/lib/Val.js";\nisValid("ok");\n'),
      writeFile(path.join(root, "unused.js"), 'import { handleFetch } from "akashatools/lib/Http";\n'),
      writeFile(
        path.join(root, "broken.js"),
        "if (utils.val.isObject(value)) {\n  utils.ao.filterKeys(value, []);\n<<<",
      ),
    ]);

    const result = spawnSync(process.execPath, [auditScript, "--summary", root], {
      encoding: "utf8",
      windowsHide: true,
    });
    assert.equal(result.status, 0, result.stderr);

    const [report] = JSON.parse(result.stdout);
    assert.equal(report.sourceFileCount, 5);
    assert.equal(report.parseFailureCount, 1);
    assert.equal(report.recoverableParseDiagnosticCount, 0);
    assert.equal(report.rootNamespaceImportFileCount, 1);
    assert.equal(report.packageSubpathImportCount, 3);
    assert.equal(report.legacySubpathImportCount, 2);
    assert.equal(report.modernSubpathImportCount, 1);
    assert.equal(report.accessOccurrenceCount, 5);
    assert.equal(report.uniqueAccessCount, 3);
    assert.equal(report.callOccurrenceCount, 4);
    assert.equal(report.nonCallReferenceCount, 1);
    assert.equal(report.awaitedCallCount, 0);
    assert.equal(report.caughtCallCount, 1);
    assert.deepEqual(report.callResultContextCounts, { discarded: 4 });
    assert.equal(report.dynamicNamespaceAccessCount, 1);
    assert.deepEqual(report.dynamicNamespaceAccessSamples, ["consumer.jsx:8"]);
    const isStringAccess = report.accesses.find(({ access }) => access === "val.isString");
    assert.equal(isStringAccess.usage.referenceCount, 1);
    assert.deepEqual(isStringAccess.usage.referenceContexts, { assigned: 1 });
    assert.equal(report.unparsedPotentialLegacyAccessCount, 2);
    assert.deepEqual(report.unparsedPotentialLegacyAccesses, [
      { file: "broken.js", access: "val.isObject", line: 1 },
      { file: "broken.js", access: "ao.filterKeys", line: 2 },
    ]);
    assert.equal(report.legacySubpathBindingDeclarationCount, 2);
    assert.equal(report.unusedLegacySubpathBindingCount, 1);
    assert.equal(report.legacySubpathAccessOccurrenceCount, 1);
    assert.equal(report.legacySubpathCallCount, 1);
    assert.equal(report.legacySubpathCaughtCallCount, 0);
    assert.deepEqual(report.legacySubpathAccesses[0].usage, {
      callCount: 1,
      referenceCount: 0,
      awaitedCallCount: 0,
      caughtCallCount: 0,
      argumentCounts: { 1: 1 },
      resultContexts: { discarded: 1 },
      referenceContexts: {},
    });
    assert.equal(report.directReplacementOccurrenceCount, 5);
    assert.equal(report.relatedOnlyOccurrenceCount, 0);
    assert.equal(report.noCanonicalReferenceOccurrenceCount, 0);
    assert.equal(report.unresolvedManifestOccurrenceCount, 0);

    const countsResult = spawnSync(process.execPath, [auditScript, "--counts-only", root], {
      encoding: "utf8",
      windowsHide: true,
    });
    assert.equal(countsResult.status, 0, countsResult.stderr);
    const [counts] = JSON.parse(countsResult.stdout);
    assert.equal("accesses" in counts, false);
    assert.equal("dynamicNamespaceAccessSamples" in counts, false);
    assert.equal("legacySubpathAccesses" in counts, false);
    assert.equal("unparsedPotentialLegacyAccesses" in counts, false);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});
