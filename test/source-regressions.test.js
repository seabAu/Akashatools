import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { compact, groupBy, moveItem, removeFromArray, unique } from "akashatools/array";
import { createSingleFlight } from "akashatools/async";
import { matchesMediaQuery, readJsonStorage } from "akashatools/browser";
import { fromUnixSeconds, toUnixSeconds } from "akashatools/date";
import { isWithinGeoDistance, normalizeGeoPosition } from "akashatools/geo";
import { parseContentDispositionFilename } from "akashatools/http";
import { parseInputValue } from "akashatools/input";
import { resolveContainedPath } from "akashatools/node";
import { cloneJson, deepMerge, getAtPath, setAtPath } from "akashatools/object";
import { replaceMany, splitTextByLimits, stableJson } from "akashatools/string";
import { normalizePortableRelativePath, normalizePortableRelativePaths } from "akashatools/validation";

test("source regressions: array transforms preserve falsy data and expose invalid operations", () => {
  assert.deepEqual(compact([0, false, "", null, undefined, 1]), [0, false, "", 1]);
  assert.deepEqual(moveItem(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
  assert.throws(() => moveItem(["a"], 0, 2), RangeError);
  assert.deepEqual(removeFromArray(["a", "b", "a"], "a", { all: true }), ["b"]);

  const failure = new Error("selector failed");
  assert.throws(
    () =>
      unique([{ id: 1 }], () => {
        throw failure;
      }),
    (error) => error === failure,
  );
});

test("source regressions: grouping retains key identity instead of object-key coercion", () => {
  const left = { name: "left" };
  const right = { name: "right" };
  const grouped = groupBy(
    [
      { key: left, value: 1 },
      { key: right, value: 2 },
    ],
    ({ key }) => key,
  );
  assert.equal(grouped.size, 2);
  assert.deepEqual(
    grouped.get(left)?.map(({ value }) => value),
    [1],
  );
  assert.deepEqual(
    grouped.get(right)?.map(({ value }) => value),
    [2],
  );
});

test("source regressions: nested access is own-only, immutable, and pollution resistant", () => {
  const inherited = Object.create({ hidden: "prototype" });
  inherited.visible = { count: 0 };
  assert.equal(getAtPath(inherited, "hidden", "missing"), "missing");
  assert.equal(getAtPath(inherited, "visible.count", "missing"), 0);

  const updated = setAtPath(inherited, "visible.enabled", false);
  assert.deepEqual(updated.visible, { count: 0, enabled: false });
  assert.deepEqual(inherited.visible, { count: 0 });
  assert.throws(() => setAtPath({}, "__proto__.polluted", true), TypeError);
  assert.equal({}.polluted, undefined);
});

test("source regressions: deep merge preserves explicit falsy values and rejects active properties", () => {
  const defaults = { enabled: true, retries: 3, nested: { label: "default", count: 2 } };
  assert.deepEqual(deepMerge(defaults, { enabled: false, retries: 0, nested: { label: "" } }), {
    enabled: false,
    retries: 0,
    nested: { label: "", count: 2 },
  });

  const active = {};
  Object.defineProperty(active, "secret", { enumerable: true, get: () => "read" });
  assert.throws(() => deepMerge({}, active), TypeError);
});

test("source regressions: JSON operations reject silent loss and active semantics", () => {
  assert.equal(stableJson({ z: 1, a: 2 }), '{"a":2,"z":1}');
  assert.throws(() => stableJson({ unsupported: undefined }), TypeError);

  let getterCalls = 0;
  const active = {};
  Object.defineProperty(active, "secret", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "read";
    },
  });
  assert.throws(() => cloneJson(active), TypeError);
  assert.equal(getterCalls, 0);
});

test("source regressions: replacement strings are literal unless regex behavior is explicit", () => {
  assert.equal(replaceMany("a.b a-b", { ".": "_", "a-": "x" }), "a_b xb");
  assert.equal(replaceMany("$1.$1", { $1: "value" }), "value.value");
});

test("source regressions: Unix-second helpers cannot silently use milliseconds", () => {
  const instant = new Date("2026-07-16T12:34:56.789Z");
  const seconds = toUnixSeconds(instant);
  assert.equal(seconds, Math.trunc(instant.getTime() / 1_000));
  assert.equal(fromUnixSeconds(seconds).getTime(), Math.trunc(instant.getTime() / 1_000) * 1_000);
  assert.notEqual(seconds, instant.getTime());
});

test("source regressions: response filenames and filesystem paths cannot escape their boundary", () => {
  assert.equal(parseContentDispositionFilename('attachment; filename="../../CON.txt"'), "file-CON.txt");
  assert.equal(
    parseContentDispositionFilename("attachment; filename*=UTF-8''portfolio%20backup.json.gz"),
    "portfolio backup.json.gz",
  );

  const root = path.resolve("storage");
  assert.equal(resolveContainedPath(root, "exports/report.json"), path.join(root, "exports", "report.json"));
  assert.throws(() => resolveContainedPath(root, "../secret.json"), RangeError);
  assert.equal(normalizePortableRelativePath("exports/report.json"), "exports/report.json");
  assert.throws(() => normalizePortableRelativePath("../secret.json"), TypeError);
  assert.throws(() => normalizePortableRelativePaths(["Files/A.txt", "files/a.TXT"]), RangeError);
});

test("source regressions: invalidated single-flight generations cannot repopulate cache", async () => {
  const resolvers = [];
  const loader = createSingleFlight(() => new Promise((resolve) => resolvers.push(resolve)), { ttl: Infinity });
  const stale = loader.load();
  await Promise.resolve();
  loader.invalidate();
  const current = loader.load();
  await Promise.resolve();
  resolvers[0]("stale");
  resolvers[1]("current");
  assert.equal(await stale, "stale");
  assert.equal(await current, "current");
  assert.equal(await loader.load(), "current");
});

test("source regressions: semantic chunks preserve whitespace and Unicode code points", () => {
  const source = "First sentence.  Second écho.\n\n🙂🙂🙂🙂";
  const chunks = splitTextByLimits(source, { maximumBytes: 16, maximumWords: 3 });
  assert.equal(chunks.join(""), source);
  assert.equal(
    chunks.every((chunk) => !chunk.includes("�")),
    true,
  );
  assert.equal(
    chunks.every((chunk) => Buffer.byteLength(chunk) <= 16),
    true,
  );
});

test("source regressions: excepted geo, input, media, and storage intent is strict and late-bound", () => {
  assert.deepEqual(normalizeGeoPosition({ lat: 40.7, lng: -74 }), [-74, 40.7]);
  assert.equal(isWithinGeoDistance([0, 0], [0, 0.001], 112), true);
  assert.equal(isWithinGeoDistance([0, 0], [0, 0.001], 111), false);
  assert.equal(parseInputValue("12.50", Number), 12.5);
  assert.equal(parseInputValue("false", Boolean), false);
  assert.throws(() => parseInputValue("2026-07-18T12:30", Date), /dateAssumption/);
  assert.equal(matchesMediaQuery("(prefers-color-scheme: dark)", { matchMedia: () => ({ matches: true }) }), true);
  assert.deepEqual(readJsonStorage({ getItem: () => '{"active":false,"count":0}' }, "settings"), {
    active: false,
    count: 0,
  });
});
