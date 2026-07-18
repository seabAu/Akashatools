# Browser surface decisions

The 2.x browser surface contains explicit download, form-control, media-query,
and strict JSON Storage adapters:

- `downloadBlob` uses an injected or ambient document/URL API, appends and
  removes a temporary hidden anchor synchronously, and revokes the object URL on
  the next timer turn;
- click or scheduling failures revoke immediately before propagating;
- `downloadTextFile` constructs a text Blob with an explicit/default media type;
- `downloadJson` serializes strictly and normalizes exactly one `.json`
  extension. `safeFilename` remains a stem helper rather than guessing arbitrary
  extensions;
- `inputValueFromControl` extracts checkbox, radio, file, multiple-select, and
  ordinary values before an optional precompiled pure parser;
- `matchesMediaQuery` and `prefersColorScheme` query only when called and accept
  an injectable media-query environment; and
- `readJsonStorage`/`writeJsonStorage` require an explicit Storage object,
  preserve operational failures, and enforce strict bounded plain JSON.

Injected unit tests cover operation order, deferred and failure cleanup, Blob
media/content, and duplicate-extension prevention. The retained browser fixture
was run in the Codex in-app browser on 2026-07-11. It observed the actual anchor
click as `browser-fixture.json`, one deferred native object-URL revocation,
browser-native Blob/File guards, iframe-realm Map/Set/typed-array guards, and no
browser warnings/errors. Blob and File intentionally use the current realm's
platform constructors; Map, Set, Date, plain-object, and typed-array contracts
explicitly accept foreign realms.

`npm run test:browser` now repeats the guard and download lifecycle contracts in
Chromium, Firefox, and WebKit. GitHub Actions installs matching browser builds
and runs the same six-test matrix on every push and pull request.

Other browser candidates remain separately deferred:

- Clipboard access is already exposed by `navigator.clipboard` and requires a
  permission, user-activation, data-type, and rejection policy.
- File reading needs encoding, result type, progress, size, and abort behavior;
  it is not the same API as URL fetching.
- Product storage versioning, migrations, quota management, private-mode policy,
  and cross-tab synchronization remain application-owned above the strict JSON
  storage atom.
- DOM measurement/style/construction helpers reviewed in Mindspace are UI or
  framework adapters unless a smaller environment-injected primitive repeats.

This keeps `browser` from becoming a miscellaneous client-code namespace.
