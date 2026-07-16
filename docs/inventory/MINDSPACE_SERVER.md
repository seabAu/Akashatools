# Mindspace server utility inventory

Source reviewed read-only: `_Compass/Mindspace App/app/server/utilities` as of
2026-07-11.

This ledger covers all 43 named exports in the five remaining server utility
modules: 7 file exports, 1 Mongoose sanitizer, 6 Socket.IO registry exports, and
29 mixed server exports. `server.js` has no exports but is recorded because it
performs authentication work at import time.

## `file.js` (7 exports)

The module imports `multer` and `sharp` without using them. It mixes synchronous
filesystem access, Mindspace media records, URL fetching, logging, and deletion;
it is not a safe basis for the planned `node` surface.

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `findFilesByPattern` | Calls undeclared `glob`, so every call throws; result paths depend on an unstated glob dependency. | Replaced by Node-only `globPaths`, now that native globbing is stable in the supported Node 22.17+ runtime; canonical results are bounded, deduplicated, and sorted. |
| `saveFile` | Thin synchronous `writeFileSync` wrapper returns undefined and defines no encoding, atomicity, or directory policy. | Native Node API; future file writer must state overwrite/atomic behavior. |
| `getFile` | Reads a Mindspace media record synchronously as base64, logs paths, and decodes only `%20`. | App-local media adapter; reject as generic file read. |
| `getFiles` | Sequential-looking wrapper around `getFile`; uses unnecessary async callbacks and preserves the media-record contract. | App-local. |
| `deleteFile` | Accepts unrestricted paths, computes an unused file URL, logs, references undefined `error`, and a `finally` return converts caught failures to success. | Reject; future Node deletion needs contained-path and explicit missing-file semantics. |
| `importFile` | Starts `fetch` promise chains but returns before they settle, so it never returns imported data. | Reject; use future HTTP JSON helper or Node file read according to URL scheme. |
| `checkImageURL` | Regex checks only an HTTP(S) string's filename extension; query strings, MIME type, content, and URL validity are not established. | Reject misleading image-validity claim; use `URL` plus explicitly named extension/MIME/content checks. |

## `schema.sanitizer.js` (1 export)

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `sanitizePayloadAgainstSchema` | Allow-lists Mongoose paths and coerces strings, booleans, numbers, dates, ObjectIds, arrays, subdocuments, and Mixed values; policy depends on Mongoose metadata, drops empty values, host-parses dates, and does not explicitly reject dangerous object keys. | Keep as a Mongoose/application adapter; its small generic pieces are already covered by object/date/validation primitives. |

## `server.js` (0 exports)

This file imports application auth and Next.js headers, then performs a session
lookup with top-level `await`. It is app-owned executable code, not a utility,
and must not be imported or migrated into Akashatools.

## `socket.registry.js` (6 exports)

All six functions intentionally mutate a caller-owned `Map` and encode a
user-to-Socket.IO connection registry. The implementation is coherent for its
application purpose, but the IO liveness shape, user identity normalization,
event emission, and mutation contract are framework/domain behavior.

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `pruneStaleSockets` | Removes registered socket IDs not present in `io.sockets.sockets` and reports removals. | Keep app-local Socket.IO registry behavior. |
| `getUserSocketIds` | Normalizes legacy set/array/string values, optionally prunes, and mutates the registry to canonical sets. | App-local. |
| `hasUserSockets` | Boolean wrapper that can still normalize/mutate through the getter. | App-local; predicate side effects should remain documented there. |
| `registerUserSocket` | Enforces one user per socket by unregistering the ID globally before registration. | App-local identity policy. |
| `unregisterSocket` | Scans all users, mutates sets/map, and returns affected user IDs. | App-local. |
| `emitToUserSockets` | Prunes then emits a Socket.IO event to each live user socket. | Framework adapter; never a universal event helper. |

## `utils.js` (29 exports)

This file combines JWT/cookie policy, Express responses, Mongoose reflection,
Mongo graph queries, and generic-looking object/array helpers. Generic names do
not make those framework contracts portable.

| Mindspace export | Finding | Akashatools disposition |
| --- | --- | --- |
| `generateTokenAndSetCookie` | Signs a JWT and writes an Express cookie; `maxAge` is milliseconds but interpolating it as `${maxAge}d` makes the token lifetime about 1.296 billion days rather than 15 days. | App-owned authentication; reject implementation and fix in Mindspace separately when authorized. |
| `chkfxRequestID` | Logs IDs, mixes validation/coercion, and can call `.match` on a non-string. | Mongoose adapter; reject current implementation. |
| `isObjectIdValid` | Mongoose-specific canonical-string check with shape-dependent behavior. | Defer an explicitly named Mongo ObjectId predicate only if cross-project usage warrants a dependency. |
| `sendResponse` | Express response envelope with a surprising default 404 status and Mindspace error shape. | App/framework adapter. |
| `SpliceObjArray` | Mutates every array object using `Object.assign`; name does not describe merging. | Reject; use immutable `map` plus object spread or a named collection transform. |
| `catchAsync` | Express promise-middleware error forwarding. | Framework adapter; keep app-local or use a dedicated Express package. |
| `pick` | Shallow own-property selection with third-party attribution. | Already covered by independently implemented `object.pick`; retain attribution only in the source project. |
| `mergeProps` | Mongoose-document patching loses explicit falsy updates because it checks target values by truthiness. | Reject; use explicit own-property patch semantics. |
| `swapIfValid` | Replaces a value unless the candidate is nullish or an empty string. | Native conditional/composition; defer a precisely named nullish/blank fallback only if repeated. |
| `isObject` | Plain-object predicate based on exact constructor identity. | Covered by cross-realm-aware `object.isPlainObject`. |
| `objectDeepMerge` | Recursively mutates destination, accepts dangerous keys, has no cycle handling, and can recurse into incompatible destination values. | Reject; adopted secure immutable `object.deepMerge`. |
| `hasOwnProperty` | Safe call-form own-property predicate. | Native `Object.hasOwn`; no wrapper needed. |
| `parseSchema2` | First of two recursive Mongoose schema description formats with branch-specific output shapes. | App-local Mongoose reflection; reject duplicate public parser. |
| `parseSchema` | Second overlapping Mongoose parser; array/schema branches contain unreachable or inconsistent shape logic. | App-local; consolidate in Mindspace if still used. |
| `getPropertyType` | Infers labels from Mongoose schema definitions and constructor names. | App-local parser helper. |
| `getPropertyTypeFromConstructor` | Constructor-name helper coupled to Mongoose array/schema inference. | App-local. |
| `parsePropertyDetails` | Copies schema options, coerces `required` to boolean, and recursively unwraps the first array entry. | App-local Mongoose reflection. |
| `getMongooseArrayType` | Produces custom `ArrayOfX` labels from Mongoose definitions. | App-local. |
| `getSchemaInfo` | Walks Mongoose paths and spreads live schema-type instances into output; one object branch indexes `type[0]` despite having excluded arrays. | Reject implementation; keep any replacement in a Mongoose adapter. |
| `processSchema` | Recursively replaces constructor definitions with names, examines only the first array item, and has no cycle policy. | Defer only as part of an explicit schema-description format. |
| `getSchemaDefinition` | Third Mongoose schema-description implementation with a different result format. | App-local; choose one Mindspace contract before generalization. |
| `validateInputData` | Reports absent top-level keys with English copy but does not validate their values. | Use explicit required-own-key validation; keep response copy app-local. |
| `fetchNestedDocuments` | Runs Mongoose `$graphLookup`, populates models, mutates results, logs failures, and delegates domain tree building. | App-owned database query. |
| `isArray` | Adds only a redundant non-null test to `Array.isArray`. | Native `Array.isArray`. |
| `isValidArray` | Rejects arrays whose first slot is missing/undefined and has a positional length flag with confusing semantics. | Reject; use `isNonEmptyArray` or `Array.isArray` explicitly. |
| `isObjectArray` | Depends on the preceding predicate and merely requires at least one `typeof "object"` element. | Reject ambiguous name; future guards must say `some`/`every` and plain/object-like semantics. |
| `arrayContainsObjects` | Counts null, arrays, Dates, and any other object-like value as an object. | Reject; compose `some` with the desired predicate. |
| `isAO` | Returns true for arrays and nearly every object instance under an unexplained abbreviation. | Reject umbrella predicate; use literal type guards. |
| `handleCheckRequired` | Express response helper references undeclared `utils`, rejects meaningful falsy values, and has inconsistent success returns. | Reject broken implementation; validation and HTTP response presentation remain separate. |

## Result and overlap

- The remaining server utility modules contribute no dependency-free primitive
  that is both novel and sufficiently specified for immediate adoption.
- Existing canonical coverage includes `object.pick`, `object.isPlainObject`,
  `object.deepMerge`, `array.isNonEmptyArray`, and native `Array.isArray` and
  `Object.hasOwn`.
- Mongoose schema reflection/sanitization, Socket.IO registries, Express response
  helpers, JWT/cookie policy, and MongoDB queries remain framework or app owned.
- The eventual `node` surface must be designed after comparing portfolio and
  legacy file helpers. It needs contained-path, symlink, overwrite, atomicity,
  encoding, error, and async behavior contracts before accepting file operations.
- Import-time authentication, logging, hidden global/framework access, unsafe
  path deletion, prototype-pollutable merge, and silent failure are prohibited
  migration behavior.
