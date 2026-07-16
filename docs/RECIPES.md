# Akashatools recipes

These examples favor explicit contracts over compressed one-liners. See the
generated [API reference](./API_REFERENCE.md) for complete signatures.

## Normalize, compact, and batch an optional array

```js
import { asArray, compact, chunk } from "akashatools/array";

const batches = chunk(compact(asArray(input)), 25);
```

`asArray` preserves an existing array's identity; `compact` creates a dense copy
without null or undefined; `chunk` creates new batches. It deliberately retains
`0`, `false`, and empty strings.

## Remove a numeric value rather than an index

```js
import { removeFromArray } from "akashatools/array";

const remaining = removeFromArray([10, 20, 10], 10, {
  mode: "value",
  all: true,
});
```

Automatic mode treats an integer selector as an index. The named mode prevents
the most common ambiguous-removal bug.

## Read and immutably update nested data

```js
import { getAtPath, setAtPath } from "akashatools/object";

const name = getAtPath(profile, "person.name", "Anonymous");
const nextProfile = setAtPath(profile, "person.name", "Akasha");
```

Reads use own properties. Writes preserve unchanged branch identity and reject
prototype-mutating segments such as `__proto__`.

## Validate parsed JSON against the supported contract subset

```js
import { assertJsonContract } from "akashatools/validation";

assertJsonContract(payload, {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", minLength: 1 },
  },
  additionalProperties: false,
});
```

This is a documented subset, not a claim of full JSON Schema compatibility and
not a coercion layer.

## Use explicit instant-range boundaries

```js
import { isWithinInstantRange } from "akashatools/date";

const visible = isWithinInstantRange(timestamp, windowStart, windowEnd);
```

The default is start-inclusive and end-exclusive, which composes adjacent
ranges without double-counting a boundary.

## Fetch bounded JSON with caller cancellation

```js
import { request } from "akashatools/http";

const result = await request("https://api.example.com/items", {
  signal,
  timeoutMs: 15_000,
  maxResponseBytes: 2_000_000,
  responseType: "json",
});
```

The helper performs one attempt. Authentication, retry, envelopes, and UI error
handling compose outside it.

## Run bounded work and keep successful values

```js
import { fulfilledValues, mapSettledWithConcurrency } from "akashatools/async";

const settled = await mapSettledWithConcurrency(ids, 4, loadItem);
const items = fulfilledValues(settled);
```

Results retain input order and individual failures remain available in
`settled` for diagnostics or recovery.

## Discover Node paths with bounded native globbing

```js
import { globPaths } from "akashatools/node";

const sourcePattern = ["src", "**", "*.js"].join("/");
const files = await globPaths(sourcePattern, {
  cwd: projectRoot,
  exclude: ["**/*.generated.js"],
  absolute: true,
  maximumMatches: 20_000,
});
```

Results are deduplicated and sorted. Patterns retain native Node semantics, and
matches may be files or directories according to the pattern. Discovery does
not authorize later filesystem mutation or provide symlink containment.
