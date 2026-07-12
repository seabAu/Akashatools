import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
const snapshot = JSON.parse(await readFile(new URL("api-surface.snapshot.json", import.meta.url), "utf8"));

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
  const filenames = (await readdir(new URL("../lib/", import.meta.url)))
    .filter((filename) => filename.endsWith(".js") && filename !== "index.js");
  for (const filename of filenames) {
    assert.ok(await import(`${packageJson.name}/lib/${filename}`));
  }
});

test("public runtime keys match the reviewed API snapshot", async () => {
  assert.equal(snapshot.packageVersion, packageJson.version);
  for (const [subpath, expectedKeys] of Object.entries(snapshot.surfaces)) {
    const specifier = subpath === "." ? packageJson.name : `${packageJson.name}/${subpath.slice(2)}`;
    assert.deepEqual(Object.keys(await import(specifier)).sort(), expectedKeys);
  }
});
