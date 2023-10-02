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

`sendTransaction` is a method on `AccountSigner` that sends transaction on behalf of the `AccountSigner`'s smart contract account, with request and response formatted as if you were using the ethers.js library.

## Usage

::: code-group

```ts [example.ts]
import { signer } from "./ethers-signer";

// get the signer's underlying viem client with EIP-4337 capabilties
const client = signer.getPublicErc4337Client();
```

<<< @/snippets/ethers-signer.ts
:::

## Returns

### `Promise<TransactionResponse>`

A Promise containing the ethers.js `TransactionResponse` object

## Parameters

### `transaction: Deferrable<TransactionRequest>`

The ethers.js `TransactionRequest` object, where each field may be a Promise or its value
