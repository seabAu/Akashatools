import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";

import { HttpError, redactHeaders, request } from "akashatools/http";

test("request parses bounded JSON, text, binary, Blob, empty, and raw responses", async () => {
  await withServer((request, response) => {
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
  }, async (baseUrl) => {
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
  });
});

test("request exposes typed, bounded, and redacted HTTP and JSON errors", async () => {
  await withServer((request, response) => {
    if (request.url?.startsWith("/invalid-json")) {
      response.writeHead(200, { "content-type": "application/json" }).end("{not json}");
      return;
    }
    response.writeHead(418, {
      "content-type": "application/json",
      "set-cookie": "session=secret",
      "x-api-key": "secret-key",
      "x-private-id": "private-123",
      "x-request-id": "request-123",
    }).end(JSON.stringify({ error: "teapot" }));
  }, async (baseUrl) => {
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
      (caught) => caught instanceof HttpError && caught.code === "INVALID_JSON" && caught.cause instanceof SyntaxError,
    );
  });

  assert.deepEqual(redactHeaders({
    Authorization: "Bearer secret",
    "Content-Type": "application/json",
    "X-Custom-Secret": "value",
  }, ["x-custom-secret"]), {
    authorization: "[REDACTED]",
    "content-type": "application/json",
    "x-custom-secret": "[REDACTED]",
  });
  assert.throws(() => redactHeaders({}, /** @type {any} */ (["authorization", 1])), TypeError);
});

test("request distinguishes timeout, caller abort, size, and network failures", async () => {
  await withServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/plain" });
    response.flushHeaders();
    const timer = setTimeout(() => {
      if (!response.destroyed) response.end("eventually");
    }, 200);
    response.on("close", () => clearTimeout(timer));
  }, async (baseUrl) => {
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
  });

  await withServer((request, response) => {
    if (request.url === "/stream-large") {
      response.write("x".repeat(6));
      response.end("x".repeat(6));
      return;
    }
    response.setHeader("content-length", "100");
    response.end("x".repeat(100));
  }, async (baseUrl) => {
    await assert.rejects(
      request(`${baseUrl}/large`, { maxResponseBytes: 10 }),
      (error) => error instanceof HttpError && error.code === "RESPONSE_TOO_LARGE",
    );
    await assert.rejects(
      request(`${baseUrl}/stream-large`, { maxResponseBytes: 10 }),
      (error) => error instanceof HttpError && error.code === "RESPONSE_TOO_LARGE",
    );
  });

  await assert.rejects(
    request("https://example.invalid/private?token=secret", {
      fetchFn: /** @type {typeof fetch} */ (async () => { throw new Error("offline"); }),
    }),
    (error) => error instanceof HttpError && error.code === "NETWORK" &&
      error.url === "https://example.invalid/private" && error.cause?.message === "offline",
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
