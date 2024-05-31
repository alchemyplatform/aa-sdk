---
outline: deep
head:
  - - meta
    - property: og:title
      content: useSigner
  - - meta
    - name: description
      content: An overview of the useSigner hook
  - - meta
    - property: og:description
      content: An overview of the useSigner hook
  - - meta
    - name: twitter:title
      content: useSigner
  - - meta
    - name: twitter:description
      content: An overview of the useSigner hook
---

# useSigner

The `useSigner` hook returns the `AlchemySigner` instance created within the Accounts Context. This method is provided as a convenience for accessing the `AlchemySigner` instance directly. However, most operations involving the signer are exported via other hooks.

## Import

```ts
import { useSigner } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useSigner.tsx

## Return Type

```ts
import { type AlchemySigner } from "@alchemy/aa-alchemy";
```

Returns an instance of the `AlchemySigner` on the client and `null` on the server.
