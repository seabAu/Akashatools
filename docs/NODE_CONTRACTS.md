# Node filesystem and path decisions

The selected Node-only 2.x surface is containment and bounded path discovery,
exposed only through `akashatools/node`:

- `resolveContainedPath` performs a lexical plan for a nonempty relative path;
- `resolveExistingContainedPath` additionally resolves existing symlinks and
  verifies the real target remains under the real root;
- `globPaths` collects native Node glob matches with explicit cwd/exclusions,
  deduplication, deterministic code-unit ordering, and a maximum-result bound;
- none of these functions performs I/O mutation or claims that a later operation is
  race-free. Callers must still account for path replacement between checking
  and use.

Basic file reading/writing remains native `node:fs/promises`. A future wrapper
must add more than argument forwarding and define:

- text versus bytes and explicit/default encoding;
- `AbortSignal` behavior before and during an operation;
- existing/nonexisting target containment, real parent checks, and symlink
  handling;
- whether directory creation is allowed;
- partial-write cleanup and original `cause` propagation.

No current helper claims atomic replacement. Such a promise would require a
unique temporary file in the same verified directory, exclusive creation,
write/close (and optional file/directory sync), rename semantics per supported
OS, mode/ownership policy, and cleanup that never hides the primary failure.

`globPaths` delegates pattern grammar, file/directory matching, symlink behavior,
hidden entries, case sensitivity, and permission errors to stable native
`fsPromises.glob` in Node 22.17+. It deliberately returns paths rather than
claiming files, adds no dependency, does not imply containment, and does not
silently swallow iterator errors. Deeper traversal/abort policy remains native.

The rejected legacy save/delete/glob helpers swallow failures, use unrestricted
paths, rely on undeclared dependencies, or report false success. Akashatools
exposes no destructive filesystem helper until those failure and containment
contracts are met.
