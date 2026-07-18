/**
 * A stable HTTP/network error with redacted response metadata.
 *
 * @example
 * if (error instanceof HttpError && error.code === "TIMEOUT") retryLater();
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
 * transfers raw response ownership to the caller. Auto parsing recognizes the
 * exact `application/json` media type and structured `+json` suffixes. Empty
 * JSON bodies return null; malformed Content-Length metadata is ignored while
 * the streamed body remains bounded.
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
 * @param {HeadersInit} headers Header input copied through the platform Headers normalizer.
 * @param {readonly string[]} [additionalSensitiveNames] Extra case-insensitive names whose values must be hidden.
 * @returns {Record<string, string>} Plain copied record with sensitive values replaced by `[REDACTED]`.
 * @throws {TypeError} If additionalSensitiveNames is not an array of strings or Headers rejects the input.
 * @example
 * redactHeaders({ authorization: "Bearer secret", accept: "application/json" });
 * @since 2.0.0
 */
export declare function redactHeaders(headers: HeadersInit, additionalSensitiveNames?: readonly string[]): Record<string, string>;
/**
 * Parses a `Retry-After` field into a non-negative delay in seconds without
 * performing a retry. RFC delay-seconds are decimal integers; the three HTTP
 * date forms are accepted and calendar/weekday consistency is checked. An
 * explicit compatibility option accepts non-standard fractional delay values
 * used by some APIs. Past dates resolve to zero.
 *
 * @param {string | null | undefined} value Retry-After field value, or nullish when absent.
 * @param {{now?: number, maximumDelaySeconds?: number, maximumHeaderLength?: number, allowFractionalSeconds?: boolean}} [options] Injectable current Unix milliseconds, output cap, input bound, and non-standard fractional compatibility policy.
 * @returns {number | undefined} Finite delay seconds, capped when requested, or undefined for an absent/invalid/unrepresentable field.
 * @throws {TypeError} If value, options, now, or allowFractionalSeconds violates its literal contract.
 * @throws {RangeError} If a bound is invalid, now is outside the Date range, or the field exceeds maximumHeaderLength.
 * @example
 * parseRetryAfter("120"); // 120
 * @since 2.0.0
 */
export declare function parseRetryAfter(value: string | null | undefined, options?: {
    now?: number;
    maximumDelaySeconds?: number;
    maximumHeaderLength?: number;
    allowFractionalSeconds?: boolean;
}): number | undefined;
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
export declare function parseContentDispositionFilename(value: string | null | undefined, options?: {
    fallback?: string;
    maximumHeaderLength?: number;
    maximumLength?: number;
}): string | undefined;
