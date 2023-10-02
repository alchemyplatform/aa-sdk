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

`sendTransaction` is a method on `AccountSigner` that signs messages with the `AccountSigner`'s owner address.

## Usage

::: code-group

```ts [example.ts]
import { signer } from "./ethers-signer";

// get the signer's underlying viem client with EIP-4337 capabilties
const client = signer.getPublicErc4337Client();
```

## Returns

### `Promise<TransactionResponse>`

A Promise containing the ethers.js `TransactionResponse` object

## Parameters

### `transaction: Deferrable<TransactionRequest>` -- the ethers.js `TransactionRequest` object, where each field may be a Promise or its value
