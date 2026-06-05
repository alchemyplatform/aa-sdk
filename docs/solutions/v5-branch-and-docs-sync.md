---
title: V5 Branch Model
date: 2026-05-21
tags:
  - v5
  - v4
  - docs
  - workflows
area: release-workflows
---

# V5 Branch Model

## Problem

The branch holding the v5 SDK source has changed since the original v5
preview, and stale agent docs sometimes still point at the old beta branch.

## Root Cause

During the v5 preview, v5 source lived on `v5.x.x` and a dedicated
`update-v5-docs.yml` workflow synced generated reference docs from `v5.x.x`
into the `main` branch (which then held v4). That model retired on 2026-05-20
when v5 graduated to `main`.

## Solution

- v5 SDK source lives on `main`. Use it as the audit source, comparison base,
  and PR base for new v5 work.
- Legacy v4 SDK source lives on `v4.x.x` and only receives backports/security
  fixes. Lerna's `allowBranch: "v4.x.x"` (set in `v4.x.x`'s `lerna.json`)
  permits v4 publishes from that branch.
- Generated reference docs are produced directly on the source branch via
  `pnpm docs:sdk`. There is no longer a cross-branch sync workflow.
- Publish for both v5 (from `main`) and v4 backports (from `v4.x.x`) goes
  through the single `.github/workflows/publish-package.yml` workflow.
- The legacy `v5.x.x` branch may still exist on the remote but is no longer
  authoritative. Do not target it for new PRs.
