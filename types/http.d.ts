/**
 * A stable HTTP/network error with redacted response metadata.
 * @since 2.0.0
 */
export declare class HttpError extends Error {
    code: "ABORTED" | "HTTP" | "INVALID_JSON" | "NETWORK" | "RESPONSE_TOO_LARGE" | "TIMEOUT";
    status: number | undefined;
    statusText: string | undefined;
    url: string;
    method: string;
    headers: Readonly<{
        [x: string]: string;
    }>;
    body: unknown;
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
    constructor(message: string, { code, status, statusText, url, method, headers, body, cause }: {
        code: "HTTP" | "NETWORK" | "ABORTED" | "TIMEOUT" | "INVALID_JSON" | "RESPONSE_TOO_LARGE";
        status?: number;
        statusText?: string;
        url: string;
        method: string;
        headers?: Record<string, string>;
        body?: unknown;
        cause?: unknown;
    });
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
 * @since 2.0.0
 */
export declare function request<T>(input: string | URL, options?: RequestInit & {
    responseType?: "auto" | "json" | "text" | "blob" | "arrayBuffer" | "response";
    timeoutMs?: number;
    maxResponseBytes?: number;
    includeErrorBody?: boolean;
    sensitiveHeaderNames?: readonly string[];
    fetchFn?: typeof fetch;
}): Promise<T>;
/**
 * Copies headers while replacing common credential/cookie values with
 * `[REDACTED]`. Names are normalized by the platform Headers implementation.
 *
 * @param {HeadersInit} headers
 * @param {readonly string[]} [additionalSensitiveNames]
 * @returns {Record<string, string>}
 * @since 2.0.0
 */
export declare function redactHeaders(headers: HeadersInit, additionalSensitiveNames?: readonly string[]): Record<string, string>;
