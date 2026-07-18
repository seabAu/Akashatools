import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const host = "127.0.0.1";
const port = 4173;
const files = new Map([
  [
    "/fixtures/browser/download.html",
    [new URL("../fixtures/browser/download.html", import.meta.url), "text/html; charset=utf-8"],
  ],
  ["/src/browser.js", [new URL("../src/browser.js", import.meta.url), "text/javascript; charset=utf-8"]],
  ["/src/hash.js", [new URL("../src/hash.js", import.meta.url), "text/javascript; charset=utf-8"]],
  ["/src/input.js", [new URL("../src/input.js", import.meta.url), "text/javascript; charset=utf-8"]],
  ["/src/data.js", [new URL("../src/data.js", import.meta.url), "text/javascript; charset=utf-8"]],
  ["/src/object.js", [new URL("../src/object.js", import.meta.url), "text/javascript; charset=utf-8"]],
  ["/src/string.js", [new URL("../src/string.js", import.meta.url), "text/javascript; charset=utf-8"]],
  ["/src/validation.js", [new URL("../src/validation.js", import.meta.url), "text/javascript; charset=utf-8"]],
  ["/src/function.js", [new URL("../src/function.js", import.meta.url), "text/javascript; charset=utf-8"]],
]);

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url ?? "/", `http://${host}:${port}`).pathname;
    const file = files.get(pathname);
    if (!file) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const [url, contentType] = file;
    const body = await readFile(url);
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-length": body.byteLength,
      "content-type": contentType,
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end("Fixture server error");
    console.error(error);
  }
});

server.listen(port, host, () => {
  console.log(`Browser fixture server listening at http://${host}:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => server.close(() => process.exit(0)));
}
