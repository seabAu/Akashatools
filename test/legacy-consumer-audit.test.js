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
        ].join("\n"),
      ),
      writeFile(
        path.join(root, "modern.ts"),
        'import { isString } from "akashatools/validation";\nconst value: unknown = "ok";\nisString(value);\n',
      ),
      writeFile(path.join(root, "legacy.js"), 'import { isValid } from "akashatools/lib/Val.js";\nisValid("ok");\n'),
    ]);

    const result = spawnSync(process.execPath, [auditScript, "--summary", root], {
      encoding: "utf8",
      windowsHide: true,
    });
    assert.equal(result.status, 0, result.stderr);

    const [report] = JSON.parse(result.stdout);
    assert.equal(report.sourceFileCount, 3);
    assert.equal(report.parseFailureCount, 0);
    assert.equal(report.recoverableParseDiagnosticCount, 0);
    assert.equal(report.rootNamespaceImportFileCount, 1);
    assert.equal(report.packageSubpathImportCount, 2);
    assert.equal(report.legacySubpathImportCount, 1);
    assert.equal(report.modernSubpathImportCount, 1);
    assert.equal(report.accessOccurrenceCount, 3);
    assert.equal(report.uniqueAccessCount, 3);
    assert.equal(report.directReplacementOccurrenceCount, 3);
    assert.equal(report.relatedOnlyOccurrenceCount, 0);
    assert.equal(report.noCanonicalReferenceOccurrenceCount, 0);
    assert.equal(report.unresolvedManifestOccurrenceCount, 0);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});
