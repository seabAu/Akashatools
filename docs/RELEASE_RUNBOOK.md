# Akashatools release runbook

This runbook defines the approval, verification, publication, and recovery steps
for Akashatools 2.x. It does not authorize a release. Pushing a branch or tag,
configuring npm trusted publishing, publishing a package, moving a dist-tag, or
editing a consumer project still requires explicit user approval.

The current release evidence and outstanding gates are tracked in
[`RELEASE_READINESS.md`](./RELEASE_READINESS.md) and the authoritative project
plan remains [`LIVING_CHECKLIST.md`](./LIVING_CHECKLIST.md).

## Release choices that must be explicit

Before any external write, record all of the following in the release approval:

- the exact version, such as `2.0.0-alpha.1`, `2.0.0-rc.1`, or `2.0.0`;
- the npm dist-tag; use `next` for a prerelease unless the user chooses another
  non-`latest` tag, and reserve `latest` for an approved stable release;
- the exact reviewed Git commit and target GitHub branch;
- whether the approval includes pushing the branch, creating/pushing the tag,
  configuring a trusted publisher, publishing, and creating a GitHub release;
- which bounded consumer migration, if any, must pass before that version;
- who will observe the release and make a recovery decision if verification
  fails.

An approval for one action is not approval for the others. A prerelease version
must never receive `latest` accidentally: npm uses `latest` when `--tag` is
omitted even if the semantic version contains a prerelease suffix.

## One-time publishing setup

Perform this only after the user authorizes release automation.

1. Push the reviewed repository and CI workflow to the intended public GitHub
   repository, then require the Node 22, Node 24, and browser jobs on the release
   branch.
2. Create a protected GitHub environment for npm publication. Limit who may
   approve deployments to it.
3. Configure the `akashatools` package on npm with a GitHub Actions trusted
   publisher scoped to the exact repository, workflow filename, and environment.
4. Add a dedicated publication workflow with only the permissions it needs:
   `contents: read` and `id-token: write`. Use npm CLI 11.5.1 or newer, the
   minimum documented for trusted publishing.
5. Make publication depend on the already-green commit checks. The workflow
   must verify that its requested version equals `package.json`, that the version
   is absent from npm, and that the checked-out commit is the approved tagged
   commit before it can run `npm publish`.
6. Do not place a long-lived npm token in the repository or workflow when trusted
   publishing is available. Keep two-factor authentication enabled on maintainer
   accounts and retain a separately secured recovery path.

Trusted publishing and provenance requirements can change. Recheck the official
npm documentation immediately before implementing the workflow:

- [Trusted publishers](https://docs.npmjs.com/trusted-publishers/)
- [Generating provenance statements](https://docs.npmjs.com/generating-provenance-statements/)
- [`npm publish`](https://docs.npmjs.com/cli/v11/commands/npm-publish/)
- [`npm dist-tag`](https://docs.npmjs.com/cli/v11/commands/npm-dist-tag/)

## Candidate preparation

These steps create the exact candidate that will be reviewed. Complete them on
a clean branch without publishing.

1. Re-read every unchecked item in `LIVING_CHECKLIST.md`. Do not reinterpret an
   authorization or hosted-evidence gate as complete merely because local tests
   pass.
2. Confirm that `git status --short` is empty and record `git rev-parse HEAD`.
3. Confirm the intended version is not already present on npm and that the
   selected dist-tag has the expected current target.
4. Update `package.json`, `package-lock.json`, the changelog, checklist, and
   readiness record together if the approved version differs from the workspace
   version. Do not let `npm version` create an unreviewed tag.
5. Install exactly from the lockfile with `npm ci` and run `npm run
   audit:release` on supported Node 22 and Node 24 runtimes.
6. Install the locked Playwright engines and run `npm run test:browser` across
   Chromium, Firefox, and WebKit.
7. Run the compatibility fixtures and any authorized bounded consumer migration
   tests. Record behavioral differences instead of weakening canonical contracts
   to make a migration green.
8. Create the tarball with `npm pack --json`, record its filename, SHA-512
   digest, file count, packed size, and unpacked size, and inspect its complete
   file list. The tarball must contain no tests, credentials, local configuration,
   coverage, or consumer source.
9. Install that exact local tarball into fresh JavaScript and TypeScript
   directories and exercise root, named, category, Node-only, and retained
   `lib/*.js` imports.
10. Commit candidate metadata and evidence, rerun the unified check, and identify
    the exact commit in the approval request. Do not rebuild or edit the candidate
    after approval; any change creates a new candidate.

## Hosted verification and publication

Every step in this section is an external write and requires approval.

1. Push the exact candidate commit and wait for hosted Node 22, Node 24, and
   browser jobs to succeed from a clean checkout.
2. Review the hosted logs for the test count, API count, coverage floors, package
   contents, bundle budgets, and browser-engine results. A green status without
   the expected gates is insufficient evidence.
3. Create and push one annotated release tag pointing to the approved commit.
   The tag name and `package.json` version must agree.
4. Invoke the protected trusted-publishing workflow with the explicitly approved
   dist-tag. The workflow must publish the already-reviewed source commit and
   must not rewrite version or generated files.
5. Capture the workflow URL, package version, registry integrity value,
   provenance result, Git tag, and commit in `RELEASE_READINESS.md`.

Never publish from a dirty working tree, use `--force`, reuse a version, or
promote a prerelease through `latest` merely to repair a failed release.

## Registry verification

Immediately after publication:

1. Query the exact version and dist-tags from the npm registry. Confirm that a
   prerelease did not move `latest` and that a stable release moved only the tag
   explicitly authorized.
2. Compare npm's integrity metadata and package file list with the reviewed
   candidate.
3. Confirm the npm package page displays provenance for the expected GitHub
   repository, workflow, commit, and tag.
4. Install `akashatools@<exact-version>` from the registry—not a local tarball or
   workspace link—into fresh JavaScript and TypeScript projects.
5. Run the README import examples and smoke-test the root namespace, named root
   exports, category subpaths, `akashatools/node`, and retained 1.x paths.
6. Verify the published README, API reference, migration guide, changelog,
   license, repository links, and declaration resolution.
7. Create the matching GitHub release and record links to the hosted CI and npm
   artifact. Only then check the post-publication items in the living checklist.

## Recovery

If verification fails, stop promotion immediately and preserve evidence.

- Do not overwrite or reuse the bad version. Fix forward with a new version.
- Remove or move an incorrect dist-tag so new installs no longer select the bad
  version; changing a tag also requires explicit approval.
- Deprecate a defective version with a concise reason and fixed-version pointer
  when consumers could otherwise select it directly.
- Prefer dist-tag correction and deprecation over unpublishing. npm's unpublish
  restrictions, caches, and existing lockfiles make deletion an unreliable
  rollback mechanism.
- If credentials or publication identity may be compromised, disable the
  publisher, revoke affected credentials, preserve workflow logs, and treat the
  event as a security incident before publishing again.
- Document the symptom, affected version/tag, containment action, replacement
  version, and verification evidence in the changelog and readiness record.

The release is complete only when registry-installed smoke tests pass and every
authorized external action is recorded. A successful `npm publish` command by
itself is not completion.
