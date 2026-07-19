# Security boundaries and threat models

Akashatools reduces common utility-layer hazards but is not an authorization,
sanitization, sandboxing, or network-security framework. This document states
the boundaries callers must preserve.

## Nested paths and object merging

`parsePath`, `getAtPath`, `hasAtPath`, and `setAtPath` reject every occurrence of
`__proto__`, `prototype`, and `constructor`, including array-form paths. Reads use
own properties, so inherited attacker-controlled values are never traversed.
Paths are bounded to 10,000 code units and 100 segments before recursive writes.

`parseJsonPointer`, `getAtJsonPointer`, and `hasAtJsonPointer` provide a separate
RFC 6901 spelling for JSON interchange. They retain the same unsafe-token and
own-property boundary, additionally enter only arrays/plain objects and reject
accessors without invoking them. Array tokens must be canonical unsigned decimal
indices; empty-root and escaped-token semantics remain standard. These readers
do not support URI-fragment `#` pointers or authorize writes.

`deepMerge` accepts only plain objects, copies own enumerable string-keyed data
properties, and rejects dangerous names, enumerable symbols, and enumerable
accessors without invoking getters. Arrays and non-plain instances are replaced
as leaf references. It preserves the base object's ordinary or null prototype,
limits merge work to 10,000 object pairs and 100 nested merge levels, and rejects
mutually circular merge branches. Tests use JSON-created `__proto__` properties,
array/string paths, accessors, symbols, null prototypes, cycles, and deep input.

These functions do not validate business field allowlists. Use `pickAllowed` or
an application contract before persistence. `deepMerge` also does not clone leaf
objects; use `deepClone` separately when reference isolation is required.

## Filesystem containment

`normalizePortableRelativePath` and `normalizePortableRelativePaths` provide a
universal lexical boundary for archive/manifest names before any Node path is
resolved. They reject absolute/traversal/platform-reserved syntax, apply an
explicit Unicode normalization policy, bound path work, and detect normalized,
case, duplicate, and file/directory-prefix collisions. They inspect no
filesystem state and do not authorize extraction or writing. The complete
boundary is in [`PORTABLE_PATH_CONTRACTS.md`](./PORTABLE_PATH_CONTRACTS.md).

`resolveContainedPath` is lexical planning, not filesystem authorization. It
rejects absolute/rooted/UNC/drive-relative paths, null bytes, and `..` escapes
with platform-aware separator, drive, UNC, and case tests.

`resolveExistingContainedPath` additionally resolves both existing root and
target with `realpath`, then rejects a symlink/junction target outside the real
root. The returned path is a point-in-time observation. A target or ancestor can
be replaced after checking, so security-sensitive mutation still needs an
operation-time strategy such as verified directory handles or equivalent
platform controls. Akashatools intentionally exposes no generic destructive file
helper that pretends the earlier string check eliminates this TOCTOU race.

## Regular expressions and input size

The complete public-pattern review is maintained in
[`REGEX_REVIEW.md`](./REGEX_REVIEW.md). Package-owned expressions are linear,
anchored or simple scans without backreferences or nested ambiguous quantifiers.
Email, NANP, HTTP method, path, allocation, and traversal inputs have explicit
bounds where they cross an untrusted-data boundary. `replaceRegex` accepts only a
caller-created `RegExp`; caller pattern safety remains the caller's responsibility.

## Randomness

`randomFloat`, `randomInt`, `randomBoolean`, `randomString`, `randomDate`, and
array shuffling are explicitly pseudo-random. Injected sources must return a
finite value in `[0, 1)` but are not upgraded into secure entropy. Their names and
JSDoc never claim suitability for tokens, passwords, or identifiers.

Security-sensitive callers use `secureRandomUuid` or `secureRandomString`, which
require Web Crypto. Secure strings use rejection sampling rather than biased
modulo reduction, require 2–256 unique Unicode code points, and cap output length
at 1,000,000. These primitives provide entropy, not password composition,
storage, rotation, or authentication policy.

## HTML and text

`escapeHtml` encodes five HTML-significant characters for insertion into an HTML
text node. It is not an HTML sanitizer and does not make untrusted input safe in
attributes, URLs, CSS, JavaScript, SVG, templates, or already-constructed markup.
Prefer framework text rendering/DOM `textContent`; use a maintained context-aware
sanitizer when intentionally accepting markup. Akashatools rejects legacy HTML-
string builders that interpolate unescaped values.

The HTTP threat model is maintained separately in
[`HTTP_CONTRACTS.md`](./HTTP_CONTRACTS.md).

## Supply chain and release identity

Runtime code has no third-party dependencies. Development dependencies are
locked exactly or by an intentional compatible range in `package-lock.json`, and
the release audit checks reported vulnerabilities and the complete packed file
list.

The ordinary CI workflow grants only `contents: read`, has bounded job runtimes,
and pins GitHub-owned actions to exact reviewed 40-character commit identities
rather than mutable major-version tags. A contract test snapshots each approved
action/SHA pair, rejects a different SHA even when it is syntactically immutable,
and rejects loss of the supported Node, coverage, package, or browser gates. The
format gate parses the workflow YAML. Human-readable version comments remain
update hints; changing a commit identity requires deliberate source and test
review.

The future npm publication workflow is deliberately absent until explicitly
authorized. Its required OIDC permission, trusted-publisher scope, provenance,
candidate identity checks, registry verification, and recovery procedure are
specified in [`RELEASE_RUNBOOK.md`](./RELEASE_RUNBOOK.md). No long-lived npm
credential belongs in source control or ordinary CI.
