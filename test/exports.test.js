import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
const snapshot = JSON.parse(await readFile(new URL("api-surface.snapshot.json", import.meta.url), "utf8"));
const granularCategories = [
  "array",
  "async",
  "browser",
  "collection",
  "data",
  "date",
  "http",
  "hash",
  "input",
  "number",
  "object",
  "random",
  "sort",
  "string",
  "validation",
  "node",
];

test("every fixed export target resolves and modern surfaces expose declarations", async () => {
  for (const [subpath, target] of Object.entries(packageJson.exports)) {
    if (subpath.includes("*")) continue;
    for (const relativeTarget of typeof target === "string" ? [target] : Object.values(target)) {
      await access(new URL(relativeTarget, root));
    }
    if (subpath === "./package.json") continue;
    const specifier = subpath === "." ? packageJson.name : `${packageJson.name}/${subpath.slice(2)}`;
    assert.ok(await import(specifier));
    if (!subpath.startsWith("./lib")) {
      assert.equal(typeof target, "object");
      assert.match(target.types, /^\.\/types\/.+\.d\.ts$/);
      assert.match(target.import, /^\.\/src\/.+\.js$/);
    }
  }
});

test("legacy wildcard exports resolve every retained JavaScript module", async () => {
  const filenames = (await readdir(new URL("../lib/", import.meta.url))).filter(
    (filename) => filename.endsWith(".js") && filename !== "index.js",
  );
  for (const filename of filenames) {
    assert.ok(await import(`${packageJson.name}/lib/${filename}`));
  }
});

test("every generated granular method entry resolves with canonical identity and declarations", async () => {
  for (const category of granularCategories) {
    const categoryModule = await import(`${packageJson.name}/${category}`);
    const exportPattern = packageJson.exports[`./${category}/*`];
    assert.equal(typeof exportPattern, "object");

    for (const name of Object.keys(categoryModule)) {
      const methodModule = await import(`${packageJson.name}/${category}/${name}`);
      assert.deepEqual(Object.keys(methodModule).sort(), ["default", name].sort());
      assert.equal(methodModule.default, categoryModule[name]);
      assert.equal(methodModule[name], categoryModule[name]);
      await access(new URL(exportPattern.types.replace("*", name), root));
      await access(new URL(exportPattern.import.replace("*", name), root));
    }
  }
});

test("public runtime keys match the reviewed API snapshot", async () => {
  assert.equal(snapshot.packageVersion, packageJson.version);
  for (const [subpath, expectedKeys] of Object.entries(snapshot.surfaces)) {
    const specifier = subpath === "." ? packageJson.name : `${packageJson.name}/${subpath.slice(2)}`;
    assert.deepEqual(Object.keys(await import(specifier)).sort(), expectedKeys);
  }
});
