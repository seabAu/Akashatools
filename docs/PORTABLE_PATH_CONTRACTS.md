# Portable relative-path contracts

`normalizePortableRelativePath` and `normalizePortableRelativePaths` are
universal lexical validators under `akashatools/validation`. They are intended
for archive member names, manifest paths, and other interchange formats that
need one conservative cross-platform spelling.

The single-path core:

- accepts a nonempty relative string and emits `/` separators;
- defaults to NFC and optionally selects NFKC or no Unicode normalization;
- rejects absolute, root-relative, UNC, and drive-prefixed forms;
- rejects empty, `.` and `..` segments;
- rejects control characters, bidi overrides/isolates, Windows-invalid filename
  characters, reserved device names, and segment-ending dots/spaces;
- bounds total code units, segment count, and segment code units;
- distinguishes file, directory, and either-kind policies, with canonical
  directory results ending in `/`;
- rejects backslashes by default or converts them only when explicitly enabled.

The list form returns a frozen dense array and additionally rejects exact,
Unicode-normalized, and—by default—case-insensitive collisions. It strips a
directory marker when comparing identities, so `assets` and `assets/` collide.
It also rejects a file occupying a prefix needed by a descendant, regardless of
input order; an explicit directory prefix can contain descendants. Set
validation is bounded by `maximumPaths` and preserves input order.

## Authorization boundary

These helpers inspect strings only. A valid result does not prove that an
archive entry is a regular file, that two names map distinctly on every target
filesystem, or that a destination is safe at operation time. It does not inspect
symlinks/junctions, create directories, reserve names, write bytes, or prevent a
target from changing after validation.

Archive readers must still reject links, devices, duplicate metadata,
overlapping entries, expansion bombs, and format-specific ambiguities. A writer
must join the path beneath an authorized destination and retain its own
operation-time containment strategy. For existing Node targets,
`resolveExistingContainedPath` provides a separate point-in-time realpath check,
whose TOCTOU limitation remains documented in `NODE_CONTRACTS.md`.
