---
outline: deep
head:
  - - meta
    - property: og:title
      content: buildUserOperationFromTxs
  - - meta
    - name: description
      content: Overview of the buildUserOperationFromTxs method on SmartAccountClient
  - - meta
    - property: og:description
      content: Overview of the buildUserOperationFromTxs method on SmartAccountClient
---

# buildUserOperationFromTxs

Converts traditional Ethereum transactions in batch and builds an _unsigned_ `UserOperation` (UO) struct with all middleware of the `SmartAccountClient` run through the middleware pipeline.

The order of the middlewares is:

1.  `dummyPaymasterDataMiddleware` -- populates a dummy paymaster data to use in estimation (default: "0x")
2.  `feeDataGetter` -- sets maxfeePerGas and maxPriorityFeePerGas
3.  `gasEstimator` -- calls eth_estimateUserOperationGas
4.  `paymasterMiddleware` -- used to set paymasterAndData. (default: "0x")
5.  `customMiddleware` -- allows you to override any of the results returned by previous middlewares

**NOTE**: Not all Smart Contract Accounts support batching. The `SmartContractAccount` implementation must implement the encodeBatchExecute method for the `SmartAccountClient` to execute the batched user operation successfully.

Note that `to`, `data`, `value`, `maxFeePerGas`, `maxPriorityFeePerGas` fields of the transaction request type are considered and used to build the user operation from the transaction, while other fields are not used.

## Usage

::: code-group

```ts [example.ts]
import type { RpcTransactionRequest } from "viem";
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
// buildUserOperationFromTxs converts traditional Ethereum transactions in batch and returns
// the unsigned user operation struct after constructing the user operation struct
// through the middleware pipeline
const requests: RpcTransactionRequest[] = [
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
];
const uoStruct = await smartAccountClient.buildUserOperationFromTxs({
  requests,
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

## Returns

### `Promise<BuildUserOperationFromTransactionsResult>`

::: details BuildUserOperationFromTransactionsResult
<<< @/../packages/core/src/actions/smartAccount/types.ts#BuildUserOperationFromTransactionsResult
:::

- `uoStruct: UserOperationStruct`

The _unsigned_ UO struct converted from the input transactions with all the middleware run on the resulting UO

- `batch: UserOperationCallData[]`

The batch array of `UserOperationCallData` corresponding to the user operation calldata generated from the input batch of transactions

- `target: Address` - the target of the call (equivalent to `to` in a transaction)
- `data: Hex` - can be either `0x` or a call data string
- `value?: bigint` - optionally, set the value in wei you want to send to the target

- `overrides?:` [`UserOperationOverrides`](/packages/aa-core/smart-account-client/types/userOperationOverrides.md)

`UserOperationOverrides` used as an additional parameter to the `SmartAccountClient` middleware pipeline in addition to the passed user operation calldata for constructing the user operation struct (`uoStruct`) returned; generated to contain the `maxFeePerGas` and `maxPriorityFeePerGas` as the max values of the corresponding fields of input transactions, merged with the optional `overrides` parameter passed in as the user input to the function

## Parameters

### `SendTransactionsParameters<TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined>`

::: details SendTransactionsParameters
<<< @/../packages/core/src/actions/smartAccount/types.ts#SendTransactionsParameters
:::

- `requests: RpcTransactionRequest[]`

The `viem` [`RpcTransactionRequest`](https://viem.sh/docs/glossary/types#transactionrequest) type representing a traditional ethereum transaction

- `overrides?:` [`UserOperationOverrides`](/resources/types#useroperationoverrides)

Optional parameter where you can specify override values for `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit`, `paymasterAndData`, or `nonceKey` for the user operation request

- `account?: TAccount extends SmartContractAccount | undefined`

When using this action, if the `SmartContractAccount` has not been connected to the `SmartAccountClient` (e.g. `SmartAccountClient` not instantiated with your `SmartContractAccount` during [`createSmartAccountClient`](/packages/aa-core/smart-account-client/)). You can check if the account is connected to the client by checking the `account` field of `SmartAccountClient`. If the account is not connected, you can specify the `SmartContractAccount` instance to use for the function call.
