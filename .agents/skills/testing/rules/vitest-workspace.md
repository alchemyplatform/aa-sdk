# Vitest Workspace

Use Vitest project names and shared setup consistently.

## Why

The workspace is defined by `vitest.workspace.ts`, and package configs merge the
shared `.vitest` setup. Shared config provides `~test`, global setup, common
timeouts, globals, and excluded e2e patterns.

## Good

```bash
pnpm vitest run --project=alchemy/wallet-apis
pnpm vitest run --project=alchemy/smart-accounts
```

Add package tests under the package's existing test locations and reuse `~test`
helpers where appropriate.

## Bad

Creating a standalone test runner or package-local setup that bypasses
`.vitest/vitest.shared.ts`.

## Exceptions

E2E tests may have separate config when they intentionally require different
environment or timeout behavior.
