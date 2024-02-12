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

If you don't want to wait for the UO to mine, it's recommended to user [sendUserOperation](./sendUserOperation) instead.

Note that `to` field of transaction is required, and among other fields of transaction, only `data`, `value`, `maxFeePerGas`, `maxPriorityFeePerGas` fields are considered if given. Support for other fields is coming soon.

## Usage

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
const txHash = await smartAccountClient.sendTransaction({
  from, // ignored
  to,
  data: encodeFunctionData({
    abi: ContractABI.abi,
    functionName: "func",
    args: [arg1, arg2, ...],
  }),
});
```

<<< @/snippets/aa-core/smartAccountClient.ts

:::

## Returns

### `Promise<Hash | null>`

A Promise containing the transaction hash

## Parameters

### `...request: RpcTransactionRequest`

The `RpcTransactionRequest` object representing a traditional ethereum transaction

### `overrides?:` [`UserOperationOverrides`](/packages/aa-core/smart-account-client/types/userOperationOverrides.md)

Optional parameter where you can specify override values for `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit` or `paymasterAndData` on the user operation request

### `account?: SmartContractAccount`

If your client was not instantiated with an account, then you will have to pass the account in to this call.
