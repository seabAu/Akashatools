import assert from "node:assert/strict";
import test from "node:test";

import { downloadBlob, downloadJson, downloadTextFile } from "akashatools/browser";

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
    remove() { events.push("remove"); },
  };
  return {
    events,
    scheduled,
    get blob() { return capturedBlob; },
    get filename() { return capturedFilename; },
    environment: {
      document: /** @type {any} */ ({
        body: { append(value) { assert.equal(value, anchor); events.push("append"); } },
        createElement(name) { assert.equal(name, "a"); events.push("create-anchor"); return anchor; },
      }),
      url: /** @type {any} */ ({
        createObjectURL(blob) { capturedBlob = blob; events.push("create-url"); return "blob:test"; },
        revokeObjectURL(value) { assert.equal(value, "blob:test"); events.push("revoke-url"); },
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
  assert.throws(() => downloadBlob("report.txt", new Blob(), { document: /** @type {any} */ ({}), url: harness.environment.url }), /browser-like environment/);
  assert.throws(() => downloadBlob("report.txt", new Blob(), { ...harness.environment, schedule: /** @type {any} */ (1) }), TypeError);
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
