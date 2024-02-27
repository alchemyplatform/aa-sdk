---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • signTransaction
  - - meta
    - name: description
      content: Learn how to use the AlchemySigner.signTransaction method
  - - meta
    - property: og:description
      content: Learn how to use the AlchemySigner.signTransaction method
  - - meta
    - name: twitter:title
      content: Alchemy Signer • signTransaction
  - - meta
    - name: twitter:description
      content: Learn how to use the AlchemySigner.signTransaction method
---

# signTransaction

The `signTransaction` method is used to sign transactions with the Alchemy Signer when using the Signer as an EOA.

::: warning
This method throws if there is no authenticated user.
:::

## Usage

::: code-group

```ts
import { signer } from "./signer";

const tx = {...};
const signature = await signer.signTransaction(tx);
```

<<< @/snippets/signers/alchemy/signer.ts

:::

## Returns

`Promise<Hex>` -- on success returns the signed Transaction.

## Parameters

`tx: TransactionSerializable` -- the transaction to sign
