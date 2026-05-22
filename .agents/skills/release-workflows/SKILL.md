---
name: release-workflows
description: |
  Use when changing GitHub workflows, Lerna versioning, package publish, or
  post-merge docs hooks (revalidate + SDK indexer).
last_verified: 2026-05-21
---

# Release Workflows

aa-sdk has a single manual package publish workflow on `main` and two
post-merge docs hooks that affect external systems. The legacy v5 beta and v5
docs sync workflows were retired when v5 graduated to `main`.

## Rules

| Rule                                        | When to read                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| [Package publish](rules/package-publish.md) | Before changing `.github/workflows/publish-package.yml` or Lerna config. |
| [Main docs hooks](rules/main-docs-hooks.md) | Before changing docs revalidation or SDK indexer workflows.              |

## Evidence

- `publish-package.yml` is dispatched manually with a `publish` boolean. It
  runs `pnpm lerna publish --conventional-commits --no-private --yes
--no-verify-access` and pushes the version commit + tags back to `main`.
- `revalidate-sdk-content.yml` posts changed `docs/pages/**/*.md` and
  `docs/pages/**/*.mdx` paths to the docs site revalidation API on `main`.
- `trigger-sdk-indexer.yml` dispatches `index-sdk-references` to
  `alchemyplatform/docs` when `docs/docs.yml` changes on `main`.
- `lerna.json` sets `distTag: latest` and does not pin `allowBranch`, so Lerna
  publishes from `main` (and `master`) by default. The `v4.x.x` branch sets
  `allowBranch: "v4.x.x"` locally so legacy backports can publish.
