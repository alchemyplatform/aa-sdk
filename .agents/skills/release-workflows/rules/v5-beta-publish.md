# V5 Beta Publish

Keep the v5 beta publish workflow anchored to `v5.x.x`.

## Why

`.github/workflows/publish-v5-beta.yml` explicitly checks out `ref: v5.x.x`
regardless of where the workflow file lives, builds packages, dry-runs or
publishes with Lerna, pushes the version commit and tag back to `v5.x.x`, then
calls the docs sync workflow.

## Good

- Preserve the dry-run behavior when `publish` is false.
- Keep version injection for packages with `inject-version.ts`.
- Treat workflow dispatch with `publish: true` as a release action that needs
  explicit user approval.

## Bad

Changing the checkout ref to the event branch and accidentally publishing from a
feature branch.

## Exceptions

If the v5 release branch changes, update this rule, workflow comments,
`typedoc.json` `gitRevision`, and relevant commands together.
