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
