---
outline: deep
head:
  - - meta
    - property: og:title
      content: buildUserOperation
  - - meta
    - name: description
      content: Overview of the buildUserOperation method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the buildUserOperation method on ISmartAccountProvider
---

# buildUserOperation

Builds an _unsigned_ UserOperation struct with the all of the middleware run on it through the middleware pipeline.

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
// build single
const uoStruct = await provider.buildUserOperation({
  target: TO_ADDRESS,
  data: ENCODED_DATA,
  value: VALUE, // optional
});
const { hash: uoHash } = await provider.sendUserOperation(uoStruct);

// build batch
const batchedUoStruct = await provider.buildUserOperation([
  {
    data: "0xCalldata",
    target: "0xTarget",
  },
  {
    data: "0xCalldata2",
    target: "0xTarget2",
    value: 1000n, // in wei
  },
]);
const { hash: batchedUoHash } = await provider.sendUserOperation(
  batchedUoStruct
);
```

<<< @/snippets/provider.ts
:::

## Returns

### `Promise<UserOperationStruct>`

A Promise containing the _unsigned_ UserOperation struct resulting from the middleware pipeline

## Parameters

### `UserOperationCallData | UserOperationCallData[]`

- `target: Address` - the target of the call (equivalent to `to` in a transaction)
- `data: Hex` - can be either `0x` or a call data string
- `value?: bigint` - optionally, set the value in wei you want to send to the target
