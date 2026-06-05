# ESM Imports

Preserve ESM-compatible import paths in package runtime source.

## Why

The packages are `"type": "module"` and build ESM output. Existing runtime
source uses explicit `.js` extensions for relative imports so emitted JavaScript
can resolve correctly.

## Good

```ts
import { BaseError } from "./errors/BaseError.js";
import type { SmartWalletClient } from "./types.js";
```

Use `import type` for type-only imports when possible.

## Bad

```ts
import { BaseError } from "./errors/BaseError";
```

## Exceptions

Package-name imports such as `@alchemy/common`, `viem`, or
`@alchemy/wallet-api-types/rpc` should use the package export path, not a `.js`
extension.
