---
title: AccountSigner • signMessage
description: Overview of the signMessage method on AccountSigner in aa-ethers
---

# signMessage

`signMessage` is a method on `AccountSigner` that signs messages with the `AccountSigner`'s connected EOA signer address.

## Usage

:::code-group

```ts [example.ts]
import { accountSigner } from "./ethers-signer";

// sign message with the account signer's connected EOA signer address
const signedMessage = await accountSigner.signMessage("test");
```

```ts [ethers-signer.ts]
// [!include ~/snippets/aa-ethers/ethers-signer.ts]
```

:::

## Returns

### `Promise<string>`

A `Promise` containing the hex signature of the message

## Parameters

### `msg: string | Uint8Array`

The message to sign
