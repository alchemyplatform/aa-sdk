---
description: Checklist for syncing v5 SDK reference docs into main
argument-hint: [version-label]
---

# Sync V5 Docs

Use when preparing or reviewing `.github/workflows/update-v5-docs.yml`.
Dispatching this workflow creates or updates a docs PR against `main`; get
explicit user approval before triggering it.

## Steps

1. Verify the workflow checks out `v5.x.x` for generation.
2. Verify `pnpm docs:sdk` and `pnpm lint:write` are still run before copying
   reference docs.
3. Confirm copied packages match `PACKAGES_INCLUDED_IN_NAV` in
   `scripts/generate-typedoc-yaml.ts`.
4. Verify `scripts/merge-v5-docs-to-main.ts` still merges v5 reference nav into
   the `main` checkout's `docs/docs.yml`.
5. Preserve the GitHub API signed-commit replacement unless an equivalent
   mechanism still triggers PR synchronize CI.

## Local Preview

```bash
pnpm run docs:sdk
pnpm run lint:write
git diff -- docs/pages/reference/ docs/docs.yml
```
