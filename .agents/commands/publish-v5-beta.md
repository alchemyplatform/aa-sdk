---
description: Checklist for the v5 beta publish workflow
argument-hint: [dry-run|publish]
---

# Publish V5 Beta

Use when preparing or reviewing `.github/workflows/publish-v5-beta.yml`.
Triggering the workflow with `publish: true` publishes npm packages and pushes
to `v5.x.x`; get explicit user approval before dispatching it.

## Steps

1. Verify the workflow still checks out `ref: v5.x.x`.
2. For a safe preview, run the workflow with `publish` unchecked.
3. Check the dry-run output for current version, next prerelease version, and
   package list from `lerna ls --long`.
4. Only with explicit approval, rerun with `publish` checked.
5. After a successful publish, expect the workflow to push the version commit
   and tags to `v5.x.x`, then call `update-v5-docs.yml`.

## Local Checks Before Workflow Changes

```bash
pnpm run build:libs
pnpm run lint:check
```
