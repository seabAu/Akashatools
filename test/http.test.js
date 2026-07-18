import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";

import { HttpError, parseContentDispositionFilename, parseRetryAfter, redactHeaders, request } from "akashatools/http";

test("Retry-After parses standard integer delays and all HTTP date forms", () => {
  const now = Date.UTC(1994, 10, 6, 8, 49, 7);
  assert.equal(parseRetryAfter("120", { now }), 120);
  assert.equal(parseRetryAfter(" Sun, 06 Nov 1994 08:49:37 GMT ", { now }), 30);
  assert.equal(parseRetryAfter("Sunday, 06-Nov-94 08:49:37 GMT", { now }), 30);
  assert.equal(parseRetryAfter("Sun Nov  6 08:49:37 1994", { now }), 30);
  assert.equal(parseRetryAfter("Sun, 06 Nov 1994 08:48:37 GMT", { now }), 0);
});

test("Retry-After keeps fractional API compatibility and caps separate from retry policy", () => {
  assert.equal(parseRetryAfter("7.5"), undefined);
  assert.equal(parseRetryAfter("7.5", { allowFractionalSeconds: true }), 7.5);
  assert.equal(parseRetryAfter("999", { maximumDelaySeconds: 10 }), 10);
  assert.equal(parseRetryAfter("9".repeat(100), { maximumDelaySeconds: 10 }), 10);
  assert.equal(parseRetryAfter("9".repeat(100)), undefined);
  assert.equal(parseRetryAfter(null), undefined);
  assert.equal(parseRetryAfter("  "), undefined);
});

test("Retry-After rejects malformed dates and invalid parser contracts", () => {
  const now = Date.UTC(1994, 10, 6, 8, 49, 7);
  assert.equal(parseRetryAfter("Monday, 06-Nov-94 08:49:37 GMT", { now }), undefined);
  assert.equal(parseRetryAfter("Sun, 31 Feb 1994 08:49:37 GMT", { now }), undefined);
  assert.equal(parseRetryAfter("Sun, 06 Nov 1994 25:49:37 GMT", { now }), undefined);
  assert.equal(parseRetryAfter("+7", { now }), undefined);
  assert.equal(parseRetryAfter("7e2", { now }), undefined);
  assert.throws(() => parseRetryAfter(/** @type {any} */ (1)), TypeError);
  assert.throws(() => parseRetryAfter("1", /** @type {any} */ ([])), TypeError);
  assert.throws(() => parseRetryAfter("1", { now: Number.NaN }), TypeError);
  assert.throws(() => parseRetryAfter("1", { now: Number.MAX_VALUE }), RangeError);
  assert.throws(() => parseRetryAfter("1", { maximumDelaySeconds: -1 }), RangeError);
  assert.throws(() => parseRetryAfter("1", { maximumHeaderLength: 0 }), RangeError);
  assert.throws(() => parseRetryAfter("123", { maximumHeaderLength: 2 }), RangeError);
  assert.throws(() => parseRetryAfter("1", { allowFractionalSeconds: /** @type {any} */ (1) }), TypeError);
});

test("content-disposition filenames prefer valid extended values", () => {
  assert.equal(
    parseContentDispositionFilename("attachment; filename=report.txt; filename*=UTF-8'en'r%C3%A9sum%C3%A9%20final.pdf"),
    "r\u00e9sum\u00e9 final.pdf",
  );
  assert.equal(
    parseContentDispositionFilename("attachment; filename=plain.txt; filename*=ISO-8859-1''cost-%A3.txt"),
    "cost-\u00a3.txt",
  );
  assert.equal(
    parseContentDispositionFilename("attachment; filename=plain.txt; filename*=UTF-8''invalid%ZZ.txt"),
    "plain.txt",
  );
  assert.equal(
    parseContentDispositionFilename("attachment; filename=plain.txt; filename*=UTF-16''ignored.txt"),
    "plain.txt",
  );
  assert.equal(parseContentDispositionFilename("attachment; filename*=UTF-8''one+two.txt"), "one+two.txt");
});

test("content-disposition parsing handles quoted syntax and safe path stripping", () => {
  assert.equal(parseContentDispositionFilename('attachment; filename="quarter; final.txt"'), "quarter; final.txt");
  assert.equal(parseContentDispositionFilename('attachment; filename="quarter\\"final.txt"'), "quarter-final.txt");
  assert.equal(parseContentDispositionFilename('attachment; filename="../../CON.txt"'), "file-CON.txt");
  assert.equal(parseContentDispositionFilename("attachment; filename=../unsafe.json"), "unsafe.json");
  assert.equal(
    parseContentDispositionFilename('attachment; filename="bad\u202ename:\u0000file?.txt"'),
    "badname-file-.txt",
  );
  assert.equal(parseContentDispositionFilename("attachment; filename=first.txt; filename=second.txt"), "first.txt");
});

test("content-disposition filenames validate bounds and use normalized fallbacks", () => {
  assert.equal(parseContentDispositionFilename(null, { fallback: "../Fallback Report.pdf" }), "Fallback Report.pdf");
  assert.equal(
    parseContentDispositionFilename("attachment\r\nfilename=unsafe.txt", { fallback: "safe.txt" }),
    "safe.txt",
  );
  assert.equal(parseContentDispositionFilename("inline"), undefined);
  assert.equal(parseContentDispositionFilename("attachment; filename=abcdef", { maximumLength: 3 }), "abc");
  assert.throws(() => parseContentDispositionFilename(/** @type {any} */ (1)), TypeError);
  assert.throws(() => parseContentDispositionFilename(null, /** @type {any} */ ([])), TypeError);
  assert.throws(() => parseContentDispositionFilename(null, { fallback: /** @type {any} */ (1) }), TypeError);
  assert.throws(
    () => parseContentDispositionFilename("attachment; filename=a", { maximumHeaderLength: 4 }),
    RangeError,
  );
  assert.throws(() => parseContentDispositionFilename(null, { maximumLength: 0 }), RangeError);
});

test("request parses bounded JSON, text, binary, Blob, empty, and raw responses", async () => {
  await withServer(
    (request, response) => {
      switch (new URL(request.url, "http://localhost").pathname) {
        case "/json":
          response.setHeader("content-type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ ok: true }));
          break;
        case "/empty":
          response.writeHead(204, { "content-type": "application/json" }).end();
          break;
        case "/binary":
          response.setHeader("content-type", "application/octet-stream");
          response.end(Buffer.from([0, 127, 255]));
          break;
        default:
          response.setHeader("content-type", "text/plain; charset=utf-8");
          response.end("hello");
      }
    },
    async (baseUrl) => {
      assert.deepEqual(await request(`${baseUrl}/json`), { ok: true });
      assert.equal(await request(`${baseUrl}/empty`), null);
      assert.equal(await request(`${baseUrl}/text`, { responseType: "text" }), "hello");

      const arrayBuffer = await request(`${baseUrl}/binary`, { responseType: "arrayBuffer" });
      assert.deepEqual([...new Uint8Array(arrayBuffer)], [0, 127, 255]);

      const blob = await request(`${baseUrl}/binary`, { responseType: "blob" });
      assert.equal(blob.type, "application/octet-stream");
      assert.deepEqual([...new Uint8Array(await blob.arrayBuffer())], [0, 127, 255]);

      const response = await request(`${baseUrl}/text`, { responseType: "response" });
      assert.equal(response instanceof Response, true);
      assert.equal(await response.text(), "hello");
    },
  );
});

test("request exposes typed, bounded, and redacted HTTP and JSON errors", async () => {
  await withServer(
    (request, response) => {
      if (request.url?.startsWith("/invalid-json")) {
        response.writeHead(200, { "content-type": "application/json" }).end("{not json}");
        return;
      }
      response
        .writeHead(418, {
          "content-type": "application/json",
          "set-cookie": "session=secret",
          "x-api-key": "secret-key",
          "x-private-id": "private-123",
          "x-request-id": "request-123",
        })
        .end(JSON.stringify({ error: "teapot" }));
    },
    async (baseUrl) => {
      let error;
      try {
        await request(`${baseUrl}/error?token=secret#private`, {
          includeErrorBody: true,
          sensitiveHeaderNames: ["x-private-id"],
        });
      } catch (caught) {
        error = caught;
      }
      assert.equal(error instanceof HttpError, true);
      assert.equal(error.code, "HTTP");
      assert.equal(error.status, 418);
      assert.equal(error.method, "GET");
      assert.equal(error.url, `${baseUrl}/error`);
      assert.equal(error.headers["set-cookie"], "[REDACTED]");
      assert.equal(error.headers["x-api-key"], "[REDACTED]");
      assert.equal(error.headers["x-private-id"], "[REDACTED]");
      assert.equal(error.headers["x-request-id"], "request-123");
      assert.deepEqual(error.body, { error: "teapot" });
      assert.equal(Object.isFrozen(error.headers), true);

      await assert.rejects(
        request(`${baseUrl}/invalid-json`),
        (caught) =>
          caught instanceof HttpError && caught.code === "INVALID_JSON" && caught.cause instanceof SyntaxError,
      );
    },
  );

  assert.deepEqual(
    redactHeaders(
      {
        Authorization: "Bearer secret",
        "Content-Type": "application/json",
        "X-Custom-Secret": "value",
      },
      ["x-custom-secret"],
    ),
    {
      authorization: "[REDACTED]",
      "content-type": "application/json",
      "x-custom-secret": "[REDACTED]",
    },
  );
  assert.throws(() => redactHeaders({}, /** @type {any} */ (["authorization", 1])), TypeError);
});

test("request distinguishes timeout, caller abort, size, and network failures", async () => {
  await withServer(
    (_request, response) => {
      response.writeHead(200, { "content-type": "text/plain" });
      response.flushHeaders();
      const timer = setTimeout(() => {
        if (!response.destroyed) response.end("eventually");
      }, 200);
      response.on("close", () => clearTimeout(timer));
    },
    async (baseUrl) => {
      await assert.rejects(
        request(`${baseUrl}/slow`, { timeoutMs: 10 }),
        (error) => error instanceof HttpError && error.code === "TIMEOUT",
      );

      const controller = new AbortController();
      const pending = request(`${baseUrl}/slow`, { signal: controller.signal });
      controller.abort(new Error("caller stopped"));
      await assert.rejects(
        pending,
        (error) => error instanceof HttpError && error.code === "ABORTED" && error.cause?.message === "caller stopped",
      );
    },
  );

  await withServer(
    (request, response) => {
      if (request.url === "/stream-large") {
        response.write("x".repeat(6));
        response.end("x".repeat(6));
        return;
      }
      response.setHeader("content-length", "100");
      response.end("x".repeat(100));
    },
    async (baseUrl) => {
      await assert.rejects(
        request(`${baseUrl}/large`, { maxResponseBytes: 10 }),
        (error) => error instanceof HttpError && error.code === "RESPONSE_TOO_LARGE",
      );
      await assert.rejects(
        request(`${baseUrl}/stream-large`, { maxResponseBytes: 10 }),
        (error) => error instanceof HttpError && error.code === "RESPONSE_TOO_LARGE",
      );
    },
  );

  await assert.rejects(
    request("https://example.invalid/private?token=secret", {
      fetchFn: /** @type {typeof fetch} */ (
        async () => {
          throw new Error("offline");
        }
      ),
    }),
    (error) =>
      error instanceof HttpError &&
      error.code === "NETWORK" &&
      error.url === "https://example.invalid/private" &&
      error.cause?.message === "offline",
  );
});

/**
 * @param {import("node:http").RequestListener} listener
 * @param {(baseUrl: string) => Promise<void>} run
 */
async function withServer(listener, run) {
  const server = createServer(listener);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Expected a TCP test server address.");

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.closeAllConnections();
    server.close();
    await once(server, "close");
  }
}
