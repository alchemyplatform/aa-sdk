---
title: Alchemy Signer • signTransaction
description: Learn how to use the AlchemySigner.signTransaction method
---

# signTransaction

The `signTransaction` method is used to sign transactions with the Alchemy Signer when using the Signer as an EOA.

:::warning
This method throws if there is no authenticated user.
:::

## Usage

:::code-group

```ts [example.ts]
import { signer } from "./signer";

const tx = {...};
const signature = await signer.signTransaction(tx);
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

## Returns

`Promise<Hex>` -- on success returns the signed Transaction.

## Parameters

`tx: TransactionSerializable` -- the transaction to sign
