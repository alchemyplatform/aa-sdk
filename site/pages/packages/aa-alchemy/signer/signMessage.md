---
title: Alchemy Signer • signMessage
description: Learn how to use the AlchemySigner.signMessage method
---

# signMessage

The `signMessage` method is used to sign a message with the Alchemy Signer.

:::warning
This method throws if there is no authenticated user.
:::

## Usage

:::code-group

```ts [example.ts]
import { signer } from "./signer";

const message = "Hello, world!";
const signature = await signer.signMessage(message);
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

## Returns

`Promise<Hex>` -- on success returns the signature of the message.

## Parameters

`message: string | Uint8Array` -- the message to sign
