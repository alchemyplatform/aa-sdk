---
title: Signed V5 Docs Sync
date: 2026-05-06
tags:
  - github-actions
  - docs
  - ci
area: release-workflows
---

# Signed V5 Docs Sync

## Problem

Docs sync changes need to open or update a PR and still trigger the normal PR CI
checks.

## Root Cause

`update-v5-docs.yml` first pushes a docs branch, then replaces that commit via
the GitHub API using an app token. The workflow comment explains that API
commits are signed and app-token updates fire `pull_request:synchronize`, while
plain `GITHUB_TOKEN` pushes do not trigger workflows.

## Solution

Preserve the signed-commit replacement unless replacing it with an equivalent
mechanism that produces verified commits and triggers PR synchronize CI. Do not
remove it as apparent duplication without testing the full workflow behavior.
