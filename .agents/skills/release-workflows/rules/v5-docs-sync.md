# V5 Docs Sync

Preserve the cross-branch v5 reference docs sync model.

## Why

`update-v5-docs.yml` generates docs on `v5.x.x`, checks out `main` into
`main-branch`, copies the reference package directories, merges the SDK
Reference nav into `main`'s `docs/docs.yml`, opens or updates a PR, then
replaces the unsigned commit through the GitHub API so PR synchronize CI fires.

## Good

- Keep `v5.x.x` as the source checkout and `main` as the docs PR base.
- Keep `scripts/merge-v5-docs-to-main.ts` as the nav merge source.
- Preserve the signed commit workaround unless replacing it with an equivalent
  mechanism that still triggers CI.

## Bad

Pushing generated docs directly to `main` from the workflow.

## Exceptions

Manual workflow dispatch can pass an optional `version` label for PR text; it
does not change the source branch semantics.
