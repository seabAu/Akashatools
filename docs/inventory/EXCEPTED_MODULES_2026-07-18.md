# Excepted-modules inventory — 2026-07-18

This ledger reviews every file currently stored in the repository-level
`(excepted modules)` directory. Those files are evidence of useful intent, not
drop-in package sources. They mix framework policy, browser globals, application
storage layouts, incomplete experiments, and several demonstrably broken
contracts. Akashatools preserves the reusable behavior by redesigning it around
small, explicit, tested atoms.

The source snapshot reviewed here is fixed by SHA-256:

| File | SHA-256 |
| --- | --- |
| `DOM.js` | `37e6e3b5a0243cf00813073c22e3dc459fcf1f2e571545d749839e88c0704b0d` |
| `Geo.js` | `b91b8dd177c42e1bfbf39c19a4a9d8cb0036d46492117deadaceff2f2e3d6716` |
| `LocalDB.js` | `599e277c7b9583a7ead8f0810f8a5d64fad614ca84d9f63d9f4b528df277dd3f` |
| `ObjMap.js` | `440571cb332af84a1ae193d2bdde0c1f209e7226112f5d6ad4b968b5c771a1e9` |
| `Props.js` | `504e26aa99bf1ec53feb45b7dc06f51b9fd0662e80106a849828e12f9fab9227` |
| `Schema.js` | `7c62d5aa19ee75eda59065a7fe4e5e82be8bf26a0940f78ef662c6ac5d381915` |

## Disposition vocabulary

- **Adopt, redesigned** — the intent is portable, but the implementation and
  public contract must be replaced.
- **Covered** — the portable atom already exists in the canonical 2.0 API.
- **Application-owned** — behavior depends on React, a product schema, storage
  layout, presentation, or another consumer policy.
- **Native composition** — the wrapper adds no stable contract beyond a native
  operation or an existing Akashatools function.
- **Reject broken/unsafe** — retaining the observed behavior would preserve a
  defect, ambient side effect, misleading result, or injection hazard.

## `Geo.js`

GeoJSON uses `[longitude, latitude]`; the legacy object/array converters use
`[latitude, longitude]` without naming that policy. The new surface will use a
canonical order and require an explicit legacy-order option when needed.
Distance predicates will use a real spherical distance in caller-selected units,
not a per-axis degree box.

| Legacy export | Disposition | Replacement intent |
| --- | --- | --- |
| `points2geojsonFeatures` | Adopt, redesigned | Deterministic position-to-feature conversion; no random coordinate jitter or HTML descriptions. |
| `data2geojsonfeature` | Adopt, redesigned | Strict GeoJSON feature creation with standard geometry names and validated coordinate nesting. |
| `data2geojsonfeatures` | Adopt, redesigned | Bounded deterministic FeatureCollection construction. |
| `isNearby` | Adopt, redesigned | Haversine distance plus a boolean distance predicate. |
| `isNearbyAny` | Adopt, redesigned | Early-exit bounded search that honors its supplied maximum distance. |
| `isGeoObj` | Adopt, redesigned | Canonical position normalization/validation with finite range checks. |
| `geoObj2geoArray` | Adopt, redesigned | Object aliases (`longitude`/`lng`/`lon`, `latitude`/`lat`) to canonical array. |
| `isGeoArray` | Reject broken; redesign | The implementation compares array identity with a newly filtered array and cannot validate positions. |
| `geoArray2geoObj` | Reject broken; redesign | Replace inverted branches and whole-array recursion with one canonical object conversion. |
| `geoObjArray2geoArrayArray` | Covered by redesigned normalization | Map the atomic canonicalizer with explicit work bounds. |
| `isPointObj` | Covered by redesigned normalization | One position contract covers both legacy point and geo object spellings. |
| `pointObj2pointArray` | Covered by redesigned normalization | Preserve no second ambiguous coordinate order. |
| `isPointArray` | Covered by redesigned normalization | Validate numeric position length and legal coordinate ranges. |
| `pointArray2PointObj` | Covered by redesigned normalization | Canonical output names are `longitude` and `latitude`; aliases are an explicit option. |
| `filterNearby` | Adopt, redesigned | Bounded nearby filtering/search composed from normalization and distance atoms. |

Adopted public atoms: `normalizeGeoPosition`, `isGeoPosition`,
`geoPositionToObject`, `haversineDistance`, `isWithinGeoDistance`,
`hasPositionWithinDistance`, `filterPositionsWithinDistance`,
`createGeoJsonFeature`, and `createGeoJsonFeatureCollection`.

## `Schema.js`

This file combines type inspection, form-input inference, event extraction,
random values, UUIDs, and application schema compilation. The canonical data,
input, random, and hash surfaces already separate most of those responsibilities.
The remaining reusable gap is strict conversion from a form control's serialized
value to a declared JavaScript datatype.

| Legacy export | Disposition | Replacement intent |
| --- | --- | --- |
| `getType` | Covered | `typeOf` and `normalizeDataType` distinguish runtime brand from declared descriptor. |
| `getFieldType` | Covered | `inputTypeForValue` and `controlTypeForValue`. |
| `getArrayType` | Reject broken; covered | It references an undeclared `test`; use `analyzeArrayTypes`. |
| `formatInputValue` | Adopt, redesigned | Separate control extraction from strict datatype parsing; preserve decimals and empty values, and make date/time policy explicit. |
| `initializeModel` | Covered | `initializeLike`. |
| `typeToInitialDefault` | Covered | `defaultValueForType`. |
| `dataType2fieldType` | Covered | `inputTypeForType` and `controlTypeForType`. |
| `generateRandom` | Covered | Canonical random utilities expose explicit alphabets and bounds. |
| `createBasicUUID` | Reject broken; covered | It references undeclared Node `crypto`; use secure UUID/hash functions. |
| `schemaToFormModel` | Application-owned | Schema shape, random initialization, and form-layout metadata are product policy. |
| `schemaToModel` | Application-owned | Model compilation and initialization policy remain with the owning application. |

Adopted public atoms are a reusable `createInputValueParser` factory and a
one-shot `parseInputValue` wrapper. The factory precomputes descriptor and option
policy for high-volume form handlers. A browser-only `inputValueFromControl`
adapter extracts checkboxes, files, multiple selections, and ordinary values
before delegating to the pure parser. Unsupported or inherently lossy datatypes
fail explicitly instead of being guessed.

## `DOM.js`

| Legacy export | Disposition | Replacement intent |
| --- | --- | --- |
| `isDarkMode` | Adopt, redesigned | Query color-scheme preference on demand; never read `window` during import. |
| `nameOf` | Reject misleading | Parsing `Function#toString` is not a stable function-name contract; use the native `name` property when appropriate. |
| `hasClass` | Native composition | Use `element.classList.contains`; do not couple the helper to an event shape. |
| `setElementValueById` | Application-owned | Hard-coded `latitude` extraction and direct DOM mutation do not define a generic setter. |
| `obj2ListText` | Application-owned | Presentation labels and React output belong to a renderer. |
| `objArray2List` | Application-owned | React list keys, wrappers, and formatting are UI policy. |
| `value2List` | Application-owned | React element construction is outside the universal library. |
| `array2List` | Reject broken/application-owned | Its recursive call targets the wrong function and still embeds JSX policy. |
| `obj2List` | Application-owned | React list structure and labels are consumer choices. |
| `objArrayToList` | Application-owned | Duplicate JSX renderer with no portable data atom. |
| `arrayToList` | Application-owned | JSX renderer; nested-data traversal already exists separately. |
| `objToList` | Application-owned | JSX renderer with presentation-specific recursion. |
| `valueToList` | Application-owned | JSX wrapper. |
| `valToList` | Application-owned | Alias of presentation behavior. |
| `list` | Reject unsafe | String-built HTML interpolates unescaped data and element names. |
| `ObjMap` | Application-owned | React component, logging, and wrapper-element policy. |

Adopted browser atoms are `matchesMediaQuery` and `prefersColorScheme`. Both are
late-bound, side-effect-free until called, and accept an injectable browser
environment for deterministic tests.

## `LocalDB.js`

| Legacy export | Disposition | Replacement intent |
| --- | --- | --- |
| `GetDB` | Adopt atomically | Strict JSON read from an explicit Storage implementation. |
| `SetDB` | Reject broken; adopt atomically | Replace the undefined `db` write and reversed arguments with strict JSON storage. |
| `IsDBSet` | Native composition | `storage.getItem(key) !== null` when a consumer actually needs existence. |
| `InitializeLocalDB` | Application-owned | Database names, default models, and console behavior are product bootstrap policy. |
| `deepSearchDB` | Covered/reject unsafe | Canonical bounded deep query and immutable path updates replace unbounded mutation. |
| `setDBKey` | Application-owned | Assumes one database name and an object layout. |
| `AddLocalDBEntry` | Application-owned | Assumes `db.local` and application-specific array semantics. |
| `getLocalDBSize` | Reject misleading | Browser quota accounting is implementation-specific; UTF-8 JSON bytes are not a storage quota measurement. |
| `getByteLength` | Covered | `utf8ByteLength` has a tested byte contract. |

Adopted browser atoms are `readJsonStorage` and `writeJsonStorage`. Storage is an
explicit argument, JSON parsing/serialization errors remain visible, text work
is bounded, and browser quota/security exceptions are never swallowed.

## `Props.js`

| Legacy export | Disposition | Reason |
| --- | --- | --- |
| `validateChild` | Application-owned/reject broken | React element validation and required-prop policy belong to components; callback returns do not propagate. |
| `validateChildren` | Application-owned/reject broken | The loop returns `true` regardless of invalid children. |
| `childHasProps` | Application-owned/reject broken | It shadows `props`, checks object values as property names, and returns from the callback only. |

No public Akashatools function is added from this file. Own-key and path checks
are already available without absorbing React's element model.

## `ObjMap.js`

The file has an active React import, but its remaining 1,600-plus lines are
inside block comments and it exposes no active export. It is retained only as
design archaeology. The commented experiments mix DOM mutation, JSX, browser
globals, and incomplete application components; there is no callable contract
to migrate.

## Verification policy

- Pure parsing and geospatial performance is measured with deterministic Node
  benchmarks after asserting identical output for every compared implementation.
- Time thresholds are not unit-test pass/fail conditions; tests establish
  semantics and bounds, while benchmarks report throughput and relative cost.
- Browser adapters receive Playwright behavior coverage in Chromium, Firefox,
  and WebKit. Jest is not added solely as a benchmark runner.
- The source files above remain untouched. Only redesigned canonical package
  code, tests, documentation, and generated entry points enter Akashatools.

The completed redesign and adversarial refinement pass 219 Node contracts on
Node 22.18.0 and 24.18.0,
plus 18 Playwright checks across Chromium, Firefox, and WebKit. Equal-output
benchmarks and their reproducible commands are recorded in
[`../BENCHMARKS.md`](../BENCHMARKS.md).
