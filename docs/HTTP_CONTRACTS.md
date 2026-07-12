# HTTP contracts and threat model

The `akashatools/http` surface provides one dependency-free Fetch primitive:
`request`. It standardizes transport mechanics without becoming an application
API client. `HttpError` and `redactHeaders` are also exported from the category,
the universal root, and the default `akasha` namespace.

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
- `maxResponseBytes` defaults to 10,000,000 bytes. Both declared length and bytes
  read from the decoded response stream are checked. This remains active for
  error bodies when `includeErrorBody` is true.
- Non-2xx responses throw `HttpError`. Error-body parsing is opt-in because an
  error body may contain credentials or personal data. An oversized opted-in
  body is replaced by an omission marker while the HTTP status error is kept.
- `fetchFn` exists for deterministic tests and compatible Fetch runtimes. It is
  not an adapter hook for auth, envelopes, logging, or application side effects.

## Response parsing

| `responseType` | Result |
| --- | --- |
| `"auto"` | JSON when the media type contains `json`; otherwise text. |
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
`sensitiveHeaderNames`; `redactHeaders` provides the same operation directly.
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

## Retry decision

Akashatools performs exactly one attempt. Automatic retries are deferred until a
real cross-project contract determines all of the following together:

- eligible methods, status codes, and network failures;
- idempotency-key requirements for writes;
- `Retry-After` parsing and server-delay caps;
- exponential backoff, injected jitter, and attempt numbering;
- maximum attempts and maximum total elapsed time;
- how caller cancellation interrupts waits and active attempts.

Authentication refresh, response envelopes, API delays, stores, toasts,
redirect-to-login behavior, telemetry, and domain error messages remain owned by
consumer applications and compose around `request`.
