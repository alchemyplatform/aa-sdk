---
title: Vitest Anvil Rundler
date: 2026-05-06
tags:
  - testing
  - vitest
  - anvil
  - rundler
area: testing
---

# Vitest Anvil Rundler

## Problem

Wallet and account tests can fail locally if the chain/bundler prerequisites are
missing or if tests are run in conflicting processes.

## Root Cause

The Vitest workspace uses shared `.vitest` setup with global setup files,
timeouts, a `~test` alias, and a fixed thread pool. CI installs Foundry and
Rundler, and uses `VITEST_SEPOLIA_FORK_URL` when available.

## Solution

Use the workspace project names and affected-test script:

```bash
./scripts/run-affected-tests.sh v5.x.x
pnpm vitest run --project=alchemy/wallet-apis
```

Check `.env.example` and `.vitest/` before debugging local chain-dependent
failures. Prefer one Vitest process with the needed project filters over
parallel package runs.
