import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowUrl = new URL("../.github/workflows/ci.yml", import.meta.url);

test("hosted CI pins action identities and retains the supported runtime gates", async () => {
  const workflow = await readFile(workflowUrl, "utf8");
  const actionReferences = [...workflow.matchAll(/^\s*- uses:\s+([^@\s]+)@([^\s#]+)/gm)].map(
    ([, action, reference]) => ({ action, reference }),
  );

  assert.deepEqual([...new Set(actionReferences.map(({ action }) => action))].sort(), [
    "actions/checkout",
    "actions/setup-node",
  ]);
  assert.equal(actionReferences.length, 4);
  for (const { action, reference } of actionReferences) {
    assert.match(reference, /^[0-9a-f]{40}$/, `${action} must use an immutable full commit SHA`);
  }

  assert.match(workflow, /^permissions:\r?\n\s+contents: read$/m);
  assert.doesNotMatch(workflow, /^\s+id-token:\s+write$/m);
  assert.deepEqual(
    [...workflow.matchAll(/^\s+timeout-minutes:\s+(\d+)$/gm)].map(([, minutes]) => Number(minutes)),
    [20, 30],
  );
  assert.match(workflow, /node-version: \[22, 24\]/);
  assert.match(workflow, /npm run test:coverage/);
  assert.match(workflow, /npm run pack:check/);
  assert.match(workflow, /playwright install --with-deps chromium firefox webkit/);
  assert.match(workflow, /npm run test:browser/);
});
