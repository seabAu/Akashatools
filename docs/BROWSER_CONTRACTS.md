# Browser surface decisions

The 2.x browser surface currently contains download composition only:

- `downloadBlob` uses an injected or ambient document/URL API, appends and
  removes a temporary hidden anchor synchronously, and revokes the object URL on
  the next timer turn;
- click or scheduling failures revoke immediately before propagating;
- `downloadTextFile` constructs a text Blob with an explicit/default media type;
- `downloadJson` serializes strictly and normalizes exactly one `.json`
  extension. `safeFilename` remains a stem helper rather than guessing arbitrary
  extensions.

Injected unit tests cover operation order, deferred and failure cleanup, Blob
media/content, and duplicate-extension prevention. The retained browser fixture
was run in the Codex in-app browser on 2026-07-11 and observed the actual anchor
click as `browser-fixture.json`, one deferred native object-URL revocation, and no
browser warnings/errors.

Other browser candidates remain separately deferred:

- Clipboard access is already exposed by `navigator.clipboard` and requires a
  permission, user-activation, data-type, and rejection policy.
- File reading needs encoding, result type, progress, size, and abort behavior;
  it is not the same API as URL fetching.
- Storage helpers need serialization/versioning, quota, unavailable/private-mode,
  cross-tab, and migration contracts.
- DOM measurement/style/construction helpers reviewed in Mindspace are UI or
  framework adapters unless a smaller environment-injected primitive repeats.

This keeps `browser` from becoming a miscellaneous client-code namespace.
