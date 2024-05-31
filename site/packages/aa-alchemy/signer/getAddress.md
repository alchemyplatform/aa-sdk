---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • getAddress
  - - meta
    - name: description
      content: Learn how to use the AlchemySigner.getAddress method
  - - meta
    - property: og:description
      content: Learn how to use the AlchemySigner.getAddress method
  - - meta
    - name: twitter:title
      content: Alchemy Signer • getAddress
  - - meta
    - name: twitter:description
      content: Learn how to use the AlchemySigner.getAddress method
---

# getAddress

Returns the signer's public address.

::: warning
This method throws if there is no authenticated user.
:::

## Usage

::: code-group

```ts
import { signer } from "./signer";

const address = await signer.getAddress();
```

<<< @/snippets/signers/alchemy/signer.ts

:::

## Returns

`Promise<Address>` -- on success returns the signer's public address.
