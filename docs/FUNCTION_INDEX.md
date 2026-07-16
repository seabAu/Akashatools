# Akashatools function and migration index

> Generated from public source exports and `UTILITY_INVENTORY.md` by
> `npm run docs:migration`. Edit those sources, not this file.

Use browser/editor search on this page for either a canonical name or a 1.x
`module.export` name. A blank replacement means the behavior is native,
rejected, deferred, or application-owned; read the decision rather than assuming
drop-in compatibility.

## Canonical 2.0 exports

| Name | Category | Runtime | Mutation/effect | Focused import | Related 1.x names |
| --- | --- | --- | --- | --- | --- |
| `asArray` | array | universal | no input mutation | `akashatools/array` | None |
| `assertJsonContract` | validation | universal | no input mutation | `akashatools/validation` | None |
| `camelCase` | string | universal | no input mutation | `akashatools/string` | None |
| `capitalize` | string | universal | no input mutation | `akashatools/string` | `String.toCapitalCase` |
| `chunk` | array | universal | no input mutation | `akashatools/array` | None |
| `clamp` | number | universal | no input mutation | `akashatools/number` | `Math.clamp` |
| `clock12To24` | date | universal | no input mutation | `akashatools/date` | None |
| `clock24To12` | date | universal | no input mutation | `akashatools/date` | None |
| `clockTimeToMinutes` | date | universal | no input mutation | `akashatools/date` | None |
| `cloneJson` | object | universal | no input mutation | `akashatools/object` | None |
| `compact` | array | universal | no input mutation | `akashatools/array` | `AO.removeEmpty`, `AO.cleanArray` |
| `compareNumericOrder` | sort | universal | no input mutation | `akashatools/sort` | None |
| `compareValues` | sort | universal | no input mutation | `akashatools/sort` | None |
| `countBy` | array | universal | no input mutation | `akashatools/array` | None |
| `countWords` | string | universal | no input mutation | `akashatools/string` | None |
| `createCollatorComparator` | sort | universal | no input mutation | `akashatools/sort` | None |
| `createKeyedSingleFlight` | async | universal | no input mutation | `akashatools/async` | None |
| `createSingleFlight` | async | universal | no input mutation | `akashatools/async` | None |
| `daysInMonth` | date | universal | no input mutation | `akashatools/date` | None |
| `deepClone` | object | universal | no input mutation | `akashatools/object` | `AO.cloneObj`, `AO.deepCopy`, `AO.deepCopyJSON` |
| `deepMerge` | object | universal | no input mutation | `akashatools/object` | None |
| `delay` | async | universal | timer effect | `akashatools/async` | None |
| `differenceInLocalDays` | date | universal | no input mutation | `akashatools/date` | None |
| `distance` | number | universal | no input mutation | `akashatools/number` | `Math.distance` |
| `distance2d` | number | universal | no input mutation | `akashatools/number` | `Math.distance2` |
| `downloadBlob` | browser | browser-effect | browser effect | `akashatools/browser` | None |
| `downloadJson` | browser | browser-effect | browser effect | `akashatools/browser` | None |
| `downloadTextFile` | browser | browser-effect | browser effect | `akashatools/browser` | None |
| `escapeHtml` | string | universal | no input mutation | `akashatools/string` | `Val.escapeHtml` |
| `excludeBy` | collection | universal | no input mutation | `akashatools/collection` | None |
| `excludeIds` | collection | universal | no input mutation | `akashatools/collection` | None |
| `fibonacci` | number | universal | no input mutation | `akashatools/number` | None |
| `findDeep` | object | universal | no input mutation | `akashatools/object` | None |
| `flatten` | array | universal | no input mutation | `akashatools/array` | `AO.flatten` |
| `formatBytes` | number | universal | no input mutation | `akashatools/number` | None |
| `formatDate` | date | universal | no input mutation | `akashatools/date` | `Time.convertDate`, `Time.formatDate` |
| `formatDateTime` | date | universal | no input mutation | `akashatools/date` | None |
| `formatDuration` | date | universal | no input mutation | `akashatools/date` | None |
| `formatNanpPhone` | validation | universal | no input mutation | `akashatools/validation` | None |
| `formatRelativeTime` | date | universal | no input mutation | `akashatools/date` | None |
| `fromUnixSeconds` | date | universal | no input mutation | `akashatools/date` | None |
| `fulfilledValues` | async | universal | no input mutation | `akashatools/async` | None |
| `getAtPath` | object | universal | no input mutation | `akashatools/object` | None |
| `globPaths` | node | node | no input mutation | `akashatools/node` | None |
| `groupBy` | array | universal | no input mutation | `akashatools/array` | None |
| `hasAtPath` | object | universal | no input mutation | `akashatools/object` | `AO.has` |
| `HttpError` | http | universal | no input mutation | `akashatools/http` | `Http.constructFetchError`, `Http.handleFetchResponse`, `Http.parseError` |
| `includesText` | string | universal | no input mutation | `akashatools/string` | `AO.valContains`, `String.subStringSearch` |
| `insertItem` | array | universal | no input mutation | `akashatools/array` | None |
| `intersection` | array | universal | no input mutation | `akashatools/array` | None |
| `isBlank` | validation | universal | no input mutation | `akashatools/validation` | `Val.isValid`, `Val.isBlank` |
| `isBlob` | validation | universal | no input mutation | `akashatools/validation` | `Val.isBlob` |
| `isDefined` | validation | universal | no input mutation | `akashatools/validation` | `Val.valid`, `Val.isValid`, `Val.isDefined` |
| `isEmail` | validation | universal | no input mutation | `akashatools/validation` | None |
| `isEmpty` | validation | universal | no input mutation | `akashatools/validation` | `Val.isValid` |
| `isFile` | validation | universal | no input mutation | `akashatools/validation` | `Val.isFile` |
| `isFiniteNumber` | validation | universal | no input mutation | `akashatools/validation` | `Val.isNumber` |
| `isJson` | validation | universal | no input mutation | `akashatools/validation` | `Val.isJSON` |
| `isMap` | validation | universal | no input mutation | `akashatools/validation` | `Val.isMap` |
| `isNonEmptyArray` | array | universal | no input mutation | `akashatools/array` | `Val.isValidArray` |
| `isPlainObject` | object | universal | no input mutation | `akashatools/object` | `Val.isObject` |
| `isPlainObjectArray` | validation | universal | no input mutation | `akashatools/validation` | `Val.isObjectArray` |
| `isSafeInteger` | validation | universal | no input mutation | `akashatools/validation` | `Val.isSafeInt` |
| `isSameLocalDay` | date | universal | no input mutation | `akashatools/date` | None |
| `isSet` | validation | universal | no input mutation | `akashatools/validation` | `Val.isSet` |
| `isToday` | date | universal | no input mutation | `akashatools/date` | None |
| `isTypedArray` | validation | universal | no input mutation | `akashatools/validation` | None |
| `isValidDate` | date | universal | no input mutation | `akashatools/date` | None |
| `isWithinInstantRange` | date | universal | no input mutation | `akashatools/date` | None |
| `kebabCase` | string | universal | no input mutation | `akashatools/string` | `String.toKebabCase` |
| `localDateKey` | date | universal | no input mutation | `akashatools/date` | `Time.convertTimestampToYYYYMMDDDD`, `Time.formatTimestampDDMMYYYY` |
| `longestStringLength` | string | universal | no input mutation | `akashatools/string` | `String.getLongest` |
| `mapSettledWithConcurrency` | async | universal | no input mutation | `akashatools/async` | None |
| `minutesToClockTime` | date | universal | no input mutation | `akashatools/date` | None |
| `moveItem` | array | universal | no input mutation | `akashatools/array` | None |
| `normalizeInstantRange` | date | universal | no input mutation | `akashatools/date` | None |
| `normalizeNanpPhone` | validation | universal | no input mutation | `akashatools/validation` | None |
| `omit` | object | universal | no input mutation | `akashatools/object` | `AO.removeKey` |
| `parseContentDispositionFilename` | http | universal | no input mutation | `akashatools/http` | None |
| `parsePath` | object | universal | no input mutation | `akashatools/object` | None |
| `partition` | array | universal | no input mutation | `akashatools/array` | None |
| `pascalCase` | string | universal | no input mutation | `akashatools/string` | `String.toUpperCamelCase` |
| `pick` | object | universal | no input mutation | `akashatools/object` | `AO.extractKeys`, `AO.filterKeys` |
| `pickAllowed` | object | universal | no input mutation | `akashatools/object` | None |
| `prettyJson` | string | universal | no input mutation | `akashatools/string` | None |
| `randomBoolean` | random | universal | no input mutation | `akashatools/random` | `Math.boolRand` |
| `randomDate` | random | universal | no input mutation | `akashatools/random` | None |
| `randomFloat` | random | universal | no input mutation | `akashatools/random` | `Rand.rand` |
| `randomInt` | random | universal | no input mutation | `akashatools/random` | None |
| `randomString` | random | universal | no input mutation | `akashatools/random` | `Rand.randString` |
| `range` | array | universal | no input mutation | `akashatools/array` | None |
| `redactHeaders` | http | universal | no input mutation | `akashatools/http` | None |
| `removeFromArray` | array | universal | no input mutation | `akashatools/array` | None |
| `replaceMany` | string | universal | no input mutation | `akashatools/string` | `String.replaceMultiple` |
| `replaceRegex` | string | universal | no input mutation | `akashatools/string` | `String.replaceMultiple` |
| `request` | http | universal | network effect | `akashatools/http` | `Http.handleBasicFetch`, `Http.fetchData`, `Http.handleFetchResponse`, `Http.handleFetch`, `File.importFile` |
| `resolveContainedPath` | node | node | no input mutation | `akashatools/node` | None |
| `resolveExistingContainedPath` | node | node | filesystem read | `akashatools/node` | None |
| `roundTo` | number | universal | no input mutation | `akashatools/number` | `Math.round` |
| `safeFilename` | string | universal | no input mutation | `akashatools/string` | None |
| `secureRandomString` | random | universal | no input mutation | `akashatools/random` | None |
| `secureRandomUuid` | random | universal | no input mutation | `akashatools/random` | None |
| `sentenceCase` | string | universal | no input mutation | `akashatools/string` | None |
| `setAtPath` | object | universal | no input mutation | `akashatools/object` | `AO.deepFindSet`, `AO.findAndSetObject` |
| `shuffle` | array | universal | no input mutation | `akashatools/array` | None |
| `slugify` | string | universal | no input mutation | `akashatools/string` | None |
| `sortBy` | sort | universal | no input mutation | `akashatools/sort` | `AO.keySortData`, `AO.sortObjArray` |
| `sortByMany` | sort | universal | no input mutation | `akashatools/sort` | None |
| `sortByNumericOrder` | sort | universal | no input mutation | `akashatools/sort` | `AO.sortObjArray` |
| `splitTextByLimits` | string | universal | no input mutation | `akashatools/string` | None |
| `stableJson` | string | universal | no input mutation | `akashatools/string` | None |
| `startOfLocalDay` | date | universal | no input mutation | `akashatools/date` | None |
| `subtract` | number | universal | no input mutation | `akashatools/number` | `Math.sub` |
| `sum` | number | universal | no input mutation | `akashatools/number` | `Math.add` |
| `summarizeNumbers` | number | universal | no input mutation | `akashatools/number` | None |
| `toBinary` | number | universal | no input mutation | `akashatools/number` | `Math.decToBinary` |
| `toDate` | date | universal | no input mutation | `akashatools/date` | None |
| `toUnixSeconds` | date | universal | no input mutation | `akashatools/date` | None |
| `traverseObject` | object | universal | no input mutation | `akashatools/object` | None |
| `typeOf` | validation | universal | no input mutation | `akashatools/validation` | `Val.getType` |
| `unique` | array | universal | no input mutation | `akashatools/array` | `AO.uniqueArray` |
| `upsertBy` | collection | universal | no input mutation | `akashatools/collection` | None |
| `upsertById` | collection | universal | no input mutation | `akashatools/collection` | None |
| `utf8ByteLength` | string | universal | no input mutation | `akashatools/string` | None |
| `validateJsonContract` | validation | universal | no input mutation | `akashatools/validation` | None |
| `wrap` | number | universal | no input mutation | `akashatools/number` | `Math.wrap` |
| `zip` | array | universal | no input mutation | `akashatools/array` | None |

## Akashatools 1.0.2 migration lookup

| Legacy name | Canonical replacement or related 2.0 API | Decision |
| --- | --- | --- |
| `AO.arrayToEnum` | None | Merge into a future safe `keyBy`/lookup builder only if consumers need it. |
| `AO.isOneOf` | None | Native `Array.prototype.includes`. |
| `AO.uniqueArray` | replacement: `array.unique` | Adopted as `array.unique`. |
| `AO.mergeArray` | None | Native spread/`concat`; merge deduplicated behavior into future `union`. |
| `AO.replaceIfInvalid` | None | Merge with `cleanInvalid` into an explicitly named fallback helper; prefer `??` for nullish values. |
| `AO.removeEmpty` | related: `array.compact` | Merge as an explicit predicate/filter recipe; `compact` remains nullish-only. |
| `AO.parseTextToArray` | None | Merge into a future `splitMany` with escaped alternation or deterministic scanning. |
| `AO.cleanJSON` | None | Reject the misleading name; reconsider only as schema-driven example/model initialization. |
| `AO.sanitizeObj` | None | Reject. |
| `AO.sanitizeObjArray` | None | Reject. |
| `AO.formatObjArray` | None | App-local formatting or redesign as a mapper supplied by the caller. |
| `AO.cleanArray` | related: `array.compact` | Native `array.filter(Boolean)`; do not conflate with nullish `compact`. |
| `AO.removeKey` | replacement: `object.omit` | Adopted as `object.omit` for one or many keys. |
| `AO.findOne` | None | Merge into separate `findBy`, text predicate, and property access operations; reject shape-changing return. |
| `AO.findAll` | None | Native `filter` plus `map`, or future `findAllBy` if usage supports it. |
| `AO.objectFindByKey` | None | Native `find`; reject sentinel return shape. |
| `AO.splice` | None | Reject; use immutable `map` plus object spread. |
| `AO.flatten` | replacement: `array.flatten` | Adopted strict `array.flatten`, delegating to native `flat` with documented depth and sparse-slot behavior. |
| `AO.flattenObj` | None | Defer a safe path-aware record flattener. |
| `AO.flattenObjArray` | None | Merge only after a canonical record-flatten contract exists. |
| `AO.flatMapObjText` | None | App-local presentation. |
| `AO.validateObject` | None | Reject implementation; use `keys.every(key => Object.hasOwn(value, key))` or future `hasOwnKeys`. |
| `AO.validateObjectArray` | None | Reject implementation; reconsider as `filter` plus `hasOwnKeys`. |
| `AO.hasKeys` | None | Reject; split predicate and filter behaviors. |
| `AO.extractKey` | None | Native `map`; possible documented `pluck` only if frequent use warrants it. |
| `AO.extractKeyArray` | None | Merge with `extractKey`; prefer native `map`. |
| `AO.extractKeys` | related: `object.pick` | Compose `map` with adopted `object.pick`. |
| `AO.getObjKeys` | None | App-local UI adapter. |
| `AO.objValsToArray` | None | Native `Object.values`. |
| `AO.arrayToObjArray` | None | Native `map`; unsafe property names would need protection in a wrapper. |
| `AO.keySortData` | replacement: `sort.sortBy` | Adopted/generalized as `sort.sortBy`. |
| `AO.filterKeys` | replacement: `object.pick` | Adopted as `object.pick`. |
| `AO.filterData` | None | Defer or keep app-local until real query semantics are captured. |
| `AO.filterDataFast` | None | Reject as a duplicate implementation; disposition behavior-by-behavior with `filterData`. |
| `AO.has` | related: `object.hasAtPath` | Merge into the planned cycle-safe traversal API; shallow paths use `hasAtPath`. |
| `AO.hasAll` | None | Reject implementation; redesign on top of canonical traversal. |
| `AO.valContains` | replacement: `string.includesText` | Adopted for actual strings as `string.includesText`; non-string search requires a separate explicit serializer/search API. |
| `AO.objContains` | None | Merge into canonical traversal/search. |
| `AO.arrayContains` | None | Merge into canonical traversal/search; primitive membership uses native `includes`. |
| `AO.deepGetKey` | None | Merge into path-aware traversal results. |
| `AO.deepSearch` | None | Merge into traversal results shaped as `{ value, key, path, parent }`. |
| `AO.deepSearchItems` | None | Reject implementation; merge behavior into canonical traversal. |
| `AO.deepFindSet` | related: `object.setAtPath` | Reject; use `setAtPath` for known paths and design predicate-based deep update separately. |
| `AO.cloneObj` | replacement: `object.deepClone` | Adopted replacement `object.deepClone` using `structuredClone`. |
| `AO.deepCopy` | replacement: `object.deepClone` | Adopted replacement `object.deepClone`. |
| `AO.deepCopyJSON` | replacement: `object.deepClone` | Adopted replacement `object.deepClone`; keep JSON round-trip only as explicit serialization. |
| `AO.findAndSetObject` | related: `object.setAtPath` | Defer a cycle-safe predicate update API; known paths use `setAtPath`. |
| `AO.sortObject` | None | Native `Object.fromEntries(Object.entries(value).sort(...))`; adopt only if consumer evidence warrants. |
| `AO.sortObjArray` | replacement: `sort.sortBy`, replacement: `sort.sortByNumericOrder` | Adopted immutable replacements `sortBy`/`sortByNumericOrder`. |
| `Val.valid` | related: `validation.isDefined` | Reject; adopted literal predicate `validation.isDefined`. |
| `Val.isValid` | related: `validation.isDefined`, related: `validation.isBlank`, related: `validation.isEmpty` | Reject umbrella predicate; use `isDefined`, `isBlank`, `isEmpty`, or a domain validator. |
| `Val.validate` | None | Reject; compose explicit predicates with `every`. |
| `Val.cleanInvalid` | None | Merge with `replaceIfInvalid` into a clearly named fallback helper if needed. |
| `Val.isDefined` | replacement: `validation.isDefined` | Adopted as `validation.isDefined`. |
| `Val.isTruthy` | None | Reject misleading name; use native Boolean or literal predicates. |
| `Val.isString` | None | Defer/add a canonical type guard during validation expansion. |
| `Val.isNumber` | related: `validation.isFiniteNumber` | Use explicit `validation.isFiniteNumber` where numeric APIs require usable finite values; raw primitive checks remain native. |
| `Val.isNum` | None | Reject duplicate; legacy alias maps to the eventual canonical predicate. |
| `Val.isInt` | None | Native `Number.isInteger`; possible canonical type guard. |
| `Val.isSafeInt` | replacement: `validation.isSafeInteger` | Adopted as explicit `validation.isSafeInteger`; native `Number.isSafeInteger` remains equally valid inline. |
| `Val.isFloat` | None | Reject name/semantics; consider `isFiniteNonInteger`. |
| `Val.isBool` | None | Native `typeof value === "boolean"`; possible canonical type guard. |
| `Val.isBlank` | replacement: `validation.isBlank` | Adopted replacement `validation.isBlank` with literal nullish/whitespace semantics. |
| `Val.escapeHtml` | replacement: `string.escapeHtml` | Adopted under `string.escapeHtml`, documented as escaping rather than sanitization. |
| `Val.isJSONRegex` | None | Reject. |
| `Val.isJSON` | replacement: `validation.isJson` | Adopted replacement `validation.isJson`, accepting all valid JSON text. |
| `Val.isMap` | replacement: `validation.isMap` | Adopted as `validation.isMap` with a cross-realm brand check. |
| `Val.isSet` | replacement: `validation.isSet` | Adopted as `validation.isSet` with a cross-realm brand check. |
| `Val.isFile` | replacement: `validation.isFile` | Adopted as `validation.isFile` using safe `globalThis.File` detection. |
| `Val.isBlob` | replacement: `validation.isBlob` | Adopted as `validation.isBlob` using safe `globalThis.Blob` detection. |
| `Val.isObject` | related: `object.isPlainObject` | Split into adopted `object.isPlainObject` and a future explicitly named object-like guard. |
| `Val.isArray` | None | Native `Array.isArray`. |
| `Val.isValidArray` | replacement: `array.isNonEmptyArray` | Adopted clear predicate `array.isNonEmptyArray`; use `Array.isArray` when emptiness is allowed. |
| `Val.arrayContainsObjects` | None | Merge into explicit `some(isPlainObject)` or `every(isPlainObject)` recipes. |
| `Val.isObjectArray` | related: `validation.isPlainObjectArray` | Reject ambiguous semantics; adopted `validation.isPlainObjectArray`, which requires every item to be a plain object and explicitly accepts an empty array. |
| `Val.isAO` | None | Reject abbreviation; use explicit array/plain-object/object-like predicates. |
| `Val.getType` | replacement: `validation.typeOf` | Adopted basic replacement `validation.typeOf`; richer array analysis remains separate. |
| `Val.getFieldType` | None | App-local/schema UI adapter. |
| `Val.getArrayType` | None | Defer a structured `inspectArrayTypes` result if consumer evidence warrants it. |
| `Time.convertDate` | related: `date.formatDate` | Merge into adopted `date.formatDate` with explicit `Intl` options. |
| `Time.sec2str` | None | Defer a duration formatter with a stable grammar. |
| `Time.elapsed` | None | Merge into a named duration/difference helper with unit-explicit inputs. |
| `Time.timeElapsed` | None | Reject implementation; future composition of elapsed duration and formatter. |
| `Time.estimate` | None | Reject signature; design `estimateRemaining` explicitly. |
| `Time.timeEstimate` | None | Reject. |
| `Time.dateStr2LocaleDateStr` | None | App-local portfolio/resume presentation or redesign as explicit parser. |
| `Time.generateDateOptions` | None | App-local UI adapter. |
| `Time.convertTimestampToYYYYMMDDDD` | related: `date.localDateKey` | Merge into adopted `date.localDateKey`. |
| `Time.convertYYYYMMDDDDtoTimestamp` | None | Reject; use explicit local-date parsing when designed. |
| `Time.formatDate` | replacement: `date.formatDate` | Adopted stricter `date.formatDate`. |
| `Time.formatDateDMY` | None | Merge as a documented formatter preset rather than duplicate implementation. |
| `Time.formatDateDDMMYYYY` | None | Reject duplicate; same future preset. |
| `Time.formatTimestampDDMMYYYY` | related: `date.localDateKey` | Reject misleading alias; adopted `localDateKey` covers actual output. |
| `String.toCapitalCase` | replacement: `string.capitalize` | Adopted Unicode-aware `string.capitalize`. |
| `String.toKebabCase` | replacement: `string.kebabCase` | Adopted generalized `string.kebabCase`. |
| `String.toUpperCamelCase` | replacement: `string.pascalCase` | Adopted generalized `string.pascalCase`. |
| `String.subStringSearch` | replacement: `string.includesText` | Adopted `string.includesText` with a named option. |
| `String.replaceMultiple` | replacement: `string.replaceMany`, replacement: `string.replaceRegex` | Adopted safe literal `string.replaceMany`; explicit regex behavior uses `string.replaceRegex` with a cloned caller RegExp. |
| `String.getLongest` | replacement: `string.longestStringLength` | Adopted `string.longestStringLength`. |
| `Math.clamp` | replacement: `number.clamp` | Adopted strict `number.clamp`. |
| `Math.wrap` | replacement: `number.wrap` | Adopted strict `number.wrap`. |
| `Math.round` | replacement: `number.roundTo` | Adopted as `number.roundTo` with precision bounds. |
| `Math.add` | replacement: `number.sum` | Adopted strict `number.sum`. |
| `Math.sub` | related: `number.subtract` | Reject as a likely defect; canonical `number.subtract(first, ...rest)` is explicit. |
| `Math.distance` | replacement: `number.distance` | Adopted strict `number.distance`. |
| `Math.distance2` | related: `number.distance2d` | Merge object-coordinate compatibility into or alongside adopted tuple-based `distance2d` only if consumers require it. |
| `Math.boolRand` | related: `random.randomBoolean` | Split into adopted `randomBoolean` and future explicit `randomSign`. |
| `Math.decToBinary` | replacement: `number.toBinary` | Adopted `number.toBinary`, returning a string. |
| `Rand.rand` | replacement: `random.randomFloat` | Adopted `random.randomFloat(minimum, maximum, random)`, with a breaking argument-order correction. |
| `Rand.randString` | replacement: `random.randomString` | Adopted `random.randomString` with security warning and injectable source. |
| `Http.handleBasicFetch` | related: `http.request` | Reject implementation; adopted `http.request` checks status and exposes explicit parsing. |
| `Http.fetchData` | related: `http.request` | Reject; compose adopted `http.request` with an application callback only where needed. |
| `Http.constructFetchError` | replacement: `http.HttpError` | Replace with a typed `HttpError` data contract. |
| `Http.handleFetchResponse` | related: `http.request`, related: `http.HttpError` | Reject; adopted `http.request` provides explicit status/body parsing and `HttpError`. |
| `Http.parseError` | related: `http.HttpError` | Reject; preserve adopted `HttpError` instances and causes instead. |
| `Http.handleFetch` | related: `http.request` | Reject; adopted `http.request` composes caller cancellation and timeout without delays or automatic retries. |
| `File.importFile` | related: `http.request` | Reject; use adopted `http.request` for URLs or a separate browser `File` reader for local files. |
| `File.checkImageURL` | None | Reject misleading validation claim; future helper must be named extension/syntax check or inspect media metadata. |
| `Debug.debug` | None | Reject generic helper and omit a 2.0 `debug` category; diagnostics stay operation/app-specific and inert by default. |
