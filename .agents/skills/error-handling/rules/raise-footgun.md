# Raise Footgun

`raise` from `packages/common/src/utils/raise.ts` now uses `@alchemy/common`
`BaseError`. An ESLint `no-restricted-imports` rule also prevents importing
`BaseError` from `viem` directly.

## Why

`raise` previously threw viem's `BaseError` instead of the SDK's, which lost
docs links and version metadata. This was fixed and an ESLint rule was added to
prevent regressions.

## Good

```ts
return value ?? raise("Missing value");
```

`raise` is fine for concise null/undefined guards. For new SDK-facing failures
with richer error context, prefer a specific SDK error subclass.

## Bad

Importing `BaseError` from `viem` in package code. The ESLint rule will catch
this, but the one legitimate use in `packages/common/src/errors/BaseError.ts`
(which extends viem's class) is exempted via an override.

## Exceptions

`packages/common/src/errors/BaseError.ts` is the only file allowed to import
`BaseError` from `viem`.
