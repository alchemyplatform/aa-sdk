# Package Publish

Keep the package publish workflow anchored to `main` and gated behind explicit
user approval.

## Why

`.github/workflows/publish-package.yml` is dispatched manually with a
`publish` boolean input. When `publish: false` it prints the current version,
changed packages (`lerna changed --long`), and the dry-run next version. When
`publish: true` it runs `pnpm lerna publish --conventional-commits
--no-private --yes --no-verify-access`, which bumps versions, builds, commits,
tags, publishes to npm, and pushes the version commit + tag back to `main`.

The workflow uses the `PR_BYPASSER` GitHub App token so the publish commit can
push past branch protection. The same app is configured to bypass protection
on `v4.x.x` so legacy v4 backports can publish from that branch.

## Good

- Preserve the dry-run path (`!inputs.publish`) so reviewers can preview the
  next version before any side effects.
- Keep version injection for packages with `inject-version.ts`.
- Treat workflow dispatch with `publish: true` as a release action that needs
  explicit user approval.
- When backporting to `v4.x.x`, dispatch the workflow from that branch — the
  `allowBranch: "v4.x.x"` entry in `v4.x.x`'s `lerna.json` permits it.

## Bad

- Hardcoding a `ref:` on the checkout step that pins it away from the
  dispatched branch (the workflow should publish from whichever branch it was
  dispatched against — `main` for v5, `v4.x.x` for legacy backports).
- Adding `allowBranch` to `lerna.json` on `main` — that would block stable v5
  publishes from `main`.
- Removing `--no-verify-access` without confirming the npm token still has
  publish access to every package in `lerna.json`.

## Exceptions

The legacy v5 beta publish workflow (`publish-v5-beta.yml`) and the v5 docs
sync workflow (`update-v5-docs.yml`) no longer exist. If you find references
to them in agent prose, update the prose — do not resurrect the workflows.
