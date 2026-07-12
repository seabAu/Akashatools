# Node filesystem and path decisions

The selected Node-only 2.x surface is containment, exposed only through
`akashatools/node`:

- `resolveContainedPath` performs a lexical plan for a nonempty relative path;
- `resolveExistingContainedPath` additionally resolves existing symlinks and
  verifies the real target remains under the real root;
- neither function performs I/O mutation or claims that a later operation is
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

File discovery/globbing is deferred. A future API must specify pattern grammar,
base containment, files versus directories, symlink traversal, hidden entries,
case sensitivity, stable ordering, maximum results/depth, abort behavior,
permission errors, and whether a maintained glob dependency is justified.

The rejected legacy save/delete/glob helpers swallow failures, use unrestricted
paths, rely on undeclared dependencies, or report false success. Akashatools
exposes no destructive filesystem helper until those failure and containment
contracts are met.
