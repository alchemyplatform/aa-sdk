---
outline: deep
head:
  - - meta
    - property: og:title
      content: AccountSigner • sendTransaction
  - - meta
    - name: description
      content: Overview of the sendTransaction method on AccountSigner in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the sendTransaction method on AccountSigner in aa-ethers
---

# sendTransaction

`sendTransaction` is a method on `AccountSigner` that sends a transaction on behalf of the Signer's smart contract account, with request and response formatted as if you were using the ethers.js library.

## Usage

::: code-group

```ts [example.ts]
import { signer } from "./ethers-signer";

// sign message with the signer's owner address
const signedMessage = await signer.signMessage("test");
```

## Returns

### `Promise<string>`

A Promise containing the hex signture of the message

## Parameters

### `msg: string | Uint8Arra`

The message to sign
