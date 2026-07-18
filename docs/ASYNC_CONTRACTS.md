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

`createSingleFlight` and `createKeyedSingleFlight` coalesce concurrent calls
without cancelling work. Invalidation is generational: existing callers retain
their Promise, while its eventual result cannot repopulate a newer cache. A zero
TTL only coalesces in-flight work; a positive TTL caches accepted values; an
infinite TTL requires explicit invalidation. The keyed controller applies a
least-recently accessed size bound so arbitrary keys cannot grow memory without
limit.

`createConcurrencyLimiter` schedules independent operations submitted over time
under one global ceiling. `createKeyedConcurrencyLimiter` adds a SameValueZero
per-key ceiling while allowing eligible work for another key to pass a saturated
key. Both bound the total waiting queue, preserve callback results/rejections,
normalize synchronous throws into rejected Promises, and release capacity on
every settlement. A queued AbortSignal removes only that waiting operation;
started work is not implicitly cancellable and must receive/observe a signal in
its own closure when that behavior is required.

`function.once` preserves the first receiver/arguments and exact synchronous or
native-Promise outcome. Throws and rejections are cached by default; independent
retry options reset only for the selected failure mode. Synchronous reentrancy
fails visibly instead of returning a partially initialized value.

`function.memoize` requires a caller-owned key selector, applies SameValueZero
key identity and a positive bounded LRU cache, and preserves dynamic receivers.
Synchronous throws are not cached. Pending native Promises coalesce while they
remain cached; rejected Promises are evicted after settlement unless explicitly
retained. Cache controls do not cancel ongoing work.

`function.debounce` is trailing-only and returns one shared Promise to every
caller in a quiet-period batch. The latest receiver/arguments win. `flush`
starts queued work immediately; `cancel` rejects it. Once callback execution
starts, neither control claims to abort it.

`function.throttle` starts at most one callback per wait window. Leading and
trailing edges are explicit and cannot both be disabled. Suppressed calls share
the queued latest-arguments trailing Promise; when trailing is disabled they
receive the most recent invocation's exact Promise. A trailing invocation starts
a new cooldown. `pending` means trailing work is queued, not merely that a
cooldown exists.

The reviewed sources do not establish safe shared contracts for the following:

- retry behavior is HTTP-specific in COMPOSR and depends on idempotency,
  `Retry-After`, jitter, attempt numbering, and an elapsed budget;
- generic timeout behavior must decide whether timing out only rejects a wrapper
  or actually aborts the underlying operation;

These remain deferred. Small primitives and caller composition are preferred to
one options-heavy control function.
