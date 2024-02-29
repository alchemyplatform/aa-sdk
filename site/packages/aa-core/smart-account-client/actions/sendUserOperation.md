---
outline: deep
head:
  - - meta
    - property: og:title
      content: sendUserOperation
  - - meta
    - name: description
      content: Overview of the sendUserOperation method on SmartAccountClient
  - - meta
    - property: og:description
      content: Overview of the sendUserOperation method on SmartAccountClient
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
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
// send single
smartAccountClient.sendUserOperation({
  uo: {
    data: "0xCalldata",
    target: "0xTarget",
    value: 0n,
  },
});

// send batch

// NOTE: Not all Smart Contract Accounts support batching.
// The `SmartContractAccount` implementation must have the `encodeBatchExecute` method
// implemented for the `SmartAccountClient` to execute the batched user operation successfully.
smartAccountClient.sendUserOperation({
  uo: [
    {
      data: "0xCalldata",
      target: "0xTarget",
    },
    {
      data: "0xCalldata2",
      target: "0xTarget2",
      value: 1000n, // in wei
    },
  ],
});
```

<<< @/snippets/aa-core/smartAccountClient.ts
:::

## Returns

### `Promise<{ hash: Hash, request: UserOperationRequest }>`

A Promise containing the hash of the user operation and the request that was sent.

**Note**: The hash is not the User Operation Receipt. The user operation still needs to be bundled and included in a block. The user operation result is more of a proof of submission than a receipt.

## Parameters

### `SendUserOperationParameters<TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined>`

::: details SendUserOperationParameters
<<< @/../packages/core/src/actions/smartAccount/types.ts#SendUserOperationParameters
:::

- `uo: UserOperationCallData | UserOperationCallData[]`

  ::: details UserOperationCallData
  <<< @/../packages/core/src/types.ts#UserOperationCallData
  :::

  - `target: Address` - the target of the call (equivalent to `to` in a transaction)
  - `data: Hex` - can be either `0x` or a call data string
  - `value?: bigint` - optionally, set the value in wei you want to send to the target

- `overrides?:` [`UserOperationOverrides`](/packages/aa-core/smart-account-client/types/userOperationOverrides.md)

Optional parameter where you can specify override values for `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit` or `paymasterAndData` on the user operation request

- `account?: TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined`

If your client was not instantiated with an account, then you will have to pass the account into this call.
