---
title: TypeDoc Reference Drift
date: 2026-05-06
tags:
  - docs
  - typedoc
  - generated
area: documentation
---

# TypeDoc Reference Drift

## Problem

PR CI can fail even when source code is correct because committed SDK reference
MDX is stale.

## Root Cause

The PR workflow runs `pnpm run docs:sdk`, then `pnpm run lint:write`, then checks
`git diff --exit-code docs/pages/reference/`. `typedoc.json` writes generated
MDX to `docs/pages/reference`, and `scripts/generate-typedoc-yaml.ts` updates
the SDK Reference nav in `docs/docs.yml`. The current drift gate checks the
reference MDX directory, not `docs/docs.yml`.

## Solution

When public API, TSDoc, TypeDoc config, or reference navigation changes, run:

```bash
pnpm run docs:sdk
pnpm run lint:write
git diff -- docs/pages/reference/ docs/docs.yml
```

Commit generated reference diffs and review any `docs/docs.yml` nav diff
separately. Do not hand-edit generated reference pages as the primary fix.
