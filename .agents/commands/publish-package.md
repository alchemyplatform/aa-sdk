---
description: Checklist for the package publish workflow
argument-hint: [dry-run|publish]
---

# Publish Package

Use when preparing or reviewing `.github/workflows/publish-package.yml`.
Triggering the workflow with `publish: true` publishes npm packages and pushes
the version commit + tags; get explicit user approval before dispatching it.

## Steps

1. Dispatch from `main` for a v5 release, or from `v4.x.x` for a legacy v4
   backport. Lerna's `allowBranch` config gates which branch can publish.
2. For a safe preview, run the workflow with `publish` unchecked.
3. Check the dry-run output for the current version (`lerna.json`), changed
   packages from `lerna changed --long`, and the computed next version from
   `lerna version --dry-run`.
4. Only with explicit approval, rerun with `publish` checked.
5. After a successful publish, expect Lerna to push the version commit and
   tags back to the dispatched branch via the `PR_BYPASSER` app token.
6. Post-merge, `revalidate-sdk-content.yml` and `trigger-sdk-indexer.yml` may
   fire automatically if the push touched `docs/pages/**` or `docs/docs.yml`.

## Local Checks Before Workflow Changes

```bash
pnpm run build:libs
pnpm run lint:check
```
