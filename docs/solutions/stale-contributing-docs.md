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

`CONTRIBUTING.md` references `docs/CONTRIBUTING.md`, `pnpm run docs:dev`, and
`site/packages/*`. On `v5.x.x`, `docs/CONTRIBUTING.md` is not tracked, the root
`package.json` does not define `docs:dev`, and the v5 scaffold uses `v5.x.x` as
its PR base. A `development` branch exists on the remote but has been inactive
since January 2024 and is not used for v5 work.

## Solution

When writing agent guidance, verify commands and paths against tracked source,
scripts, and workflow YAML instead of copying stale contributor prose. Keep
existing docs-reviewer instructions accurate by pointing at tracked guidance and
using `origin/v5.x.x...HEAD` when checking changed MDX on this branch.
