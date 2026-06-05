---
title: Stale Contributing Docs
date: 2026-05-21
tags:
  - docs
  - gotcha
area: documentation
---

# Stale Contributing Docs

## Problem

Some contributor guidance does not match the tracked v5 repo on `main`.

## Root Cause

`CONTRIBUTING.md` references `docs/CONTRIBUTING.md`, `pnpm run docs:dev`, and
`site/packages/*`. On the current `main` (v5 SDK), `docs/CONTRIBUTING.md` is
not tracked, the root `package.json` does not define `docs:dev`, and the
docs site lives in `alchemyplatform/docs` rather than a `site/` tree here. A
`development` branch exists on the remote but has been inactive since January
2024 and is not used for v5 work.

## Solution

When writing agent guidance, verify commands and paths against tracked source,
scripts, and workflow YAML on `main` instead of copying stale contributor
prose. Keep existing docs-reviewer instructions accurate by pointing at
tracked guidance and using `origin/main...HEAD` when checking changed MDX on a
feature branch. Use `origin/v4.x.x...HEAD` only when reviewing a v4 backport.
