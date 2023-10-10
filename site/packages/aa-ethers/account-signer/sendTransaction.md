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

`sendTransaction` is a method on `AccountSigner` that sends transactions on behalf of the `AccountSigner`'s smart contract account, with request and response formatted as if you were using the ethers.js library.

Note that `to` field of transaction is required, and among other fields of transaction, only `data`, `value`, `maxFeePerGas`, `maxPriorityFeePerGas` fields are considered and optional. Support for other fields is coming soon.

## Usage

::: code-group

```ts [example.ts]
import { signer } from "./ethers-signer";

const txHash = await signer.sendTransaction({
  from, // ignored
  to,
  data: encodeFunctionData({
    abi: ContractABI.abi,
    functionName: "func",
    args: [arg1, arg2, ...],
  }),
});
```

<<< @/snippets/ethers-signer.ts
:::

## Returns

### `Promise<TransactionResponse>`

A Promise containing the ethers.js `TransactionResponse` object

## Parameters

### `transaction: Deferrable<TransactionRequest>`

The ethers.js `TransactionRequest` object, where each field may be a Promise or its value
