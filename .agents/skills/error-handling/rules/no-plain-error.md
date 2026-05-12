# No Plain Error

Do not throw `new Error(...)` from package runtime code.

## Why

The root `.eslintrc` has a `no-restricted-syntax` rule for `packages/**/*` that
reports: "Do not throw plain Error. Use BaseError or a more specific error
subclass instead."

## Good

```ts
throw new ConnectionConfigError(details);
```

## Bad

```ts
throw new Error(details);
```

## Exceptions

The lint rule is disabled for `packages/**/*.test.ts`, `packages/**/*.test-d.ts`,
`packages/**/test-utils/**/*`, and `packages/**/__tests__/**/*`.
