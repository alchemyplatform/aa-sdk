---
title: Alchemy Signer • getAddress
description: Learn how to use the AlchemySigner.getAddress method
---

# getAddress

Returns the signer's public address.

:::warning
This method throws if there is no authenticated user.
:::

## Usage

:::code-group

```ts [example.ts]
import { signer } from "./signer";

const address = await signer.getAddress();
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

## Returns

`Promise<Address>` -- on success returns the signer's public address.
