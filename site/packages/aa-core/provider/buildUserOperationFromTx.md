---
outline: deep
head:
  - - meta
    - property: og:title
      content: buildUserOperationFromTx
  - - meta
    - name: description
      content: Overview of the buildUserOperationFromTx method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the buildUserOperationFromTx method on ISmartAccountProvider
---

# buildUserOperationFromTx

Converts a traditional Ethereum transaction and builds an _unsigned_ UserOperation struct with the all of the middleware run on it through the middleware pipeline.

The order of the middlewares is:

1.  `dummyPaymasterDataMiddleware` -- populates a dummy paymaster data to use in estimation (default: "0x")
2.  `feeDataGetter` -- sets maxfeePerGas and maxPriorityFeePerGas
3.  `gasEstimator` -- calls eth_estimateUserOperationGas
4.  `paymasterMiddleware` -- used to set paymasterAndData. (default: "0x")
5.  `customMiddleware` -- allows you to override any of the results returned by previous middlewares

Note that `to` field of transaction is required, and among other fields of transaction, only `data`, `value`, `maxFeePerGas`, `maxPriorityFeePerGas` fields are considered and optional.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const uoStruct = await provider.buildUserOperationFromTx({
  from, // ignored
  to,
  data: encodeFunctionData({
    abi: ContractABI.abi,
    functionName: "func",
    args: [arg1, arg2, ...],
  }),
});
const uoHash = await provider.sendUserOperation(uoStruct);
```

<<< @/snippets/provider.ts
:::

## Returns

### `Promise<UserOperationStruct>`

A Promise containing the _unsigned_ UserOperation struct converted from the input transaction with all the middleware run on the resulting UserOperation

## Parameters

### `tx: RpcTransactionRequest`

The `RpcTransactionRequest` object representing a traditional ethereum transaction
