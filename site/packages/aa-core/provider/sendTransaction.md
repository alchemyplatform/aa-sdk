---
outline: deep
head:
  - - meta
    - property: og:title
      content: ISmartAccountProvider • sendTransaction
  - - meta
    - name: description
      content: Overview of the sendTransaction method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the sendTransaction method on ISmartAccountProvider
---

# sendTransaction

This takes an ethereum transaction and converts it into a UserOperation, sends the UserOperation, and waits on the receipt of that UserOperation (ie. has it been mined).

If you don't want to wait for the UserOperation to mine, it's recommended to user [sendUserOperation](./sendUserOperation) instead.

Note that `to` field of transaction is required, and among other fields of transaction, only `data`, `value`, `maxFeePerGas`, `maxPriorityFeePerGas` fields are considered if given. Support for other fields is coming soon.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const txHash = await provider.sendTransaction({
  from, // ignored
  to,
  data: encodeFunctionData({
    abi: ContractABI.abi,
    functionName: "func",
    args: [arg1, arg2, ...],
  }),
});
```

<<< @/snippets/provider.ts

:::

## Returns

### `Promise<Hash | null>`

A Promise containing the transaction hash

## Parameters

### `request: RpcTransactionRequest`

The `RpcTransactionRequest` object representing a traditional ethereum transaction
