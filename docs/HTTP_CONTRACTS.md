# HTTP contracts and threat model

The `akashatools/http` surface provides one dependency-free Fetch primitive,
`request`, plus atomic header operations. It standardizes transport mechanics
without becoming an application API client. `HttpError`, `redactHeaders`,
`parseContentDispositionFilename`, and `parseRetryAfter` are also exported from
the category, universal root, default `akasha` namespace, and granular paths.

```js
import { request } from "akashatools/http";

const profile = await request("https://api.example.com/profile", {
  headers: { accept: "application/json" },
  signal,
});
```

## Request contract

- Only absolute `http:` and `https:` URLs are accepted. The method is validated
  as an HTTP token and normalized to uppercase.
- `timeoutMs` defaults to 30,000 and covers Fetch plus bounded body consumption.
  Zero is an immediate deadline. With `responseType: "response"`, the timer and
  composed signal are released after the response headers arrive because body
  ownership has transferred to the caller.
- A caller `AbortSignal` and the timeout feed an internal signal. Caller aborts
  become `ABORTED`; expiry becomes `TIMEOUT`. Event listeners and timers are
  removed when the request settles.
- `maxResponseBytes` defaults to 10,000,000 bytes. A syntactically valid decimal
  `Content-Length` is checked before reading; absent or malformed declarations
  are not trusted. Bytes read from the decoded response stream are always
  checked. This remains active for error bodies when `includeErrorBody` is true.
- Non-2xx responses throw `HttpError`. Error-body parsing is opt-in because an
  error body may contain credentials or personal data. An oversized opted-in
  body is replaced by an omission marker while the HTTP status error is kept.
- `fetchFn` exists for deterministic tests and compatible Fetch runtimes. It is
  not an adapter hook for auth, envelopes, logging, or application side effects.

## Response parsing

| `responseType` | Result |
| --- | --- |
| `"auto"` | JSON for `application/json` and valid structured `+json` media types; otherwise text. |
| `"json"` | Parsed JSON; a whitespace-only or absent body returns `null`. |
| `"text"` | UTF-8 text, including `""` for an empty body. |
| `"blob"` | A `Blob` carrying the response media type. |
| `"arrayBuffer"` | A copied, exact-length `ArrayBuffer`. |
| `"response"` | The raw `Response`; size, body parsing, and body cancellation become caller responsibilities. |

Malformed JSON throws `HttpError` with code `INVALID_JSON` and retains the
parser exception as `cause`. Successful JSON parsing does not validate an
application schema; compose it with a contract validator when needed.

## Stable error metadata

`HttpError.code` is one of `HTTP`, `NETWORK`, `ABORTED`, `TIMEOUT`,
`INVALID_JSON`, or `RESPONSE_TOO_LARGE`. Where available, it also carries
`status`, `statusText`, normalized `method`, frozen redacted response `headers`,
an explicitly requested error `body`, and the originating `cause`.

The top-level URL removes user information, query parameters, and fragments.
Authorization, proxy authorization, cookies, set-cookie, and API-key headers are
redacted. Applications can add response-header names with
`sensitiveHeaderNames`; every supplied name must be a valid HTTP token so a
mistyped or whitespace-padded secret name cannot silently miss redaction.
`redactHeaders` provides the same operation directly.
An original `cause` and an opted-in `body` are opaque third-party values and must
not be serialized blindly into logs or user-visible diagnostics.

## Security boundary

`request` is not an SSRF defense and does not decide which remote systems a
caller may access. Native Fetch redirect behavior applies, including automatic
redirect following unless the caller selects another `redirect` mode. Server
code accepting an untrusted destination must separately enforce its allowlist,
resolve and pin acceptable addresses where appropriate, and revalidate every
redirect target. Selecting `redirect: "error"` is the conservative choice when
redirects are unnecessary.

The body cap is applied to bytes exposed by the Fetch response stream, so
transparently decompressed output is counted rather than trusting a compressed
`Content-Length`. It does not replace platform connection limits, header limits,
DNS/IP controls, or an application-wide request budget. Raw-response mode opts
out of Akashatools body protection explicitly.

## Retry-After interpretation

`parseRetryAfter` interprets one already-extracted field value and returns a
delay in seconds. It accepts RFC 9110's non-negative decimal integer syntax and
all three HTTP-date forms, validates calendar and weekday consistency, maps past
dates to zero, bounds header work, and can cap the result. A `now` timestamp is
injectable in Unix milliseconds for deterministic decisions. Values too large
for safe numeric representation are invalid unless a finite cap makes their
result unambiguous.

Some current APIs emit fractional seconds even though the standard
`delay-seconds` grammar is integer-only. That extension remains opt-in through
`allowFractionalSeconds`; it is not silently accepted by the strict default.
This distinction preserves practical SPLICR compatibility while keeping the
standard contract visible. See [RFC 9110, Retry-After](https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after).

## Retry decision

Akashatools still performs exactly one attempt. Parsing a server hint does not
decide whether a request is safe or eligible to repeat. Automatic retries are
deferred until a real cross-project contract determines all of the following
together:

- eligible methods, status codes, and network failures;
- idempotency-key requirements for writes;
- when a parsed `Retry-After` hint overrides or floors local backoff;
- exponential backoff, injected jitter, and attempt numbering;
- maximum attempts and maximum total elapsed time;
- how caller cancellation interrupts waits and active attempts.

Authentication refresh, response envelopes, API delays, stores, toasts,
redirect-to-login behavior, telemetry, and domain error messages remain owned by
consumer applications and compose around `request`.
