import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

test("every modern package import preserves built-in constructors and prototypes", async () => {
  const watched = [Array, Array.prototype, Object, Object.prototype, Date, Date.prototype];
  const before = watched.map((target) => Object.getOwnPropertyDescriptors(target));
  const specifiers = [];

  for (const subpath of Object.keys(packageJson.exports)) {
    if (subpath.startsWith("./lib") || subpath === "./package.json") continue;

    if (subpath.endsWith("/*")) {
      const category = subpath.slice(2, -2);
      const entries = await readdir(new URL(`../src/${category}/`, import.meta.url));

      for (const entry of entries) {
        if (entry !== "index.js" && entry.endsWith(".js")) {
          specifiers.push(`${packageJson.name}/${category}/${entry.slice(0, -3)}`);
        }
      }

      continue;
    }

    const specifier = subpath === "." ? packageJson.name : `${packageJson.name}/${subpath.slice(2)}`;
    specifiers.push(specifier);
  }

  await Promise.all(specifiers.map((specifier) => import(specifier)));

  watched.forEach((target, index) => {
    assert.deepEqual(Object.getOwnPropertyDescriptors(target), before[index]);
  });
});
