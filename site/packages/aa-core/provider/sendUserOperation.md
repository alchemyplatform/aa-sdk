---
outline: deep
head:
  - - meta
    - property: og:title
      content: sendUserOperation
  - - meta
    - name: description
      content: Overview of the sendUserOperation method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the sendUserOperation method on ISmartAccountProvider
---

# sendUserOperation

Sends a user operation or batch of user operations using the connected account.

Before executing, sendUserOperation will run the user operation through the middleware pipeline. The order of the middlewares is:

1.  `dummyPaymasterDataMiddleware` -- populates a dummy paymaster data to use in estimation (default: "0x")
2.  `feeDataGetter` -- sets maxfeePerGas and maxPriorityFeePerGas
3.  `gasEstimator` -- calls eth_estimateUserOperationGas
4.  `paymasterMiddleware` -- used to set paymasterAndData. (default: "0x")
5.  `customMiddleware` -- allows you to override any of the results returned by previous middlewares

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
// send single
provider.sendUserOperation({
  data: "0xCalldata",
  target: "0xTarget",
  value: 0n,
});

// send batch
provider.sendUserOperation([
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
```

<<< @/snippets/provider.ts
:::

## Returns

### `Promise<{ hash: Hash, request: UserOperationRequest }>`

A Promise containing the hash of the user operation and the request that was sent.

**Note**: The hash is not the User Operation Receipt. The user operation still needs to be bundled and included in a block. The user operation result is more of a proof of submission than a receipt.

## Parameters

### `UserOperationCallData | UserOperationCallData[]`

- `target: Address` - the target of the call (equivalent to `to` in a transaction)
- `data: Hex` - can be either `0x` or a call data string
- `value?: bigint` - optionally, set the value in wei you want to send to the target
