import assert from "node:assert/strict";
import { mkdir, mkdtemp, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path, { posix, win32 } from "node:path";
import test from "node:test";

import * as root from "akashatools";
import { resolveContainedPath, resolveExistingContainedPath } from "akashatools/node";
import { resolveContainedPathWith } from "../src/internal/contained-path.js";

test("Node-only paths resolve lexically without leaking into the universal root", () => {
  const storageRoot = path.resolve("storage-root");
  assert.equal(
    resolveContainedPath(storageRoot, path.join("2026", "report.pdf")),
    path.join(storageRoot, "2026", "report.pdf"),
  );
  assert.throws(() => resolveContainedPath(storageRoot, path.join("..", "secret.txt")), RangeError);
  assert.throws(() => resolveContainedPath(storageRoot, path.resolve("secret.txt")), TypeError);
  assert.throws(() => resolveContainedPath(storageRoot, "bad\0name"), TypeError);
  assert.equal(Object.hasOwn(root, "resolveContainedPath"), false);
  assert.equal(Object.hasOwn(root.akasha, "node"), false);
});

test("contained paths honor POSIX and Windows roots, separators, drives, UNC, and case rules", () => {
  assert.equal(
    resolveContainedPathWith("/srv/Media", "2026/07/file.pdf", posix),
    "/srv/Media/2026/07/file.pdf",
  );
  assert.throws(() => resolveContainedPathWith("/srv/Media", "../media/file.pdf", posix), RangeError);

  assert.equal(
    resolveContainedPathWith("C:\\Media", "2026\\07\\file.pdf", win32),
    "C:\\Media\\2026\\07\\file.pdf",
  );
  assert.equal(
    resolveContainedPathWith("C:\\Media", "..\\MEDIA\\file.pdf", win32),
    "C:\\MEDIA\\file.pdf",
  );
  for (const candidate of ["D:\\secret.txt", "C:drive-relative.txt", "\\\\server\\share\\file.pdf"]) {
    assert.throws(() => resolveContainedPathWith("C:\\Media", candidate, win32), TypeError);
  }
  assert.throws(() => resolveContainedPathWith("C:\\Media", "..\\Media2\\file.pdf", win32), RangeError);
});

test("existing-path containment follows symlinks and rejects an outside target", async (context) => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "akashatools-node-"));
  context.after(() => rm(temporaryRoot, { recursive: true, force: true }));

  const storageRoot = path.join(temporaryRoot, "storage");
  const outsideRoot = path.join(temporaryRoot, "outside");
  await Promise.all([mkdir(storageRoot), mkdir(outsideRoot)]);
  await Promise.all([
    writeFile(path.join(storageRoot, "inside.txt"), "inside"),
    writeFile(path.join(outsideRoot, "outside.txt"), "outside"),
  ]);

  assert.equal(
    await resolveExistingContainedPath(storageRoot, "inside.txt"),
    await realpath(path.join(storageRoot, "inside.txt")),
  );

  await symlink(outsideRoot, path.join(storageRoot, "escape"), process.platform === "win32" ? "junction" : "dir");
  await assert.rejects(
    resolveExistingContainedPath(storageRoot, path.join("escape", "outside.txt")),
    RangeError,
  );
});
