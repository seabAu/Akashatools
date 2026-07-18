import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const host = "127.0.0.1";
const port = 4173;
const fixtureFiles = new Map([
  [
    "/fixtures/browser/download.html",
    [new URL("../fixtures/browser/download.html", import.meta.url), "text/html; charset=utf-8"],
  ],
]);
const sourceModulePath = /^\/src\/(?:[A-Za-z][A-Za-z0-9-]*\/)*[A-Za-z][A-Za-z0-9-]*\.js$/u;

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url ?? "/", `http://${host}:${port}`).pathname;
    const file =
      fixtureFiles.get(pathname) ??
      (sourceModulePath.test(pathname)
        ? [new URL(`..${pathname}`, import.meta.url), "text/javascript; charset=utf-8"]
        : undefined);
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
