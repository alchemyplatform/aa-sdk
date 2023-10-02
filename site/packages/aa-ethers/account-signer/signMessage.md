---
outline: deep
head:
  - - meta
    - property: og:title
      content: AccountSigner • signMessage
  - - meta
    - name: description
      content: Overview of the signMessage method on AccountSigner in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the signMessage method on AccountSigner in aa-ethers
---

# signMessage

`signMessage` is a method on `AccountSigner` that signs messages with the `AccountSigner`'s owner address.

## Usage

::: code-group

```ts [example.ts]
import { signer } from "./ethers-signer";

// sign message with the signer's owner address
const signedMessage = await signer.signMessage("test");
```

<<< @/snippets/ethers-signer.ts
:::

## Returns

### `Promise<string>`

A Promise containing the hex signture of the message

## Parameters

### `msg: string | Uint8Arra`

The message to sign
