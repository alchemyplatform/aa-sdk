# BaseError

Use `@alchemy/common` `BaseError` or a specific subclass for package runtime
errors.

## Why

`BaseError` extends viem's `BaseError`, sets the SDK error name/version, and can
append Alchemy docs links. This gives consumers consistent SDK error behavior.

## Good

```ts
import { BaseError } from "@alchemy/common";

throw new BaseError("Invalid wallet API response", { cause: error });
```

Prefer a specific error subclass when the package already has one for the
condition.

## Bad

```ts
throw new Error("Invalid wallet API response");
```

## Exceptions

Tests are allowed to use plain `Error` where that makes the test setup clearer;
`.eslintrc` explicitly disables the restriction for test paths.
