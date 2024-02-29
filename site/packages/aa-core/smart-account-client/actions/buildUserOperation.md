---
outline: deep
head:
  - - meta
    - property: og:title
      content: buildUserOperation
  - - meta
    - name: description
      content: Overview of the buildUserOperation method on SmartAccountClient
  - - meta
    - property: og:description
      content: Overview of the buildUserOperation method on SmartAccountClient
---

# buildUserOperation

Builds an _unsigned_ `UserOperation` (UO) struct with all middleware of the `SmartAccountClient` run through the middleware pipeline.

The order of the middlewares is:

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
// build single
const uoStruct = await smartAccountClient.buildUserOperation({
  uo: {
    target: TO_ADDRESS,
    data: ENCODED_DATA,
    value: VALUE, // optional
  },
});

// signUserOperation signs the above unsigned user operation struct built
// using the account connected to the smart account client
const request = await smartAccountClient.signUserOperation({ uoStruct });

// You can use the BundlerAction `sendRawUserOperation` (packages/core/src/actions/bundler/sendRawUserOperation.ts)
// to send the signed user operation request to the bundler, requesting the bundler to send the signed uo to the
// EntryPoint contract pointed at the entryPoint address parameter
const entryPointAddress = client.account.getEntryPoint().address;
const uoHash = await smartAccountClient.sendRawUserOperation({
  request,
  entryPoint: entryPointAddress,
});

// build batch

// NOTE: Not all Smart Contract Accounts support batching.
// The `SmartContractAccount` implementation must have the `encodeBatchExecute` method
// implemented for the `SmartAccountClient` to execute the batched user operation successfully.
const batchedUoStruct = await smartAccountClient.buildUserOperation({
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

// signUserOperation signs the above unsigned user operation struct built
// using the account connected to the smart account client
const request = await smartAccountClient.signUserOperation({ uoStruct });

// You can use the BundlerAction `sendRawUserOperation` (packages/core/src/actions/bundler/sendRawUserOperation.ts)
// to send the signed user operation request to the bundler, requesting the bundler to send the signed uo to the
// EntryPoint contract pointed at the entryPoint address parameter
const entryPointAddress = client.account.getEntryPoint().address;
const uoHash = await smartAccountClient.sendRawUserOperation({
  request,
  entryPoint: entryPointAddress,
});
```

<<< @/snippets/aa-core/smartAccountClient.ts
:::

## Returns

### `Promise<UserOperationStruct>`

A Promise containing the _unsigned_ UO struct resulting from the middleware pipeline

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
