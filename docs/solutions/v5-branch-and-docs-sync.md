---
title: V5 Branch and Docs Sync
date: 2026-05-06
tags:
  - v5
  - docs
  - workflows
area: release-workflows
---

# V5 Branch and Docs Sync

## Problem

It is easy to confuse the branch that owns v5 SDK source with the branch that
receives generated docs PRs.

## Root Cause

`publish-v5-beta.yml` and `update-v5-docs.yml` use `v5.x.x` as the v5 source
branch. `update-v5-docs.yml` then checks out `main` separately, copies generated
reference docs into it, and opens or updates a PR against `main`.

## Solution

For v5 SDK source and scaffold work, use `v5.x.x` as the comparison and PR base.
For generated docs sync PRs created by `update-v5-docs.yml`, expect the target
branch to be `main`.
