---
title: Stale Contributing Docs
date: 2026-05-06
tags:
  - docs
  - gotcha
area: documentation
---

# Stale Contributing Docs

## Problem

Some contributor guidance on `v5.x.x` does not match the tracked repo.

## Root Cause

`CONTRIBUTING.md` references `docs/CONTRIBUTING.md`, `pnpm run docs:dev`,
`site/packages/*`, and PRs against `development`. On `v5.x.x`, `docs/CONTRIBUTING.md`
is not tracked, the root `package.json` does not define `docs:dev`, and the v5
scaffold uses `v5.x.x` as its PR base.

## Solution

When writing agent guidance, verify commands and paths against tracked source,
scripts, and workflow YAML instead of copying stale contributor prose. Keep
existing docs-reviewer instructions accurate by pointing at tracked guidance and
using `v5.x.x...HEAD` when checking changed MDX on this branch.
