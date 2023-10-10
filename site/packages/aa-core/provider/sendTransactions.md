---
outline: deep
head:
  - - meta
    - property: og:title
      content: sendTransactions
  - - meta
    - name: description
      content: Overview of the sendTransactions method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the sendTransactions method on ISmartAccountProvider
---

# sendTransactions

This takes a set of ethereum transactions and converts them into one single UserOperation, sends the UserOperation, and waits on the receipt of that UserOperation (ie. has it been mined). If you don't want to wait for the UserOperation to mine, it's recommended to user [sendUserOperation](./sendUserOperation) instead.

**NOTE**: The account you're sending the transactions _to_ MUST support batch transactions.

Also note that `to` field of transaction is required, and among other fields of transaction, only `data`, `value`, `maxFeePerGas`, `maxPriorityFeePerGas` fields are considered and optional.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const txHash = await provider.sendTransactions([
  {
    from, // ignored
    to,
    data: encodeFunctionData({
      abi: ContractABI.abi,
      functionName: "func",
      args: [arg1, arg2, ...],
    }),
  },
  {
    from, // ignored
    to,
    data: encodeFunctionData({
      abi: ContractABI.abi,
      functionName: "func",
      args: [arg1, arg2, ...],
    }),
  },
  ...
  {
    from, // ignored
    to,
    data: encodeFunctionData({
      abi: ContractABI.abi,
      functionName: "func",
      args: [arg1, arg2, ...],
    }),
  },
]);
```

<<< @/snippets/provider.ts

:::

## Returns

### `Promise<Hash | null>`

A Promise containing the transaction hash

## Parameters

### `request: RpcTransactionRequest[]`

An `RpcTransactionRequest` array representing a traditional ethereum transaction
