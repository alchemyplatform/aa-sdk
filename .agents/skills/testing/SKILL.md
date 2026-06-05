---
name: testing
description: |
  Use when writing or modifying Vitest tests, `.vitest` setup, Anvil/Foundry or
  Rundler fixtures, per-package test config, or CI affected-test behavior.
last_verified: 2026-05-06
---

# Testing

aa-sdk uses Vitest workspace projects with shared `.vitest` setup. CI runs
affected package tests and a separate typecheck-only Vitest pass.

## Rules

| Rule                                            | When to read                                               |
| ----------------------------------------------- | ---------------------------------------------------------- |
| [Vitest projects](rules/vitest-workspace.md)    | Before changing tests or per-package Vitest config.        |
| [Anvil and Rundler](rules/anvil-and-rundler.md) | Before changing tests that depend on local chain fixtures. |
| [Affected tests](rules/affected-tests.md)       | Before choosing local verification for package changes.    |

## Evidence

- `vitest.config.ts` loads `.vitest` and `packages/*` through
  `test.projects`.
- `.vitest/vitest.shared.ts` sets `~test`, global setup, timeouts, and thread pool.
- `scripts/run-affected-tests.sh` uses Turborepo dry-run output to select
  Vitest projects.
