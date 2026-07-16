import { isPlainObject } from "./object.js";

const sensitiveHeaderNames = new Set([
  "authorization",
  "proxy-authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
]);
const responseTypes = new Set(["auto", "json", "text", "blob", "arrayBuffer", "response"]);
const maximumTimer = 2_147_483_647;
const httpToken = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const windowsReservedFilename = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;
const unsafeFilenameCharacters = /[<>:"|?*]/gu;
const filenameControls = /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/gu;

/**
 * A stable HTTP/network error with redacted response metadata.
 *
 * @example
 * if (error instanceof HttpError && error.code === "TIMEOUT") retryLater();
 * @since 2.0.0
 */
export class HttpError extends Error {
  /**
   * @param {string} message Stable human-readable failure summary.
   * @param {{
   *   code: "HTTP" | "NETWORK" | "ABORTED" | "TIMEOUT" | "INVALID_JSON" | "RESPONSE_TOO_LARGE",
   *   status?: number,
   *   statusText?: string,
   *   url: string,
   *   method: string,
   *   headers?: Record<string, string>,
   *   body?: unknown,
   *   cause?: unknown
   * }} details Typed transport metadata with already-redacted headers and optional cause/body.
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
 * @param {string | URL} input Absolute HTTP or HTTPS URL; credentials, query, and fragment are removed from error metadata.
 * @param {RequestInit & {
 *   responseType?: "auto" | "json" | "text" | "blob" | "arrayBuffer" | "response",
 *   timeoutMs?: number,
 *   maxResponseBytes?: number,
 *   includeErrorBody?: boolean,
 *   sensitiveHeaderNames?: readonly string[],
 *   fetchFn?: typeof fetch
 * }} [options] Fetch options plus parsing, timeout, size, diagnostics, and injectable transport controls.
 * @returns {Promise<T>} Parsed response value, Blob/ArrayBuffer, or raw Response according to responseType.
 * @throws {TypeError | RangeError} If URL, method, options, or limits do not match the request contract.
 * @throws {HttpError} For HTTP status, network, abort, timeout, size, or JSON parsing failures.
 * @example
 * const profile = await request("https://api.example.com/profile", { responseType: "json" });
 * @since 2.0.0
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
 * @param {HeadersInit} headers Header input copied through the platform Headers normalizer.
 * @param {readonly string[]} [additionalSensitiveNames] Extra case-insensitive names whose values must be hidden.
 * @returns {Record<string, string>} Plain copied record with sensitive values replaced by `[REDACTED]`.
 * @throws {TypeError} If additionalSensitiveNames is not an array of strings or Headers rejects the input.
 * @example
 * redactHeaders({ authorization: "Bearer secret", accept: "application/json" });
 * @since 2.0.0
 */
export function redactHeaders(headers, additionalSensitiveNames = []) {
  validateSensitiveHeaderNames(additionalSensitiveNames);
  const redactedNames = new Set([...sensitiveHeaderNames, ...additionalSensitiveNames.map((name) => name.toLowerCase())]);
  return Object.fromEntries([...new Headers(headers).entries()].map(([name, value]) => [
    name,
    redactedNames.has(name.toLowerCase()) ? "[REDACTED]" : value,
  ]));
}

/**
 * Extracts a bounded cross-platform-safe filename suggestion from an HTTP
 * `Content-Disposition` value. A valid RFC extended `filename*` takes
 * precedence over `filename`; malformed candidates fall through to the next
 * candidate and then an optional fallback. Path components, controls, bidi
 * overrides, reserved characters, and Windows device names are neutralized.
 *
 * @param {string | null | undefined} value Content-Disposition header value, or nullish when absent.
 * @param {{fallback?: string, maximumHeaderLength?: number, maximumLength?: number}} [options] Optional fallback plus positive header code-unit and filename code-point bounds.
 * @returns {string | undefined} Safe filename suggestion, normalized fallback, or undefined.
 * @throws {TypeError} If value, options, or fallback violates its literal contract.
 * @throws {RangeError} If a length bound is invalid or the header exceeds maximumHeaderLength.
 * @example
 * parseContentDispositionFilename("attachment; filename*=UTF-8''report%20final.pdf");
 * @since 2.0.0
 */
export function parseContentDispositionFilename(value, options = {}) {
  if (value !== null && value !== undefined && typeof value !== "string") {
    throw new TypeError("value must be a string or nullish.");
  }
  if (!isPlainObject(options)) throw new TypeError("options must be a plain object.");
  const { fallback, maximumHeaderLength = 8_192, maximumLength = 255 } = options;
  if (fallback !== undefined && typeof fallback !== "string") throw new TypeError("fallback must be a string.");
  assertPositiveSafeInteger(maximumHeaderLength, "maximumHeaderLength");
  assertPositiveSafeInteger(maximumLength, "maximumLength");
  const safeFallback = normalizeSuggestedFilename(fallback, maximumLength);
  if (value == null || value.trim() === "") return safeFallback;
  if (value.length > maximumHeaderLength) throw new RangeError("value exceeded maximumHeaderLength.");
  if (/[\r\n]/u.test(value)) return safeFallback;

  const parameters = parseContentDispositionParameters(value);
  for (const [name, parameterValue] of parameters) {
    if (name !== "filename*") continue;
    const decoded = decodeExtendedFilename(parameterValue);
    const filename = normalizeSuggestedFilename(decoded, maximumLength);
    if (filename !== undefined) return filename;
  }
  for (const [name, parameterValue] of parameters) {
    if (name !== "filename") continue;
    const filename = normalizeSuggestedFilename(parameterValue, maximumLength);
    if (filename !== undefined) return filename;
  }
  return safeFallback;
}

/** @param {readonly string[]} names */
function validateSensitiveHeaderNames(names) {
  if (!Array.isArray(names) || names.some((name) => typeof name !== "string")) {
    throw new TypeError("sensitive header names must be an array of strings.");
  }
}

/** @param {unknown} value @param {string} name */
function assertPositiveSafeInteger(value, name) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive safe integer.`);
  }
}

/** @param {string} value @returns {Array<[string, string]>} */
function parseContentDispositionParameters(value) {
  const firstSemicolon = value.indexOf(";");
  const dispositionType = value.slice(0, firstSemicolon < 0 ? value.length : firstSemicolon).trim();
  if (!httpToken.test(dispositionType) || firstSemicolon < 0) return [];

  /** @type {Array<[string, string]>} */
  const parameters = [];
  let cursor = firstSemicolon + 1;
  while (cursor < value.length) {
    while (cursor < value.length && (value[cursor] === ";" || /[\t ]/u.test(value[cursor]))) cursor += 1;
    const nameStart = cursor;
    while (cursor < value.length && /[!#$%&'*+\-.^_`|~0-9A-Za-z]/u.test(value[cursor])) cursor += 1;
    const name = value.slice(nameStart, cursor).toLowerCase();
    while (cursor < value.length && /[\t ]/u.test(value[cursor])) cursor += 1;
    if (name === "" || value[cursor] !== "=") {
      cursor = nextParameter(value, cursor);
      continue;
    }
    cursor += 1;
    while (cursor < value.length && /[\t ]/u.test(value[cursor])) cursor += 1;

    if (value[cursor] !== '"') {
      const end = value.indexOf(";", cursor);
      const parameterValue = value.slice(cursor, end < 0 ? value.length : end).trim();
      if (parameterValue !== "") parameters.push([name, parameterValue]);
      cursor = end < 0 ? value.length : end + 1;
      continue;
    }

    cursor += 1;
    let parameterValue = "";
    let closed = false;
    while (cursor < value.length) {
      const character = value[cursor];
      cursor += 1;
      if (character === "\\" && cursor < value.length) {
        parameterValue += value[cursor];
        cursor += 1;
      } else if (character === '"') {
        closed = true;
        break;
      } else {
        parameterValue += character;
      }
    }
    while (cursor < value.length && /[\t ]/u.test(value[cursor])) cursor += 1;
    if (closed && (cursor === value.length || value[cursor] === ";")) parameters.push([name, parameterValue]);
    cursor = nextParameter(value, cursor);
  }
  return parameters;
}

/** @param {string} value @param {number} cursor */
function nextParameter(value, cursor) {
  const next = value.indexOf(";", cursor);
  return next < 0 ? value.length : next + 1;
}

/** @param {string} value */
function decodeExtendedFilename(value) {
  const firstQuote = value.indexOf("'");
  const secondQuote = firstQuote < 0 ? -1 : value.indexOf("'", firstQuote + 1);
  if (firstQuote <= 0 || secondQuote < 0) return undefined;
  const charset = value.slice(0, firstQuote).toLowerCase();
  if (charset !== "utf-8" && charset !== "iso-8859-1") return undefined;

  /** @type {number[]} */
  const bytes = [];
  const encoded = value.slice(secondQuote + 1);
  for (let index = 0; index < encoded.length; index += 1) {
    const codeUnit = encoded.charCodeAt(index);
    if (encoded[index] === "%") {
      const pair = encoded.slice(index + 1, index + 3);
      if (!/^[0-9A-Fa-f]{2}$/u.test(pair)) return undefined;
      bytes.push(Number.parseInt(pair, 16));
      index += 2;
    } else {
      if (codeUnit > 0x7f) return undefined;
      bytes.push(codeUnit);
    }
  }
  if (charset === "utf-8") {
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
    } catch {
      return undefined;
    }
  }
  let decoded = "";
  for (const byte of bytes) decoded += String.fromCharCode(byte);
  return decoded;
}

/** @param {string | undefined} value @param {number} maximumLength */
function normalizeSuggestedFilename(value, maximumLength) {
  if (value === undefined) return undefined;
  const pathSegments = value.split(/[\\/]/u);
  let filename = pathSegments.at(-1) ?? "";
  filename = filename
    .replace(filenameControls, "")
    .replace(unsafeFilenameCharacters, "-")
    .replace(/\s+/gu, " ")
    .trim()
    .replace(/[. ]+$/u, "");
  if (filename === "" || filename === "." || filename === "..") return undefined;
  if (windowsReservedFilename.test(filename)) filename = `file-${filename}`;
  filename = [...filename].slice(0, maximumLength).join("").replace(/[. ]+$/u, "");
  return filename === "" || filename === "." || filename === ".." ? undefined : filename;
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
