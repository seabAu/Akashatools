# Function-control contracts

Function-control wrappers live under `akashatools/function`. They are local
objects: imports never patch prototypes, create timers, or mutate a callback.

## `once`

`once(callback)` preserves the first call's receiver and arguments and replays
its exact return identity. A synchronous throw is replayed as the same error,
and a returned native Promise is replayed by identity, including rejection.
This literal at-most-once default can be relaxed separately with
`retryOnThrow` and `retryOnRejection`.

The Promise retry reset occurs after rejection settlement. Calls made while it
is pending share the original Promise. A same-stack reentrant call throws rather
than receiving a partially initialized value. Custom thenables are not inspected
as Promises, which avoids invoking arbitrary `then` accessors.

## `memoize`

`memoize(callback, toKey)` makes key policy mandatory instead of hiding a
first-argument or string-serialization rule. The selector receives the same
dynamic receiver and arguments as the callback and may include whatever
identity the caller needs. Keys live in a Map with SameValueZero semantics, so
objects retain identity and numeric/string keys stay distinct.

The cache is a bounded LRU with a default maximum of 1,000 entries. A hit updates
recency; `has` does not. Synchronous throws are not cached. Native Promise
results coalesce while cached and rejected entries are removed after settlement
unless `cacheRejected` is selected. LRU eviction, `delete`, and `clear` remove
references only; they cannot cancel work already started by the callback.

The returned function exposes non-enumerable `clear`, `delete`, `has`, and
read-only `size` controls. Same-key synchronous reentrancy throws, while
different derived keys may recurse.

## `debounce`

`debounce(callback, wait)` is deliberately trailing-only. Every call in one
quiet-period batch receives the same Promise, and the latest call supplies the
receiver and arguments. Callback values and Promise-like results fulfill it;
synchronous throws and rejected results reject it. This prevents the reviewed
legacy failure mode where superseded async callers were silently orphaned.

`flush()` starts queued work immediately and returns its existing Promise.
`cancel(reason)` rejects queued work, and `pending` reports whether that work
exists. Controls do not abort a callback after invocation. A scheduler can be
injected for deterministic hosts/tests; normal construction creates no timer.

## `throttle`

`throttle(callback, wait)` enables both leading and trailing edges by default.
At most one callback starts per wait window. Calls inside the window share one
trailing Promise and the latest receiver/arguments. A trailing invocation begins
a new cooldown at its start. When trailing is disabled, suppressed calls receive
the latest invocation's exact Promise rather than an invented `undefined` result.

Leading-only and trailing-only operation are available, but both edges cannot
be disabled. `flush()` acts only on queued trailing work; `cancel()` rejects that
work and resets the cooldown. `pending` reports a queued trailing invocation,
not a cooldown alone. No control claims to stop already-started work.

Both timer wrappers validate the host timer range and normalize callback results
to Promises, including synchronous throws. Their optional scheduler interface
must provide `set(callback, milliseconds)` and `clear(handle)` and schedule the
callback after `set` returns.
Scheduler failures reject the queued Promise. The only state without such a
Promise is a throttle cooldown with no trailing work; `cancel()` propagates a
`clear` failure in that case instead of hiding it.
