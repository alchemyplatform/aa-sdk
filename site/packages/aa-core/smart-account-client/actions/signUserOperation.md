---
outline: deep
head:
  - - meta
    - property: og:title
      content: signUserOperation
  - - meta
    - name: description
      content: Overview of the signUserOperation method on SmartAccountClient
  - - meta
    - property: og:description
      content: Overview of the signUserOperation method on SmartAccountClient
---

# signUserOperation

Signs the unsigned `UserOperationStruct` returned from `buildUserOperation`, `buildUserOperationFromTx`, or `buildUserOperationFromTxs` actions of the `SmartAccountClient` using the account connected to the client.

## Usage

<<< @/snippets/aa-core/buildSignSendRawUserOp.md

## Returns

### `Promise<{ hash: Hash, request: UserOperationRequest }>`

A Promise containing the signed result of the input `UserOperationStruct` using the account connected to the `SmartAccountClient`

## Parameters

### `SignUserOperationParameters<TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined>`

::: details SignUserOperationParameters
<<< @/../packages/core/src/actions/smartAccount/types.ts#SignUserOperationParameters
:::

- `uoStruct: UserOperationStruct`

The unsigned `UserOperationStruct` returned from `buildUserOperation`, `buildUserOperationFromTx`, or `buildUserOperationFromTxs` actions of the `SmartAccountClient` returned after running the client middleware pipeline to construct the user operation struct from the input user operation calldata

- `overrides?:` [`UserOperationOverrides`](/packages/aa-core/smart-account-client/types/userOperationOverrides.md)

Optional parameter where you can specify override values for `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit` or `paymasterAndData` on the user operation request

- `account?: TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined`

If your client was not instantiated with an account, then you will have to pass the account into this call.
