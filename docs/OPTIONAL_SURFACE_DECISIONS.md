# Optional surface decisions

This document records the 2.0 category boundary for schema/data-model behavior
and debug/diagnostic behavior. The 2026-07-18 regression review split generic
data operations from application schema adapters: `data` is now a universal
category, while `schema` and `debug` remain outside the core.

## Schema and data models

The reviewed projects do not share one schema language:

- Mindspace import helpers mix coercion, defaults, required fields, nested rules,
  custom classes, Mongoose behavior, and form-model generation.
- Portfolio schema utilities expose admin, storage, navigation, and application
  record policy.
- COMPOSR schemas version tool profiles/results and are coupled to COMPOSR
  contracts, migrations, and envelope formats.
- Akashatools' generic `validateJsonContract` subset validates JSON-compatible
  values without coercion and already fits the `validation` category.

A `schema` namespace would imply interoperability that does not exist. Full JSON
Schema support also brings reference resolution, dialect/version selection,
formats, dependencies, and code-generation choices that should not be hidden in
a general utility module. If multiple consumers eventually need that surface,
evaluate a maintained validator dependency or a separately versioned add-on.

The earlier all-or-nothing disposition hid a reusable lower layer, however.
Akashatools now adopts these dependency-free operations under `data`:

- normalize a built-in constructor or schema-like type label;
- analyze every slot in an array rather than guessing from its first item;
- create a fresh initialized value for a type or runtime value; and
- recursively initialize a plain-data shape with explicit array/object policies.

Pure HTML input/control inference and generic data-to-field descriptors now
compose that layer under a separate `input` category. Mongoose adapters, custom
database-ID construction, React components, validation/layout metadata,
application defaults, and data-model migrations remain application-owned.

## Debug and diagnostics

The legacy `lib/Debug.js` exports one formatter that writes directly to the
console. The portfolio rebuild contains a copied, internally inconsistent
version; its only import has no live call site (the sole reference is commented
out). No current consumer depends on that API.

Mindspace does have active diagnostics, but they collect application snapshots,
coordinate React hooks, stores, local logs, toasts/modals, authentication state,
and notification/data-load health. COMPOSR records timing and Performance API
measurements as versioned profiler-domain results. Those are useful systems, not
generic logging or timing functions.

Akashatools 2.0 therefore has no `debug` category and no console-writing helper.
Public modules remain inert at import time and compatible with
`sideEffects: false`. A reusable operation may accept an explicitly documented
diagnostic callback only when a real consumer needs observable progress; the
default must do nothing, and callback failure behavior must be part of that
operation's contract.

Function timing remains a direct composition of the relevant platform clock and
the work being measured. COMPOSR owns profiling that produces COMPOSR records.
A future diagnostics abstraction would first need shared decisions for event
shape, levels, redaction, context propagation, sink failure, sync/async delivery,
and production removal. A generic wrapper around `console` or `performance.now()`
does not justify a permanent category.

## Prototype and constructor augmentation

Akashatools 2.0 will not publish an opt-in augmentation entry for
`Array.prototype`, `Array`, `Object.prototype`, or other built-ins. Making a
property non-enumerable and checking for a collision before installation does
not make shared global mutation composable:

- a later platform, polyfill, test, or package can claim the same name after the
  check;
- an uninstall function cannot safely restore ownership when another actor has
  replaced or reconfigured the property;
- patching one realm does not patch arrays created in iframes, workers, VM
  contexts, or other realms;
- multiple installed Akashatools copies cannot reliably identify which copy owns
  the property;
- ambient TypeScript declarations would advertise the method even where the
  installing side effect did not run;
- a side-effect entry weakens the package-wide `sideEffects: false` and focused-
  import guarantees even if ordinary imports remain inert; and
- `Array.has` moves the same collision and ownership problems to the constructor
  rather than removing them.

There is no safe `Object.prototype` version: a universal `value.has()` endpoint
would affect nearly every object and risks collisions far beyond arrays.

The supported dot-style alternative is the explicit, frozen
`deepQuery(value).has(...)` view, which accepts arrays as structured roots and
delegates to the same bounded atomic search functions. Category namespaces and
granular subpaths provide discovery for array transforms without binding methods
to a particular value. This keeps every modern package import inert, a property
enforced by a regression that snapshots the complete descriptors of Array,
Object, Date, and their prototypes before importing every modern entry point.
