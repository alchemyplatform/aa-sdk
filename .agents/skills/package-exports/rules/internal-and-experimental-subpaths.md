# Internal and Experimental Subpaths

Use `internal` and `experimental` subpaths deliberately.

## Why

`@alchemy/common/internal` and `@alchemy/wallet-apis/internal` expose integration
surfaces for other package code. `@alchemy/wallet-apis/experimental` exposes
unstable Wallet API actions such as quote and swap helpers. These are not the
same stability level as the root package export.

## Good

- Import root package APIs from `@alchemy/<package>` when writing consumer-facing
  examples or stable docs.
- Use `@alchemy/wallet-apis/experimental` only for features that should be
  clearly labeled experimental.
- Keep TypeDoc entry points in `typedoc.json` aligned with intentionally
  documented subpaths.

## Bad

Exposing `internal` imports in public guides or examples without explaining why
the stable root export is insufficient.

## Exceptions

Package implementation code may use internal subpaths when it is sharing
non-public helpers across workspace packages.
