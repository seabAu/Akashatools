import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { API } from "typescript/unstable/sync";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporaryDirectory = path.join(root, ".completion-check");
const expectations = [
  ["array", "akasha.array.", ["chunk", "removeFromArray", "shuffle"]],
  ["validation", "akasha.validation.", ["isEmail", "isJson", "isPlainObjectArray"]],
  ["http", "akasha.http.", ["HttpError", "redactHeaders", "request"]],
  ["flat", "akasha.", ["chunk", "isEmail", "request"]],
];
const files = [];

await rm(temporaryDirectory, { recursive: true, force: true });
await mkdir(temporaryDirectory);
try {
  for (const extension of ["js", "ts"]) {
    for (const [label, expression, expected] of expectations) {
      const filename = path.join(temporaryDirectory, `${label}.${extension}`);
      const text = `import akasha from "akashatools";\n${expression}`;
      await writeFile(filename, text);
      files.push({ filename, position: text.length, expected, label: `${extension}:${label}` });
    }
  }
  const configFile = path.join(temporaryDirectory, "tsconfig.json");
  await writeFile(configFile, JSON.stringify({
    compilerOptions: {
      allowJs: true,
      checkJs: true,
      strict: true,
      noEmit: true,
      target: "ES2023",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      types: ["node"],
      lib: ["ES2023", "DOM"],
    },
    include: ["*.js", "*.ts"],
  }));

  const api = new API({ cwd: root });
  let snapshot;
  try {
    snapshot = api.updateSnapshot({ openProjects: [configFile], openFiles: files.map(({ filename }) => filename) });
    for (const { filename, position, expected, label } of files) {
      const project = snapshot.getDefaultProjectForFile(filename);
      assert.ok(project, `${label} did not resolve to a TypeScript project`);
      const names = new Set(project.checker.getCompletionsAtPosition(filename, position, {})?.entries.map(({ name }) => name) ?? []);
      for (const name of expected) assert.ok(names.has(name), `${label} completion is missing ${name}`);
    }
  } finally {
    snapshot?.dispose();
    api.close();
  }
  console.log("VS Code-compatible JavaScript and TypeScript namespace completions passed.");
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
