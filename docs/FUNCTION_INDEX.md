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
| `analyzeArrayTypes` | data | universal | no input mutation | `akashatools/data/analyzeArrayTypes` | `Val.getType`, `Val.getArrayType` |
| `asArray` | array | universal | no input mutation | `akashatools/array/asArray` | None |
| `assertJsonContract` | validation | universal | no input mutation | `akashatools/validation/assertJsonContract` | None |
| `camelCase` | string | universal | no input mutation | `akashatools/string/camelCase` | None |
| `capitalize` | string | universal | no input mutation | `akashatools/string/capitalize` | `String.toCapitalCase` |
| `chunk` | array | universal | no input mutation | `akashatools/array/chunk` | None |
| `clamp` | number | universal | no input mutation | `akashatools/number/clamp` | `Math.clamp` |
| `clock12To24` | date | universal | no input mutation | `akashatools/date/clock12To24` | None |
| `clock24To12` | date | universal | no input mutation | `akashatools/date/clock24To12` | None |
| `clockTimeToMinutes` | date | universal | no input mutation | `akashatools/date/clockTimeToMinutes` | None |
| `cloneJson` | object | universal | no input mutation | `akashatools/object/cloneJson` | None |
| `compact` | array | universal | no input mutation | `akashatools/array/compact` | `AO.removeEmpty`, `AO.cleanArray` |
| `compareNumericOrder` | sort | universal | no input mutation | `akashatools/sort/compareNumericOrder` | None |
| `compareValues` | sort | universal | no input mutation | `akashatools/sort/compareValues` | None |
| `controlTypeForType` | input | universal | no input mutation | `akashatools/input/controlTypeForType` | None |
| `controlTypeForValue` | input | universal | no input mutation | `akashatools/input/controlTypeForValue` | `Val.getFieldType` |
| `countBy` | array | universal | no input mutation | `akashatools/array/countBy` | None |
| `countWords` | string | universal | no input mutation | `akashatools/string/countWords` | None |
| `createCollatorComparator` | sort | universal | no input mutation | `akashatools/sort/createCollatorComparator` | None |
| `createConcurrencyLimiter` | async | universal | no input mutation | `akashatools/async/createConcurrencyLimiter` | None |
| `createKeyedConcurrencyLimiter` | async | universal | no input mutation | `akashatools/async/createKeyedConcurrencyLimiter` | None |
| `createKeyedSingleFlight` | async | universal | no input mutation | `akashatools/async/createKeyedSingleFlight` | None |
| `createSingleFlight` | async | universal | no input mutation | `akashatools/async/createSingleFlight` | None |
| `daysInMonth` | date | universal | no input mutation | `akashatools/date/daysInMonth` | None |
| `deepClone` | object | universal | no input mutation | `akashatools/object/deepClone` | `AO.cloneObj`, `AO.deepCopy`, `AO.deepCopyJSON` |
| `deepMerge` | object | universal | no input mutation | `akashatools/object/deepMerge` | None |
| `deepQuery` | object | universal | no input mutation | `akashatools/object/deepQuery` | `AO.has` |
| `defaultIfBlank` | validation | universal | no input mutation | `akashatools/validation/defaultIfBlank` | `AO.replaceIfInvalid`, `Val.cleanInvalid` |
| `defaultValueFor` | data | universal | no input mutation | `akashatools/data/defaultValueFor` | None |
| `defaultValueForType` | data | universal | no input mutation | `akashatools/data/defaultValueForType` | None |
| `delay` | async | universal | timer effect | `akashatools/async/delay` | None |
| `differenceInLocalDays` | date | universal | no input mutation | `akashatools/date/differenceInLocalDays` | None |
| `distance` | number | universal | no input mutation | `akashatools/number/distance` | `Math.distance` |
| `distance2d` | number | universal | no input mutation | `akashatools/number/distance2d` | `Math.distance2` |
| `downloadBlob` | browser | browser-effect | browser effect | `akashatools/browser/downloadBlob` | None |
| `downloadJson` | browser | browser-effect | browser effect | `akashatools/browser/downloadJson` | None |
| `downloadTextFile` | browser | browser-effect | browser effect | `akashatools/browser/downloadTextFile` | None |
| `escapeHtml` | string | universal | no input mutation | `akashatools/string/escapeHtml` | `Val.escapeHtml` |
| `excludeBy` | collection | universal | no input mutation | `akashatools/collection/excludeBy` | None |
| `excludeIds` | collection | universal | no input mutation | `akashatools/collection/excludeIds` | None |
| `fibonacci` | number | universal | no input mutation | `akashatools/number/fibonacci` | None |
| `fieldDescriptorFor` | input | universal | no input mutation | `akashatools/input/fieldDescriptorFor` | None |
| `fieldsFromData` | input | universal | no input mutation | `akashatools/input/fieldsFromData` | None |
| `findAllDeep` | object | universal | no input mutation | `akashatools/object/findAllDeep` | `AO.objContains` |
| `findAllDeepMatches` | object | universal | no input mutation | `akashatools/object/findAllDeepMatches` | `AO.deepSearchItems` |
| `findAllDeepParents` | object | universal | no input mutation | `akashatools/object/findAllDeepParents` | None |
| `findAllDeepValues` | object | universal | no input mutation | `akashatools/object/findAllDeepValues` | `AO.deepGetKey` |
| `findDeep` | object | universal | no input mutation | `akashatools/object/findDeep` | `AO.objContains`, `AO.deepSearch` |
| `findDeepMatch` | object | universal | no input mutation | `akashatools/object/findDeepMatch` | `AO.deepSearch` |
| `findDeepParent` | object | universal | no input mutation | `akashatools/object/findDeepParent` | `AO.deepSearch` |
| `findDeepValue` | object | universal | no input mutation | `akashatools/object/findDeepValue` | `AO.deepGetKey`, `AO.deepSearch` |
| `flatten` | array | universal | no input mutation | `akashatools/array/flatten` | `AO.flatten` |
| `formatBytes` | number | universal | no input mutation | `akashatools/number/formatBytes` | None |
| `formatDate` | date | universal | no input mutation | `akashatools/date/formatDate` | `Time.convertDate`, `Time.formatDate` |
| `formatDateTime` | date | universal | no input mutation | `akashatools/date/formatDateTime` | None |
| `formatDuration` | date | universal | no input mutation | `akashatools/date/formatDuration` | None |
| `formatNanpPhone` | validation | universal | no input mutation | `akashatools/validation/formatNanpPhone` | None |
| `formatRelativeTime` | date | universal | no input mutation | `akashatools/date/formatRelativeTime` | None |
| `fromUnixSeconds` | date | universal | no input mutation | `akashatools/date/fromUnixSeconds` | None |
| `fulfilledValues` | async | universal | no input mutation | `akashatools/async/fulfilledValues` | None |
| `getAtJsonPointer` | object | universal | no input mutation | `akashatools/object/getAtJsonPointer` | None |
| `getAtPath` | object | universal | no input mutation | `akashatools/object/getAtPath` | None |
| `globPaths` | node | node | no input mutation | `akashatools/node/globPaths` | None |
| `groupBy` | array | universal | no input mutation | `akashatools/array/groupBy` | None |
| `hasAtJsonPointer` | object | universal | no input mutation | `akashatools/object/hasAtJsonPointer` | None |
| `hasAtPath` | object | universal | no input mutation | `akashatools/object/hasAtPath` | `AO.has` |
| `hasDeep` | object | universal | no input mutation | `akashatools/object/hasDeep` | `AO.has`, `AO.hasAll`, `AO.objContains`, `AO.arrayContains` |
| `HttpError` | http | universal | no input mutation | `akashatools/http/HttpError` | `Http.constructFetchError`, `Http.handleFetchResponse`, `Http.parseError` |
| `includesText` | string | universal | no input mutation | `akashatools/string/includesText` | `AO.valContains`, `String.subStringSearch` |
| `initializeLike` | data | universal | no input mutation | `akashatools/data/initializeLike` | `AO.cleanJSON` |
| `inputTypeForType` | input | universal | no input mutation | `akashatools/input/inputTypeForType` | None |
| `inputTypeForValue` | input | universal | no input mutation | `akashatools/input/inputTypeForValue` | `Val.getFieldType` |
| `insertItem` | array | universal | no input mutation | `akashatools/array/insertItem` | None |
| `intersection` | array | universal | no input mutation | `akashatools/array/intersection` | None |
| `isArray` | validation | universal | no input mutation | `akashatools/validation/isArray` | `Val.isArray`, `Val.isValidArray`, `Val.isAO` |
| `isBlank` | validation | universal | no input mutation | `akashatools/validation/isBlank` | `Val.isValid`, `Val.isTruthy`, `Val.isBlank` |
| `isBlob` | validation | universal | no input mutation | `akashatools/validation/isBlob` | `Val.isBlob` |
| `isBoolean` | validation | universal | no input mutation | `akashatools/validation/isBoolean` | `Val.isBool` |
| `isDefined` | validation | universal | no input mutation | `akashatools/validation/isDefined` | `Val.valid`, `Val.isValid`, `Val.isDefined` |
| `isEmail` | validation | universal | no input mutation | `akashatools/validation/isEmail` | None |
| `isEmpty` | validation | universal | no input mutation | `akashatools/validation/isEmpty` | `Val.isValid` |
| `isFile` | validation | universal | no input mutation | `akashatools/validation/isFile` | `Val.isFile` |
| `isFiniteNonInteger` | validation | universal | no input mutation | `akashatools/validation/isFiniteNonInteger` | `Val.isFloat` |
| `isFiniteNumber` | validation | universal | no input mutation | `akashatools/validation/isFiniteNumber` | `Val.isNumber` |
| `isJson` | validation | universal | no input mutation | `akashatools/validation/isJson` | `Val.isJSON` |
| `isMap` | validation | universal | no input mutation | `akashatools/validation/isMap` | `Val.isMap` |
| `isNonArrayObject` | validation | universal | no input mutation | `akashatools/validation/isNonArrayObject` | `Val.isObject`, `Val.isAO` |
| `isNonEmptyArray` | array | universal | no input mutation | `akashatools/array/isNonEmptyArray` | `Val.isValidArray` |
| `isNumber` | validation | universal | no input mutation | `akashatools/validation/isNumber` | `Val.isNumber`, `Val.isNum` |
| `isPlainObject` | object | universal | no input mutation | `akashatools/object/isPlainObject` | `Val.isObject` |
| `isPlainObjectArray` | validation | universal | no input mutation | `akashatools/validation/isPlainObjectArray` | `Val.isObjectArray` |
| `isSafeInteger` | validation | universal | no input mutation | `akashatools/validation/isSafeInteger` | `Val.isSafeInt` |
| `isSameLocalDay` | date | universal | no input mutation | `akashatools/date/isSameLocalDay` | None |
| `isSet` | validation | universal | no input mutation | `akashatools/validation/isSet` | `Val.isSet` |
| `isString` | validation | universal | no input mutation | `akashatools/validation/isString` | `Val.isString` |
| `isToday` | date | universal | no input mutation | `akashatools/date/isToday` | None |
| `isTypedArray` | validation | universal | no input mutation | `akashatools/validation/isTypedArray` | None |
| `isValidDate` | date | universal | no input mutation | `akashatools/date/isValidDate` | None |
| `isWithinInstantRange` | date | universal | no input mutation | `akashatools/date/isWithinInstantRange` | None |
| `kebabCase` | string | universal | no input mutation | `akashatools/string/kebabCase` | `String.toKebabCase` |
| `localDateKey` | date | universal | no input mutation | `akashatools/date/localDateKey` | `Time.convertTimestampToYYYYMMDDDD`, `Time.formatTimestampDDMMYYYY` |
| `longestStringLength` | string | universal | no input mutation | `akashatools/string/longestStringLength` | `String.getLongest` |
| `mapSettledWithConcurrency` | async | universal | no input mutation | `akashatools/async/mapSettledWithConcurrency` | None |
| `minutesToClockTime` | date | universal | no input mutation | `akashatools/date/minutesToClockTime` | None |
| `moveItem` | array | universal | no input mutation | `akashatools/array/moveItem` | None |
| `normalizeDataType` | data | universal | no input mutation | `akashatools/data/normalizeDataType` | `Val.getType` |
| `normalizeInstantRange` | date | universal | no input mutation | `akashatools/date/normalizeInstantRange` | None |
| `normalizeNanpPhone` | validation | universal | no input mutation | `akashatools/validation/normalizeNanpPhone` | None |
| `omit` | object | universal | no input mutation | `akashatools/object/omit` | `AO.removeKey` |
| `parseContentDispositionFilename` | http | universal | no input mutation | `akashatools/http/parseContentDispositionFilename` | None |
| `parseJsonPointer` | object | universal | no input mutation | `akashatools/object/parseJsonPointer` | None |
| `parsePath` | object | universal | no input mutation | `akashatools/object/parsePath` | None |
| `partition` | array | universal | no input mutation | `akashatools/array/partition` | None |
| `pascalCase` | string | universal | no input mutation | `akashatools/string/pascalCase` | `String.toUpperCamelCase` |
| `pick` | object | universal | no input mutation | `akashatools/object/pick` | `AO.extractKeys`, `AO.filterKeys` |
| `pickAllowed` | object | universal | no input mutation | `akashatools/object/pickAllowed` | None |
| `prettyJson` | string | universal | no input mutation | `akashatools/string/prettyJson` | None |
| `randomBoolean` | random | universal | no input mutation | `akashatools/random/randomBoolean` | `Math.boolRand` |
| `randomDate` | random | universal | no input mutation | `akashatools/random/randomDate` | None |
| `randomFloat` | random | universal | no input mutation | `akashatools/random/randomFloat` | `Rand.rand` |
| `randomInt` | random | universal | no input mutation | `akashatools/random/randomInt` | None |
| `randomString` | random | universal | no input mutation | `akashatools/random/randomString` | `Rand.randString` |
| `range` | array | universal | no input mutation | `akashatools/array/range` | None |
| `redactHeaders` | http | universal | no input mutation | `akashatools/http/redactHeaders` | None |
| `removeFromArray` | array | universal | no input mutation | `akashatools/array/removeFromArray` | None |
| `replaceMany` | string | universal | no input mutation | `akashatools/string/replaceMany` | `String.replaceMultiple` |
| `replaceRegex` | string | universal | no input mutation | `akashatools/string/replaceRegex` | `String.replaceMultiple` |
| `request` | http | universal | network effect | `akashatools/http/request` | `Http.handleBasicFetch`, `Http.fetchData`, `Http.handleFetchResponse`, `Http.handleFetch`, `File.importFile` |
| `resolveContainedPath` | node | node | no input mutation | `akashatools/node/resolveContainedPath` | None |
| `resolveExistingContainedPath` | node | node | filesystem read | `akashatools/node/resolveExistingContainedPath` | None |
| `roundTo` | number | universal | no input mutation | `akashatools/number/roundTo` | `Math.round` |
| `safeFilename` | string | universal | no input mutation | `akashatools/string/safeFilename` | None |
| `secureRandomString` | random | universal | no input mutation | `akashatools/random/secureRandomString` | None |
| `secureRandomUuid` | random | universal | no input mutation | `akashatools/random/secureRandomUuid` | None |
| `sentenceCase` | string | universal | no input mutation | `akashatools/string/sentenceCase` | None |
| `setAtPath` | object | universal | no input mutation | `akashatools/object/setAtPath` | `AO.deepFindSet`, `AO.findAndSetObject` |
| `shuffle` | array | universal | no input mutation | `akashatools/array/shuffle` | None |
| `slugify` | string | universal | no input mutation | `akashatools/string/slugify` | None |
| `sortBy` | sort | universal | no input mutation | `akashatools/sort/sortBy` | `AO.keySortData`, `AO.sortObjArray` |
| `sortByMany` | sort | universal | no input mutation | `akashatools/sort/sortByMany` | None |
| `sortByNumericOrder` | sort | universal | no input mutation | `akashatools/sort/sortByNumericOrder` | `AO.sortObjArray` |
| `splitTextByLimits` | string | universal | no input mutation | `akashatools/string/splitTextByLimits` | None |
| `stableJson` | string | universal | no input mutation | `akashatools/string/stableJson` | None |
| `startOfLocalDay` | date | universal | no input mutation | `akashatools/date/startOfLocalDay` | None |
| `subtract` | number | universal | no input mutation | `akashatools/number/subtract` | `Math.sub` |
| `sum` | number | universal | no input mutation | `akashatools/number/sum` | `Math.add` |
| `summarizeNumbers` | number | universal | no input mutation | `akashatools/number/summarizeNumbers` | None |
| `toBinary` | number | universal | no input mutation | `akashatools/number/toBinary` | `Math.decToBinary` |
| `toDate` | date | universal | no input mutation | `akashatools/date/toDate` | None |
| `toUnixSeconds` | date | universal | no input mutation | `akashatools/date/toUnixSeconds` | None |
| `traverseObject` | object | universal | no input mutation | `akashatools/object/traverseObject` | None |
| `typeOf` | validation | universal | no input mutation | `akashatools/validation/typeOf` | `Val.getType` |
| `unique` | array | universal | no input mutation | `akashatools/array/unique` | `AO.uniqueArray` |
| `upsertBy` | collection | universal | no input mutation | `akashatools/collection/upsertBy` | None |
| `upsertById` | collection | universal | no input mutation | `akashatools/collection/upsertById` | None |
| `utf8ByteLength` | string | universal | no input mutation | `akashatools/string/utf8ByteLength` | None |
| `validateJsonContract` | validation | universal | no input mutation | `akashatools/validation/validateJsonContract` | None |
| `wrap` | number | universal | no input mutation | `akashatools/number/wrap` | `Math.wrap` |
| `zip` | array | universal | no input mutation | `akashatools/array/zip` | None |

## Akashatools 1.0.2 migration lookup

| Legacy name | Canonical replacement or related 2.0 API | Decision |
| --- | --- | --- |
| `AO.arrayToEnum` | None | Merge into a future safe `keyBy`/lookup builder only if consumers need it. |
| `AO.isOneOf` | None | Native `Array.prototype.includes`. |
| `AO.uniqueArray` | replacement: `array.unique` | Adopted as `array.unique`. |
| `AO.mergeArray` | None | Native spread/`concat`; merge deduplicated behavior into future `union`. |
| `AO.replaceIfInvalid` | replacement: `validation.defaultIfBlank` | Adopted `validation.defaultIfBlank`; all whitespace-only strings now select the fallback. |
| `AO.removeEmpty` | related: `array.compact` | Merge as an explicit predicate/filter recipe; `compact` remains nullish-only. |
| `AO.parseTextToArray` | None | Merge into a future `splitMany` with escaped alternation or deterministic scanning. |
| `AO.cleanJSON` | related: `data.initializeLike` | Reject the misleading name; related explicit replacement is `data.initializeLike(value, { arrays: "sample" })`. |
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
| `AO.has` | related: `object.hasAtPath`, related: `object.hasDeep`, related: `object.deepQuery` | Use `hasAtPath` for known paths or `hasDeep`/`deepQuery(value).has` for bounded recursive key/value discovery. |
| `AO.hasAll` | related: `object.hasDeep` | Reject implementation; compose the intended every-key policy explicitly with bounded `hasDeep` calls. |
| `AO.valContains` | replacement: `string.includesText` | Adopted for actual strings as `string.includesText`; non-string search requires a separate explicit serializer/search API. |
| `AO.objContains` | replacement: `object.hasDeep`, replacement: `object.findDeep`, replacement: `object.findAllDeep` | Adopted exact-match replacement `hasDeep`; predicate search uses `findDeep`/`findAllDeep`. |
| `AO.arrayContains` | replacement: `object.hasDeep` | Adopted deep replacement `hasDeep`; primitive membership still uses native `includes`. |
| `AO.deepGetKey` | replacement: `object.findDeepValue`, replacement: `object.findAllDeepValues` | Adopted explicit projections `findDeepValue`/`findAllDeepValues` with `{ by: "key" }`. |
| `AO.deepSearch` | related: `object.findDeepMatch`, related: `object.findDeepValue`, related: `object.findDeepParent`, related: `object.findDeep` | Split into `findDeepMatch`, `findDeepValue`, and `findDeepParent`; predicate matching retains `findDeep`. |
| `AO.deepSearchItems` | related: `object.findAllDeepMatches` | Reject implementation; adopted all-match replacement `findAllDeepMatches`. |
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
| `Val.cleanInvalid` | replacement: `validation.defaultIfBlank` | Adopted `validation.defaultIfBlank`; all whitespace-only strings now select the fallback. |
| `Val.isDefined` | replacement: `validation.isDefined` | Adopted as `validation.isDefined`. |
| `Val.isTruthy` | related: `validation.isBlank` | Reject misleading name; use native Boolean, a literal check, or `!validation.isBlank` when whitespace is absent. |
| `Val.isString` | replacement: `validation.isString` | Adopted primitive-only `validation.isString`; boxed String objects no longer pass. |
| `Val.isNumber` | replacement: `validation.isNumber`, replacement: `validation.isFiniteNumber` | Adopted primitive `validation.isNumber`; use `validation.isFiniteNumber` when arithmetic requires a finite value. |
| `Val.isNum` | related: `validation.isNumber` | Reject duplicate legacy spelling; migrate to `validation.isNumber`. |
| `Val.isInt` | None | Native `Number.isInteger`; possible canonical type guard. |
| `Val.isSafeInt` | replacement: `validation.isSafeInteger` | Adopted as explicit `validation.isSafeInteger`; native `Number.isSafeInteger` remains equally valid inline. |
| `Val.isFloat` | replacement: `validation.isFiniteNonInteger` | Adopted explicit `validation.isFiniteNonInteger`; non-finite values no longer pass. |
| `Val.isBool` | replacement: `validation.isBoolean` | Adopted clearly named primitive `validation.isBoolean`. |
| `Val.isBlank` | replacement: `validation.isBlank` | Adopted replacement `validation.isBlank` with literal nullish/whitespace semantics. |
| `Val.escapeHtml` | replacement: `string.escapeHtml` | Adopted under `string.escapeHtml`, documented as escaping rather than sanitization. |
| `Val.isJSONRegex` | None | Reject. |
| `Val.isJSON` | replacement: `validation.isJson` | Adopted replacement `validation.isJson`, accepting all valid JSON text. |
| `Val.isMap` | replacement: `validation.isMap` | Adopted as `validation.isMap` with a cross-realm brand check. |
| `Val.isSet` | replacement: `validation.isSet` | Adopted as `validation.isSet` with a cross-realm brand check. |
| `Val.isFile` | replacement: `validation.isFile` | Adopted as `validation.isFile` using safe `globalThis.File` detection. |
| `Val.isBlob` | replacement: `validation.isBlob` | Adopted as `validation.isBlob` using safe `globalThis.Blob` detection. |
| `Val.isObject` | replacement: `validation.isNonArrayObject`, replacement: `object.isPlainObject` | Adopted exact-shape `validation.isNonArrayObject`; use `object.isPlainObject` when prototypes matter. |
| `Val.isArray` | replacement: `validation.isArray` | Adopted discoverable `validation.isArray`; native `Array.isArray` remains equally valid inline. |
| `Val.isValidArray` | replacement: `array.isNonEmptyArray`, replacement: `validation.isArray` | Adopted clear predicate `array.isNonEmptyArray`; use `Array.isArray` when emptiness is allowed. |
| `Val.arrayContainsObjects` | None | Merge into explicit `some(isPlainObject)` or `every(isPlainObject)` recipes. |
| `Val.isObjectArray` | related: `validation.isPlainObjectArray` | Reject ambiguous semantics; adopted `validation.isPlainObjectArray`, which requires every item to be a plain object and explicitly accepts an empty array. |
| `Val.isAO` | related: `validation.isArray`, related: `validation.isNonArrayObject` | Reject abbreviation; compose `validation.isArray` and `validation.isNonArrayObject` explicitly. |
| `Val.getType` | related: `validation.typeOf`, related: `data.normalizeDataType`, related: `data.analyzeArrayTypes` | Split into atomic `validation.typeOf`, `data.normalizeDataType`, and full-slot `data.analyzeArrayTypes`. |
| `Val.getFieldType` | related: `input.inputTypeForValue`, related: `input.controlTypeForValue` | Split into `input.inputTypeForValue` and full-array `input.controlTypeForValue`; component/layout/schema policy stays app-local. |
| `Val.getArrayType` | replacement: `data.analyzeArrayTypes` | Adopted structured replacement `data.analyzeArrayTypes`. |
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
