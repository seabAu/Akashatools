# Types and editor support

Akashatools remains authored as checked JavaScript. Strict JSDoc is the source of
truth for both VS Code IntelliSense and committed TypeScript declarations.

- `npm run typecheck` checks source and JavaScript editor fixtures without emit.
- `npm run types:build` recreates the `types/` tree from source JSDoc.
- `npm run entrypoints` regenerates category indexes and granular method wrappers
  from canonical public declarations.
- `npm run check:types` independently emits and byte-compares the complete
  declaration tree, including category indexes and granular method targets,
  preventing stale generated output.
- `npm run test:types` compiles JavaScript and TypeScript package consumers using
  default, named, category namespace, category subpath, granular method,
  Node-only, HTTP, and
  type-only imports, including negative contract assertions.
- `npm run test:completions` asks the TypeScript 7 language service used by
  VS Code for JavaScript and TypeScript completions after `akasha.`,
  `akasha.array.`, `akasha.validation.`, and `akasha.http.`.
- `npm run test:package` packs and installs the exact artifact into a fresh
  temporary project, then executes JavaScript and compiles TypeScript against
  only the installed package.

Every modern export-map entry exposes a `types` condition before runtime
conditions. Browser-effect and Node-only entry points additionally expose their
matching environment condition. The universal root never re-exports Node-only
filesystem functions.

The retained `akashatools/lib/*` paths are legacy JavaScript compatibility
surfaces and do not yet promise strict declarations. Their stable-2.0 retention
and removal policy remains a separate compatibility decision.
