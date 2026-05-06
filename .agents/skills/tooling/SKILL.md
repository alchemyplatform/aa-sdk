---
name: tooling
description: |
  Use when changing package management, workspace config, build scripts,
  generated outputs, Turborepo/Lerna config, or local validation in aa-sdk.
last_verified: 2026-05-06
---

# Tooling

aa-sdk is a pnpm workspace on `v5.x.x` with Turborepo for build/test graphs and
Lerna for package versioning/publish.

## Rules

| Rule                                                            | When to read                                                                |
| --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [Package manager and build](rules/package-manager-and-build.md) | Before changing scripts, dependencies, workspace config, or build commands. |
| [Tracked tree only](rules/tracked-tree-only.md)                 | Before auditing or generating guidance from repository contents.            |
| [Generated output policy](rules/generated-output-policy.md)     | Before editing generated outputs or files produced by build/doc scripts.    |

## Evidence

- `package.json` declares `packageManager: pnpm@9.15.4` and root scripts.
- `pnpm-workspace.yaml` lists `templates/*`, `.vitest`, `halp`, and `packages/*`.
- `turbo.json` defines build and test task graph behavior.
- `lerna.json` lists the four published packages and v5 beta version.
