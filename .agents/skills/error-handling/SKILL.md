---
name: error-handling
description: |
  Use when throwing, catching, wrapping, documenting, or testing runtime errors
  in aa-sdk packages.
last_verified: 2026-05-06
---

# Error Handling

Runtime package errors should use the SDK error hierarchy rooted at
`@alchemy/common` `BaseError`.

## Rules

| Rule                                      | When to read                                    |
| ----------------------------------------- | ----------------------------------------------- |
| [BaseError](rules/base-error.md)          | Before adding package runtime errors.           |
| [No plain Error](rules/no-plain-error.md) | Before writing throw statements in `packages/`. |
| [Raise footgun](rules/raise-footgun.md)   | Before using or modifying `raise`.              |

## Evidence

- `packages/common/src/errors/BaseError.ts` extends viem's `BaseError`.
- `.eslintrc` forbids `throw new Error(...)` in `packages/**/*` except tests.
- `.eslintrc` forbids `import { BaseError } from "viem"` to prevent accidentally
  using viem's `BaseError` instead of `@alchemy/common`'s.
- `packages/wallet-apis/src/utils/schema.ts` wraps Zod validation failures in
  `@alchemy/common` `BaseError`.
