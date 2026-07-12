const sensitiveHeaderNames = new Set([
  "authorization",
  "proxy-authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
]);
const responseTypes = new Set(["auto", "json", "text", "blob", "arrayBuffer", "response"]);
const maximumTimer = 2_147_483_647;

/**
 * A stable HTTP/network error with redacted response metadata.
 */
export class HttpError extends Error {
  /**
   * @param {string} message
   * @param {{
   *   code: "HTTP" | "NETWORK" | "ABORTED" | "TIMEOUT" | "INVALID_JSON" | "RESPONSE_TOO_LARGE",
   *   status?: number,
   *   statusText?: string,
   *   url: string,
   *   method: string,
   *   headers?: Record<string, string>,
   *   body?: unknown,
   *   cause?: unknown
   * }} details
   */
  constructor(message, { code, status, statusText, url, method, headers = {}, body, cause }) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "HttpError";
    this.code = code;
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.method = method;
    this.headers = Object.freeze({ ...headers });
    this.body = body;
  }
}

/**
 * Performs one HTTP(S) request without application auth, envelopes, delays, or
 * automatic retries. Bodies are size-bounded unless `responseType: "response"`
 * transfers raw response ownership to the caller. Empty JSON bodies return null.
 *
 * @template T
 * @param {string | URL} input
 * @param {RequestInit & {
 *   responseType?: "auto" | "json" | "text" | "blob" | "arrayBuffer" | "response",
 *   timeoutMs?: number,
 *   maxResponseBytes?: number,
 *   includeErrorBody?: boolean,
 *   sensitiveHeaderNames?: readonly string[],
 *   fetchFn?: typeof fetch
 * }} [options]
 * @returns {Promise<T>}
 * @throws {HttpError} For HTTP status, network, abort, timeout, size, or JSON parsing failures.
 */
export async function request(input, options = {}) {
  const {
    responseType = "auto",
    timeoutMs = 30_000,
    maxResponseBytes = 10_000_000,
    includeErrorBody = false,
    sensitiveHeaderNames = [],
    fetchFn = globalThis.fetch,
    signal,
    ...init
  } = options;
  const url = normalizeHttpUrl(input);
  const method = normalizeMethod(init.method ?? "GET");
  if (!responseTypes.has(responseType)) throw new TypeError(`Unsupported responseType: ${responseType}`);
  if (!Number.isSafeInteger(maxResponseBytes) || maxResponseBytes < 0) {
    throw new RangeError("maxResponseBytes must be a non-negative safe integer.");
  }
  if (typeof includeErrorBody !== "boolean") throw new TypeError("includeErrorBody must be a boolean.");
  validateSensitiveHeaderNames(sensitiveHeaderNames);
  if (typeof fetchFn !== "function") throw new TypeError("fetchFn must be a function.");

  const composed = composeRequestSignal(signal, timeoutMs);
  try {
    const response = await fetchFn(url, { ...init, method, signal: composed.signal });
    const responseUrl = safeHttpUrl(response.url || url);
    const headers = redactHeaders(response.headers, sensitiveHeaderNames);

    if (!response.ok) {
      let body;
      if (includeErrorBody) {
        try {
          const bytes = await readResponseBytes(response, maxResponseBytes);
          body = parseErrorBody(bytes, response.headers.get("content-type"));
        } catch (error) {
          if (!(error instanceof ResponseTooLargeError)) throw error;
          body = `[omitted: response exceeds ${maxResponseBytes} bytes]`;
        }
      } else {
        await cancelResponseBody(response);
      }
      throw new HttpError(`HTTP ${response.status} ${response.statusText}`.trim(), {
        code: "HTTP",
        status: response.status,
        statusText: response.statusText,
        url: responseUrl,
        method,
        headers,
        body,
      });
    }

    if (responseType === "response") return /** @type {T} */ (/** @type {unknown} */ (response));
    let bytes;
    try {
      bytes = await readResponseBytes(response, maxResponseBytes);
    } catch (error) {
      if (!(error instanceof ResponseTooLargeError)) throw error;
      throw new HttpError(`Response exceeds ${maxResponseBytes} bytes.`, {
        code: "RESPONSE_TOO_LARGE",
        status: response.status,
        statusText: response.statusText,
        url: responseUrl,
        method,
        headers,
        cause: error,
      });
    }

    try {
      return /** @type {T} */ (parseResponseBody(bytes, responseType, response.headers.get("content-type")));
    } catch (error) {
      throw new HttpError("Response body is not valid JSON.", {
        code: "INVALID_JSON",
        status: response.status,
        statusText: response.statusText,
        url: responseUrl,
        method,
        headers,
        cause: error,
      });
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    const reason = composed.signal.reason;
    if (composed.signal.aborted) {
      const timedOut = reason instanceof DOMException && reason.name === "TimeoutError";
      throw new HttpError(timedOut ? `Request timed out after ${timeoutMs}ms.` : "Request was aborted.", {
        code: timedOut ? "TIMEOUT" : "ABORTED",
        url: safeHttpUrl(url),
        method,
        cause: reason ?? error,
      });
    }
    throw new HttpError("Network request failed.", {
      code: "NETWORK",
      url: safeHttpUrl(url),
      method,
      cause: error,
    });
  } finally {
    composed.cleanup();
  }
}

/**
 * Copies headers while replacing common credential/cookie values with
 * `[REDACTED]`. Names are normalized by the platform Headers implementation.
 *
 * @param {HeadersInit} headers
 * @param {readonly string[]} [additionalSensitiveNames]
 * @returns {Record<string, string>}
 */
export function redactHeaders(headers, additionalSensitiveNames = []) {
  validateSensitiveHeaderNames(additionalSensitiveNames);
  const redactedNames = new Set([...sensitiveHeaderNames, ...additionalSensitiveNames.map((name) => name.toLowerCase())]);
  return Object.fromEntries([...new Headers(headers).entries()].map(([name, value]) => [
    name,
    redactedNames.has(name.toLowerCase()) ? "[REDACTED]" : value,
  ]));
}

/** @param {readonly string[]} names */
function validateSensitiveHeaderNames(names) {
  if (!Array.isArray(names) || names.some((name) => typeof name !== "string")) {
    throw new TypeError("sensitive header names must be an array of strings.");
  }
}

class ResponseTooLargeError extends Error {}

/** @param {string | URL} input */
function normalizeHttpUrl(input) {
  let url;
  try {
    url = input instanceof URL ? new URL(input) : new URL(input);
  } catch (cause) {
    throw new TypeError("input must be an absolute HTTP(S) URL.", { cause });
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("input must use HTTP or HTTPS.");
  }
  return url;
}

/** @param {string} method */
function normalizeMethod(method) {
  if (typeof method !== "string" || !/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(method)) {
    throw new TypeError("method must be a valid HTTP token.");
  }
  return method.toUpperCase();
}

/** @param {AbortSignal | null | undefined} signal @param {number} timeoutMs */
function composeRequestSignal(signal, timeoutMs) {
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0 || timeoutMs > maximumTimer) {
    throw new RangeError(`timeoutMs must be between 0 and ${maximumTimer}.`);
  }
  if (signal != null && (
    typeof signal !== "object" || typeof signal.aborted !== "boolean" ||
    typeof signal.addEventListener !== "function" || typeof signal.removeEventListener !== "function"
  )) throw new TypeError("signal must be an AbortSignal.");

  const controller = new AbortController();
  const onAbort = () => controller.abort(signal?.reason);
  if (signal?.aborted) onAbort();
  else signal?.addEventListener("abort", onAbort, { once: true });
  const timeout = globalThis.setTimeout(() => {
    controller.abort(new DOMException(`Timed out after ${timeoutMs}ms.`, "TimeoutError"));
  }, timeoutMs);
  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onAbort);
    },
  };
}

/** @param {Response} response @param {number} maximumBytes */
async function readResponseBytes(response, maximumBytes) {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    await cancelResponseBody(response);
    throw new ResponseTooLargeError();
  }
  if (!response.body) return new Uint8Array();

  const reader = response.body.getReader();
  /** @type {Uint8Array[]} */
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maximumBytes) {
        try { await reader.cancel(); } catch { /* Preserve the size failure. */ }
        throw new ResponseTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/** @param {Response} response */
async function cancelResponseBody(response) {
  try { await response.body?.cancel(); } catch { /* Cleanup must not replace the primary result. */ }
}

/** @param {Uint8Array} bytes @param {string} responseType @param {string | null} contentType */
function parseResponseBody(bytes, responseType, contentType) {
  const resolvedType = responseType === "auto"
    ? contentType?.toLowerCase().includes("json") ? "json" : "text"
    : responseType;
  const buffer = copyArrayBuffer(bytes);
  if (resolvedType === "arrayBuffer") return buffer;
  if (resolvedType === "blob") return new Blob([buffer], { type: contentType ?? "" });
  const text = new TextDecoder().decode(bytes);
  if (resolvedType === "json") return text.trim() === "" ? null : JSON.parse(text);
  return text;
}

/** @param {Uint8Array} bytes */
function copyArrayBuffer(bytes) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

/** @param {Uint8Array} bytes @param {string | null} contentType */
function parseErrorBody(bytes, contentType) {
  const text = new TextDecoder().decode(bytes);
  if (text === "") return null;
  if (contentType?.toLowerCase().includes("json")) {
    try { return JSON.parse(text); } catch { return text; }
  }
  return text;
}

/** @param {string | URL} input */
function safeHttpUrl(input) {
  try {
    const url = new URL(input);
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.href;
  } catch {
    return "[invalid URL]";
  }
}
