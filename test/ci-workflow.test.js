import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import {
  checkDocumentationIntegrity,
  githubHeadingSlug,
  markdownHeadingAnchors,
  markdownLinks,
} from "../scripts/check-documentation-integrity.mjs";
import { checkReadmeExamples, extractJavascriptExamples } from "../scripts/check-readme-examples.mjs";

const workflowUrl = new URL("../.github/workflows/ci.yml", import.meta.url);
const packageUrl = new URL("../package.json", import.meta.url);

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

  const packageJson = JSON.parse(await readFile(packageUrl, "utf8"));
  assert.equal(packageJson.scripts["check:hygiene"], "node scripts/check-release-hygiene.mjs");
  assert.equal(packageJson.scripts["check:markdown"], "node scripts/check-documentation-integrity.mjs");
  assert.equal(packageJson.scripts["check:readme"], "node scripts/check-readme-examples.mjs");
  assert.match(packageJson.scripts.check, /node --run check:hygiene/);
  assert.match(packageJson.scripts.check, /node --run check:markdown/);
  assert.match(packageJson.scripts.check, /node --run check:readme/);
});

test("documentation integrity helpers follow packaged Markdown link semantics", () => {
  assert.equal(githubHeadingSlug("`file.js` (7 exports)"), "filejs-7-exports");
  assert.deepEqual(
    [...markdownHeadingAnchors("# Same heading\n```md\n# Ignored\n```\n# Same heading\n")],
    ["same-heading", "same-heading-1"],
  );
  assert.deepEqual(
    markdownLinks(
      "[local](./guide.md#setup) ![image](./image.png) `[ignored](./inline.md)`\n```md\n[ignored](./fenced.md)\n```\n[external](https://example.com)",
    ).map(({ destination }) => destination),
    ["./guide.md#setup", "./image.png", "https://example.com"],
  );
  assert.deepEqual(extractJavascriptExamples("```js\nimport value from 'package';\n```\n```sh\nnpm test\n```\n"), [
    { source: "import value from 'package';\n", line: 2 },
  ]);
});

test("documentation integrity rejects escaping and missing package links", async () => {
  const root = await mkdtemp(join(tmpdir(), "akashatools-markdown-"));
  try {
    await mkdir(join(root, "docs"));
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({ files: ["CHANGELOG.md", "README.md", "docs"] }),
      "utf8",
    );
    await writeFile(join(root, "CHANGELOG.md"), "# Changes\n", "utf8");
    await writeFile(
      join(root, "README.md"),
      [
        "# Fixture",
        "",
        "[valid](docs/guide.md#setup)",
        "[missing](docs/missing.md)",
        "[escaping](../outside.md)",
        "[absolute](C:/outside.md)",
        "",
      ].join("\n"),
      "utf8",
    );
    await writeFile(join(root, "docs", "guide.md"), "# Setup\n", "utf8");

    const result = await checkDocumentationIntegrity(pathToFileURL(`${root}${sep}`));
    assert.equal(result.fileCount, 3);
    assert.equal(result.localLinkCount, 4);
    assert.equal(result.fragmentCount, 1);
    assert.equal(result.failures.length, 3);
    assert.match(result.failures[0], /links to a missing path/u);
    assert.match(result.failures[1], /escapes the package root/u);
    assert.match(result.failures[2], /uses an absolute filesystem path/u);

    const examplesPath = join(root, "examples.md");
    await writeFile(examplesPath, '```js\nimport value, { good, missing } from "akashatools/example";\n```\n', "utf8");
    const readmeResult = await checkReadmeExamples(pathToFileURL(examplesPath), async (specifier) => {
      assert.equal(specifier, "akashatools/example");
      return { default: true, good: true };
    });
    assert.equal(readmeResult.exampleCount, 1);
    assert.equal(readmeResult.importCount, 1);
    assert.equal(readmeResult.bindingCount, 3);
    assert.equal(readmeResult.failures.length, 1);
    assert.match(readmeResult.failures[0], /imports missing "missing"/u);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});
