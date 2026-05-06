# Raise Footgun

Be careful with `raise` from `packages/common/src/utils/raise.ts`.

## Why

`raise` throws viem's `BaseError` for string arguments, not the SDK
`@alchemy/common` `BaseError` class. That may be intentional for low-level viem
compatibility, but it is different from the package runtime error convention.

## Good

Use `raise` only when the existing call site expects its exact behavior.

```ts
return value ?? raise("Missing value");
```

For new SDK-facing failures, prefer a specific SDK error class or
`@alchemy/common` `BaseError`.

## Bad

Replacing established SDK error subclasses with `raise("...")` because it is
shorter.

## Exceptions

If you are deliberately working on the `raise` helper itself, preserve its
public behavior or update all consumers and tests that depend on it.
