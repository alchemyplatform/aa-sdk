# Anvil and Rundler

Tests that touch account or bundler behavior may depend on Foundry/Anvil and
Rundler fixtures.

## Why

CI installs Foundry and Rundler, sets `VITEST_SEPOLIA_FORK_URL` from secrets
when available, and runs package tests through the shared Vitest setup.

## Good

- Check `.env.example` for required local variables before running forked tests.
- Keep Anvil/Rundler setup centralized in `.vitest`.
- Use package project filters to avoid starting conflicting fixtures in multiple
  Vitest processes.

## Bad

Starting independent local chain processes in tests without coordinating with
global setup.

## Exceptions

Pure unit tests that do not touch chain, bundler, or paymaster behavior should
not require Anvil, Rundler, or fork URLs.
