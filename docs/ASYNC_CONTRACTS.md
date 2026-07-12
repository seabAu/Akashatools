# Async and function-control decisions

`mapSettledWithConcurrency` is deliberately all-settled: every input produces an
ordered fulfilled/rejected record and one mapper failure does not stop other
work. Existing COMPOSR consumers use that shape to preserve partial profiler
exports. A fail-fast variant is deferred because rejecting the outer Promise
cannot stop already-running mapper effects. Callers that own cancellable work can
pass one signal into their mapper closure and decide how partial results behave.

`delay` validates the host timer range, rejects immediately for an already
aborted signal, clears its timer on cancellation, and removes its abort listener
on both resolution and rejection.

The reviewed sources do not establish safe shared contracts for the following:

- Mindspace debounce drops superseded async results, loses dynamic `this`, and
  has no cancel/flush/pending API;
- retry behavior is HTTP-specific in COMPOSR and depends on idempotency,
  `Retry-After`, jitter, attempt numbering, and an elapsed budget;
- generic timeout behavior must decide whether timing out only rejects a wrapper
  or actually aborts the underlying operation;
- memoization needs key equality, rejected-Promise caching, size/TTL eviction,
  and receiver semantics;
- once/throttle need receiver, argument, result, reentrancy, and cancellation
  rules backed by real consumers.

These remain deferred. Small primitives and caller composition are preferred to
one options-heavy control function.
