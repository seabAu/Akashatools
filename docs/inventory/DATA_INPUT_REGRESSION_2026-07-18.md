# Data, input, and deep-query regression review — 2026-07-18

## Scope and result

This review reopens the earlier broad disposition that treated Mindspace's
data/form utilities as one application-owned schema layer. Active definitions
and call sites were re-read across Mindspace's client data, input, object,
schema, validation, input-contract, alias, array, enhanced-array, and random
utilities, together with form-generator and nested-data-editor consumers. The
portfolio copy was compared for the same inherited behaviors.

The source does contain app-owned Mongoose, React, custom-ID, field-layout, and
fixture policy. It also contains a generic dependency-free layer that was
previously obscured by duplication. That generic layer is now split into atomic
operations instead of being copied as one form-model converter.

## Function-family findings

| Question | Source variants/finding | Canonical disposition |
| --- | --- | --- |
| What runtime value is this? | `getType`/`getValueType` use custom capitalization and sometimes infer an array from item zero. | Keep `validation.typeOf` as the atomic intrinsic brander. |
| What does this type descriptor mean? | Constructors, Mongoose-like labels, `DateTimeLocal`, bracket arrays, ObjectId, and Decimal names are interpreted repeatedly. | Add `data.normalizeDataType`; custom schema interpretation remains an adapter. |
| What types does this array contain? | One variant reads only the first item; another scans all items; a copied implementation references undeclared `test`. | Add full-slot `data.analyzeArrayTypes` with unique types, counts, homogeneity, and sparse-slot semantics. |
| What is the initialized default for a type? | `getDefaultValueForType`, `typeToInitialDefault`, and local copies overlap. Several use `value || fallback` or truthy conditionals, losing explicit `false`, `0`, and `""`. Date outputs vary between now, Date objects, and formatted strings. | Add `data.defaultValueForType` with fresh values, epoch/now policy, caller factories, and literal falsy behavior. |
| What is the initialized default for this value? | Several callers first detect a type and then call another mapper. | Add the thin compositional wrapper `data.defaultValueFor`. |
| What initialized shape mirrors this data? | Legacy `cleanJSON` recursively resets leaves and keeps only the first array item; `initializeModel` delegates to it despite the cleaning name. | Add bounded `data.initializeLike` with explicit empty/items/sample arrays and empty/shape objects. Reject the old name and implicit policy. |
| Which HTML input accepts this scalar? | `getFieldType` and `dataType2fieldType` mix type inference, HTML input names, and custom composite controls. | Adopt `inputTypeForType`/`inputTypeForValue`; no React or layout dependency. |
| Is this composite data a field or nested editor? | Arrays, objects, object arrays, and mixed arrays require a control distinction beyond native HTML `type`. | Adopt separate `controlTypeForType`/`controlTypeForValue` analysis rather than overloading scalar input inference. |
| How are field descriptors built? | `dataToModel` is mostly generic; `schemaToFormModel` also reads Mongoose paths, custom classes, defaults, labels, validation, and random fixtures. | Adopt generic `fieldDescriptorFor`/`fieldsFromData` composed from atomic functions. Keep Mongoose/schema adapters app-owned. |

## Adopted data contracts

The first implementation batch adds:

- `normalizeDataType(descriptor)` for constructors, aliases, and array-shaped
  descriptors without invoking custom constructors;
- `analyzeArrayTypes(values)` for a frozen, complete type distribution in
  first-seen order, counting sparse slots as indexed `undefined` reads;
- `defaultValueForType(descriptor, options)` for fresh built-in defaults,
  explicit Date policy, caller factories, and explicit unsupported behavior;
- `defaultValueFor(value, options)` as the value-oriented wrapper; and
- `initializeLike(value, options)` for independent, bounded, cycle-aware
  initialized skeletons with named container policies.

Mutable defaults are created on every call. Recursive initialization reads only
own enumerable data properties without invoking accessors, rejects enumerable
symbols/custom array properties/prototype-mutating names, preserves null object
prototypes, recreates cycles, and enforces depth/node budgets.

## Deliberate distinctions

These APIs overlap by design but are not aliases:

- `typeOf(value)` reports an observed intrinsic runtime brand;
- `normalizeDataType(descriptor)` interprets a declared type vocabulary;
- `analyzeArrayTypes(values)` reports a distribution over an entire array;
- `defaultValueForType(descriptor)` initializes from a declaration;
- `defaultValueFor(value)` initializes from an observed value; and
- `initializeLike(value)` recursively retains or collapses container shape.

This core/wrapper relationship follows the user's direction that meaningful
semi-redundancy is preferable to forcing unrelated questions through one
shape-changing umbrella function.

## Adopted input contracts

The second implementation batch adds:

- `inputTypeForType` and `inputTypeForValue` for native scalar input types,
  including `datetime-local` for Date values without coercing string contents;
- `controlTypeForType` and `controlTypeForValue` for renderer-level composite
  distinctions, including empty/scalar/object/nested/mixed arrays; and
- `fieldDescriptorFor` and `fieldsFromData` for frozen, framework-neutral field
  metadata that literally preserves false, zero, and empty-string defaults.

The data-to-fields operation reads only direct own data properties, includes a
work bound, treats sparse array slots as indexed `undefined`, and rejects active
or prototype-mutating property semantics without executing getters. It does not
add event handlers, mutate form state, create an `enabled` field, infer labels,
or absorb renderer validation/layout policy.

## Deep-query and dot-syntax boundary

Existing `object.hasAtPath`, `traverseObject`, and `findDeep` provide safe path
lookup and first-match predicate traversal. The adopted query batch adds
`findAllDeep` plus exact-needle `hasDeep`, first-entry, value, parent, all-entry,
all-value, and all-parent variants. Match side is explicitly `value`, `key`, or
`either`; equality defaults to `Object.is` and can be replaced by a callback.
Return modes use separate names rather than positional booleans.

The frozen `deepQuery(structuredData)` view now exposes `.has`, `.first`,
`.value`, `.parent`, `.all`, `.values`, `.parents`, `.where`, and `.allWhere`
while retaining the root by reference and changing no global state.

`structuredData.has()` cannot be attached to arbitrary arrays and objects
without mutating `Object.prototype`; that is rejected for normal imports.
`Array.has()` also means modifying the global constructor. A separate fluent
wrapper can provide dot discovery without global effects. Any future built-in
augmentation entry must be explicit opt-in, non-enumerable, collision-checked,
reversible, and limited to surfaces whose global risk is justified; it will
never install through the default/root/category imports.

## Remaining application-owned policy

- Mongoose path descriptors and model construction;
- ObjectId/Decimal/custom-class semantics beyond caller-provided factories;
- React components and rendering;
- labels, ordering, grouping, validation messages, and layout metadata;
- random fixture generation and network/database interactions; and
- product-specific schemas, aliases, persistence, and migrations.

Those layers may become thin adapters around Akashatools, but consumer projects
remain read-only until the user explicitly authorizes migration edits.
