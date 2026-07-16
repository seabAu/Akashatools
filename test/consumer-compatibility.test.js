import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
  serializeComposrCheckpoint,
  settleComposrWork,
  summarizeComposrTransitions,
  toComposrSafeFilename,
  updateComposrRecords,
} from "../fixtures/consumers/composr.js";
import {
  createMindspaceClientId,
  prepareMindspaceTaskView,
  presentMindspaceTime,
} from "../fixtures/consumers/mindspace-client.js";
import {
  mergeMindspaceSettings,
  prepareMindspacePayload,
  resolveMindspaceMediaPath,
} from "../fixtures/consumers/mindspace-server.js";
import {
  createPortfolioKeyedSingleFlight,
  createPortfolioSingleFlight,
  describePortfolioDownload,
} from "../fixtures/consumers/portfolio.js";
import { planSplicrText } from "../fixtures/consumers/splicr.js";

test("Mindspace client fixture preserves immutable task and time-display workflows", () => {
  const source = [
    { id: "one", status: "open" },
    { id: "two", status: "done" },
    { id: "one", status: "duplicate" },
    { id: "three", status: "open" },
  ];
  const view = prepareMindspaceTaskView(source, 2, 2, 0);

  assert.deepEqual(
    view.pages.map((page) => page.map(({ id }) => id)),
    [["three", "one"], ["two"]],
  );
  assert.deepEqual(
    [...view.groups].map(([status, tasks]) => [status, tasks.map(({ id }) => id)]),
    [
      ["open", ["three", "one"]],
      ["done", ["two"]],
    ],
  );
  assert.equal(source.length, 4);
  assert.deepEqual(presentMindspaceTime(125, "2026-07-17T12:00:00Z", "2026-07-16T12:00:00Z"), {
    duration: "2h 5m",
    relative: "tomorrow",
  });

  const identifier = createMindspaceClientId("install request");
  assert.match(identifier, /^install-request-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u);
});

test("Mindspace server fixture bounds JSON, merges safely, and contains media paths", () => {
  const payload = { title: "Reminder", enabled: false, nested: { count: 0 }, ignored: "app-only" };
  const prepared = prepareMindspacePayload(payload, ["title", "enabled", "nested"], { maximumBytes: 200 });
  assert.deepEqual(prepared, { title: "Reminder", enabled: false, nested: { count: 0 } });
  assert.notEqual(prepared.nested, payload.nested);

  const defaults = { enabled: true, limits: { retries: 3, timeout: 100 } };
  const merged = mergeMindspaceSettings(defaults, { enabled: false, limits: { retries: 0 } });
  assert.deepEqual(merged, { enabled: false, limits: { retries: 0, timeout: 100 } });
  assert.deepEqual(defaults, { enabled: true, limits: { retries: 3, timeout: 100 } });

  const mediaRoot = path.resolve("mindspace-media");
  assert.equal(resolveMindspaceMediaPath(mediaRoot, "users/avatar.png"), path.join(mediaRoot, "users", "avatar.png"));
  assert.throws(() => resolveMindspaceMediaPath(mediaRoot, "../secret.txt"), RangeError);
  const active = {};
  Object.defineProperty(active, "secret", { enumerable: true, get: () => "read" });
  assert.throws(() => prepareMindspacePayload(active, ["secret"]), TypeError);
});

test("portfolio fixture preserves loader, file-size, and response-filename contracts", async () => {
  let currentTime = 1_000;
  let calls = 0;
  const loader = createPortfolioSingleFlight(
    async () => {
      calls += 1;
      return calls;
    },
    100,
    () => currentTime,
  );
  assert.deepEqual(await Promise.all([loader.load(), loader.load()]), [1, 1]);
  assert.equal(await loader.load(), 1);
  currentTime += 101;
  assert.equal(await loader.load(), 2);
  loader.invalidate();
  assert.equal(await loader.load(), 3);

  const keyedCalls = [];
  const keyed = createPortfolioKeyedSingleFlight(
    async (key) => {
      keyedCalls.push(key);
      return `${key}-${keyedCalls.length}`;
    },
    Infinity,
    Date.now,
    () => true,
    2,
  );
  assert.equal(await keyed.load("project"), "project-1");
  assert.equal(await keyed.load("project"), "project-1");
  assert.equal(await keyed.load("media"), "media-2");
  assert.equal(keyed.invalidate("project"), true);
  assert.equal(await keyed.load("project"), "project-3");

  assert.deepEqual(describePortfolioDownload('attachment; filename="portfolio export.json.gz"', "fallback.gz", 1_500), {
    filename: "portfolio export.json.gz",
    size: "1.5 KB",
  });
  assert.deepEqual(
    describePortfolioDownload("attachment; filename*=UTF-8''portfolio%20backup.json.gz", "fallback.gz", 12_000_000),
    { filename: "portfolio backup.json.gz", size: "12 MB" },
  );
  assert.equal(
    describePortfolioDownload("attachment; filename=../unsafe.json", "fallback.gz", 999).filename,
    "unsafe.json",
  );
});

test("COMPOSR fixture preserves settled work, immutable records, checkpoints, and summaries", async () => {
  const source = [1, 2, 3, 4];
  const work = await settleComposrWork(source, 2, async (value) => {
    if (value === 3) throw new Error("three");
    return value * 2;
  });
  assert.deepEqual(
    work.settled.map((result) => result.status),
    ["fulfilled", "fulfilled", "rejected", "fulfilled"],
  );
  assert.deepEqual(work.fulfilled, [2, 4, 8]);
  assert.deepEqual(source, [1, 2, 3, 4]);

  const records = [{ id: "one", value: 1 }];
  assert.deepEqual(updateComposrRecords(records, { id: "two", value: 2 }), [
    { id: "two", value: 2 },
    { id: "one", value: 1 },
  ]);
  assert.deepEqual(updateComposrRecords(records, { id: "one", value: 2 }, new Set(["one"])), []);
  assert.deepEqual(records, [{ id: "one", value: 1 }]);

  assert.equal(serializeComposrCheckpoint({ z: 1, a: { z: 2, a: 1 } }), '{"a":{"a":1,"z":2},"z":1}');
  assert.deepEqual(summarizeComposrTransitions([10, 20, 30, 40]), {
    count: 4,
    minimum: 10,
    maximum: 40,
    median: 25,
    p75: 32.5,
    p95: 38.5,
    mean: 25,
    standardDeviation: Math.sqrt(125),
  });
  assert.equal(toComposrSafeFilename("  My Profile / July  "), "my-profile-july");
  assert.equal(toComposrSafeFilename("***", "fallback"), "fallback");
});

test("SPLICR fixture preserves source offsets under byte, word, and provider limits", () => {
  const text = "Alpha beta gamma.\n\nDelta écho foxtrot.\n\nGolf hotel india.";
  const plan = planSplicrText(text, { maximumBytes: 42, maximumWords: 6 });
  assert.equal(plan.chunks.map(({ text: chunkText }) => chunkText).join(""), text);
  assert.equal(plan.totalBytes, Buffer.byteLength(text));
  assert.equal(plan.totalWords, 9);
  assert.equal(plan.chunks.length >= 2, true);
  for (const chunk of plan.chunks) {
    assert.equal(chunk.byteCount <= 42, true);
    assert.equal(chunk.wordCount <= 6, true);
    assert.equal(text.slice(chunk.startChar, chunk.endChar), chunk.text);
  }

  const sentences = planSplicrText("First sentence is here. Second sentence is here. Third sentence is here.", {
    maximumBytes: 30,
    maximumWords: 20,
  });
  assert.deepEqual(
    sentences.chunks.map(({ text: chunkText }) => chunkText.trim()),
    ["First sentence is here.", "Second sentence is here.", "Third sentence is here."],
  );

  const emoji = "🙂".repeat(11);
  const emojiPlan = planSplicrText(emoji, { maximumBytes: 12, maximumWords: 10 });
  assert.equal(emojiPlan.chunks.map(({ text: chunkText }) => chunkText).join(""), emoji);
  assert.equal(
    emojiPlan.chunks.every(({ byteCount }) => byteCount <= 12),
    true,
  );
  assert.throws(() => planSplicrText(" \n\t "), /non-whitespace/u);

  const providerPlan = planSplicrText("Alpha beta. Gamma delta. Epsilon zeta.", {
    maximumBytes: 1_000,
    maximumWords: 1_000,
    maximumCost: 20,
    measureCost: (value) => value.length + 10,
  });
  assert.equal(providerPlan.chunks.length > 1, true);
  assert.equal(
    providerPlan.chunks.every(({ text: chunkText }) => chunkText.length + 10 <= 20),
    true,
  );
});
