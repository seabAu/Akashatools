import assert from "node:assert/strict";
import test from "node:test";

import {
  downloadBlob,
  downloadJson,
  downloadTextFile,
  inputValueFromControl,
  matchesMediaQuery,
  prefersColorScheme,
  readJsonStorage,
  writeJsonStorage,
} from "akashatools/browser";
import { createInputValueParser } from "akashatools/input";

function browserHarness({ clickError, scheduleError } = {}) {
  const events = [];
  const scheduled = [];
  let capturedBlob;
  let capturedFilename;
  const anchor = {
    style: {},
    href: "",
    download: "",
    click() {
      events.push("click");
      capturedFilename = this.download;
      if (clickError) throw clickError;
    },
    remove() {
      events.push("remove");
    },
  };
  return {
    events,
    scheduled,
    get blob() {
      return capturedBlob;
    },
    get filename() {
      return capturedFilename;
    },
    environment: {
      document: /** @type {any} */ ({
        body: {
          append(value) {
            assert.equal(value, anchor);
            events.push("append");
          },
        },
        createElement(name) {
          assert.equal(name, "a");
          events.push("create-anchor");
          return anchor;
        },
      }),
      url: /** @type {any} */ ({
        createObjectURL(blob) {
          capturedBlob = blob;
          events.push("create-url");
          return "blob:test";
        },
        revokeObjectURL(value) {
          assert.equal(value, "blob:test");
          events.push("revoke-url");
        },
      }),
      schedule(callback) {
        events.push("schedule");
        if (scheduleError) throw scheduleError;
        scheduled.push(callback);
      },
    },
  };
}

test("browser downloads remove anchors now and revoke object URLs later", () => {
  const harness = browserHarness();
  downloadBlob("report.txt", new Blob(["report"]), harness.environment);
  assert.deepEqual(harness.events, ["create-url", "create-anchor", "append", "click", "schedule", "remove"]);
  assert.equal(harness.filename, "report.txt");
  assert.equal(harness.scheduled.length, 1);
  harness.scheduled[0]();
  assert.equal(harness.events.at(-1), "revoke-url");
});

test("browser downloads revoke immediately when clicking or scheduling fails", () => {
  const clickFailure = browserHarness({ clickError: new Error("click failed") });
  assert.throws(() => downloadBlob("report.txt", new Blob(), clickFailure.environment), /click failed/);
  assert.deepEqual(clickFailure.events.slice(-2), ["remove", "revoke-url"]);

  const scheduleFailure = browserHarness({ scheduleError: new Error("schedule failed") });
  assert.throws(() => downloadBlob("report.txt", new Blob(), scheduleFailure.environment), /schedule failed/);
  assert.deepEqual(scheduleFailure.events.slice(-2), ["remove", "revoke-url"]);
});

test("browser downloads validate content and browser environment contracts", () => {
  const harness = browserHarness();
  assert.throws(() => downloadBlob("", new Blob(), harness.environment), TypeError);
  assert.throws(() => downloadBlob("report.txt", /** @type {any} */ ("report"), harness.environment), TypeError);
  assert.throws(
    () => downloadBlob("report.txt", new Blob(), { document: /** @type {any} */ ({}), url: harness.environment.url }),
    /browser-like environment/,
  );
  assert.throws(
    () => downloadBlob("report.txt", new Blob(), { ...harness.environment, schedule: /** @type {any} */ (1) }),
    TypeError,
  );
  assert.throws(() => downloadTextFile("report.txt", /** @type {any} */ (1), harness.environment), TypeError);
  assert.throws(() => downloadJson("report", undefined, harness.environment), TypeError);
});

test("text downloads preserve the requested media type", async () => {
  const harness = browserHarness();
  downloadTextFile("notes.md", "# Notes", { ...harness.environment, contentType: "text/markdown;charset=utf-8" });
  assert.equal(harness.filename, "notes.md");
  assert.equal(harness.blob?.type, "text/markdown;charset=utf-8");
  assert.equal(await harness.blob?.text(), "# Notes");
  harness.scheduled[0]();
});

test("JSON downloads normalize one extension and preserve JSON media type", async () => {
  const harness = browserHarness();
  downloadJson("Quarterly Report.JSON", { ok: true }, { ...harness.environment, space: 0 });
  assert.equal(harness.filename, "quarterly-report.json");
  assert.equal(harness.blob?.type, "application/json;charset=utf-8");
  assert.equal(await harness.blob?.text(), '{"ok":true}');
  harness.scheduled[0]();
});

test("inputValueFromControl extracts semantic control values before parsing", () => {
  const parseNumber = createInputValueParser(Number);
  assert.equal(inputValueFromControl(/** @type {any} */ ({ type: "number", value: "12.50" }), parseNumber), 12.5);
  assert.equal(inputValueFromControl(/** @type {any} */ ({ type: "checkbox", checked: false })), false);
  assert.equal(inputValueFromControl(/** @type {any} */ ({ type: "radio", checked: false, value: "one" })), undefined);
  assert.equal(inputValueFromControl(/** @type {any} */ ({ type: "radio", checked: true, value: "one" })), "one");
  assert.deepEqual(
    inputValueFromControl(
      /** @type {any} */ ({ multiple: true, selectedOptions: [{ value: "one" }, { value: "two" }] }),
    ),
    ["one", "two"],
  );

  const firstFile = new Blob(["one"]);
  const secondFile = new Blob(["two"]);
  assert.equal(
    inputValueFromControl(/** @type {any} */ ({ type: "file", files: [firstFile], multiple: false })),
    firstFile,
  );
  assert.deepEqual(
    inputValueFromControl(/** @type {any} */ ({ type: "file", files: [firstFile, secondFile], multiple: true })),
    [firstFile, secondFile],
  );
  assert.throws(
    () =>
      inputValueFromControl(/** @type {any} */ ({ type: "file", files: [firstFile] }), undefined, { maximumItems: 0 }),
    /maximumItems/,
  );
  assert.throws(() => inputValueFromControl(/** @type {any} */ ({ type: "text", value: 1 })), /value must/);
});

test("inputValueFromControl rejects malformed controls and skips absent values", () => {
  let parserCalls = 0;
  const parser = (value) => {
    parserCalls += 1;
    return value;
  };
  assert.equal(inputValueFromControl(/** @type {any} */ ({ type: "radio", checked: false }), parser), undefined);
  assert.equal(
    inputValueFromControl(/** @type {any} */ ({ type: "file", files: [], multiple: false }), parser),
    undefined,
  );
  assert.equal(inputValueFromControl(/** @type {any} */ ({ type: "file", files: null }), parser), undefined);
  assert.equal(parserCalls, 0);

  assert.throws(() => inputValueFromControl(null), /control/);
  assert.throws(() => inputValueFromControl(/** @type {any} */ ({}), /** @type {any} */ (1)), /parser/);
  assert.throws(() => inputValueFromControl(/** @type {any} */ ({}), undefined, /** @type {any} */ ([])), /options/);
  assert.throws(() => inputValueFromControl(/** @type {any} */ ({}), undefined, { maximumItems: -1 }), /maximumItems/);
  assert.throws(() => inputValueFromControl(/** @type {any} */ ({ type: "checkbox" })), /checked/);
  assert.throws(() => inputValueFromControl(/** @type {any} */ ({ type: "file" })), /files/);
  assert.throws(
    () => inputValueFromControl(/** @type {any} */ ({ type: "file", files: { length: -1 } })),
    /array-like/,
  );
  assert.throws(
    () => inputValueFromControl(/** @type {any} */ ({ multiple: true, selectedOptions: { length: -1 } })),
    /array-like/,
  );
  assert.throws(
    () =>
      inputValueFromControl(/** @type {any} */ ({ multiple: true, selectedOptions: [{ value: "one" }] }), undefined, {
        maximumItems: 0,
      }),
    /maximumItems/,
  );
});

test("media-query helpers are late-bound and injectable", () => {
  const queries = [];
  const environment = {
    matchMedia(query) {
      queries.push(query);
      return { matches: query.includes("dark") };
    },
  };
  assert.equal(matchesMediaQuery("(width >= 1px)", environment), false);
  assert.equal(prefersColorScheme("dark", environment), true);
  assert.deepEqual(queries, ["(width >= 1px)", "(prefers-color-scheme: dark)"]);
  assert.throws(() => matchesMediaQuery("", environment), /nonblank/);
  assert.throws(() => prefersColorScheme(/** @type {any} */ ("auto"), environment), /scheme/);
  assert.throws(() => matchesMediaQuery("(color)", { matchMedia: /** @type {any} */ (() => ({})) }), /boolean matches/);
  assert.throws(() => matchesMediaQuery("(color)"), /requires a browser-like/);
  assert.throws(() => matchesMediaQuery("x".repeat(10_001), environment), /10000/);
  assert.throws(() => matchesMediaQuery("(color)", /** @type {any} */ ([])), /plain object/);
});

test("JSON storage helpers use explicit storage and strict bounded data", () => {
  const values = new Map();
  const storage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
  assert.equal(
    writeJsonStorage(storage, "settings", { theme: "dark", active: false }),
    '{"theme":"dark","active":false}',
  );
  assert.deepEqual(readJsonStorage(storage, "settings"), { theme: "dark", active: false });
  assert.deepEqual(readJsonStorage(storage, "missing", { fallback: { first: true } }), { first: true });

  let getterCalls = 0;
  const active = {};
  Object.defineProperty(active, "secret", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "secret";
    },
  });
  assert.throws(() => writeJsonStorage(storage, "active", active), /accessors/);
  assert.equal(getterCalls, 0);
  assert.throws(() => writeJsonStorage(storage, "large", "é", { maximumBytes: 3 }), /maximumBytes/);
  values.set("broken", "{");
  assert.throws(() => readJsonStorage(storage, "broken"), /valid JSON/);
  values.set("deep", `${"[".repeat(101)}0${"]".repeat(101)}`);
  assert.throws(() => readJsonStorage(storage, "deep"), /maximumDepth/);
});

test("JSON storage validates adapters and preserves operational errors", () => {
  assert.throws(() => readJsonStorage(/** @type {any} */ ({}), "key"), /getItem/);
  assert.throws(() => writeJsonStorage(/** @type {any} */ ({}), "key", null), /setItem/);
  assert.throws(() => readJsonStorage({ getItem: () => null }, /** @type {any} */ (1)), /key/);
  assert.throws(() => readJsonStorage({ getItem: () => null }, "x".repeat(10_001)), /10000/);
  assert.throws(() => readJsonStorage({ getItem: () => null }, "key", { maximumBytes: -1 }), /maximumBytes/);
  assert.throws(() => readJsonStorage(/** @type {any} */ ({ getItem: () => 1 }), "key"), /string or null/);
  assert.throws(() => readJsonStorage({ getItem: () => '"é"' }, "key", { maximumBytes: 3 }), /maximumBytes/);

  const readFailure = new Error("storage read failed");
  assert.throws(
    () =>
      readJsonStorage(
        {
          getItem: () => {
            throw readFailure;
          },
        },
        "key",
      ),
    (error) => error === readFailure,
  );
  const writeFailure = new Error("storage write failed");
  assert.throws(
    () =>
      writeJsonStorage(
        {
          setItem: () => {
            throw writeFailure;
          },
        },
        "key",
        null,
      ),
    (error) => error === writeFailure,
  );
});
