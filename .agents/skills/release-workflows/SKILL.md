---
name: release-workflows
description: |
  Use when changing GitHub workflows, Lerna versioning, package publish,
  v5 beta release, docs sync, or docs-site/indexer integration.
last_verified: 2026-05-06
---

# Release Workflows

aa-sdk has manual package publish workflows, a v5 beta publish workflow, and
post-merge docs workflows that affect external systems.

## Rules

| Rule                                        | When to read                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| [V5 beta publish](rules/v5-beta-publish.md) | Before changing `.github/workflows/publish-v5-beta.yml` or Lerna v5 config. |
| [V5 docs sync](rules/v5-docs-sync.md)       | Before changing `update-v5-docs.yml` or scripts it calls.                   |
| [Main docs hooks](rules/main-docs-hooks.md) | Before changing docs revalidation or SDK indexer workflows.                 |

## Evidence

- `publish-v5-beta.yml` always checks out `v5.x.x`.
- `update-v5-docs.yml` generates reference docs from `v5.x.x`, opens a PR to
  `main`, and replaces the commit with a GitHub API signed commit.
- `revalidate-sdk-content.yml` and `trigger-sdk-indexer.yml` run on pushes to
  `main`.
