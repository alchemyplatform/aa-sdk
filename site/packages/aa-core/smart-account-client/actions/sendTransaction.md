---
outline: deep
head:
  - - meta
    - property: og:title
      content: SmartAccountClient • sendTransaction
  - - meta
    - name: description
      content: Overview of the sendTransaction method on SmartAccountClient
  - - meta
    - property: og:description
      content: Overview of the sendTransaction method on SmartAccountClient
---

# sendTransaction

This takes an ethereum transaction and converts it into a `UserOperation` (UO), sends the UO, and waits on the receipt of that UO (i.e. has it been mined).

If you don't want to wait for the UO to mine, it is recommended to use [sendUserOperation](./sendUserOperation) instead.

Note that `to`, `data`, `value`, `maxFeePerGas`, `maxPriorityFeePerGas` fields of the transaction request type are considered and used to build the user operation from the transaction, while other fields are not used.

## Usage

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
const tx: RpcTransactionRequest = {
  from, // ignored
  to,
  data: encodeFunctionData({
    abi: ContractABI.abi,
    functionName: "func",
    args: [arg1, arg2, ...],
  }),
};
const txHash = await smartAccountClient.sendTransaction(tx);
```

<<< @/snippets/aa-core/smartAccountClient.ts

:::

## Returns

### `Promise<Hash | null>`

A `Promise` containing the transaction hash

<!--@include: ../../../../snippets/aa-core/send-tx-param.md-->
