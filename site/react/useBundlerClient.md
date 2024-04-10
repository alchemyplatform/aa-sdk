---
outline: deep
head:
  - - meta
    - property: og:title
      content: useBundlerClient
  - - meta
    - name: description
      content: An overview of the useBundlerClient hook
  - - meta
    - property: og:description
      content: An overview of the useBundlerClient hook
  - - meta
    - name: twitter:title
      content: useBundlerClient
  - - meta
    - name: twitter:description
      content: An overview of the useBundlerClient hook
---

# useBundlerClient

The `useBundlerClient` hook returns the underlying Bundler RPC client instance.

## Import

```ts
import { useBundlerClient } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useBundlerClient.tsx

## Return Type

```ts
import { type UseBundlerClientResult } from "@alchemy/aa-alchemy/react";
```

Returns an instance of `ClientWithAlchemyMethods` which is the JSON RPC client connected to Alchemy services.
