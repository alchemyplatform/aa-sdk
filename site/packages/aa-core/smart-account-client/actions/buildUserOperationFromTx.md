---
outline: deep
head:
  - - meta
    - property: og:title
      content: buildUserOperationFromTx
  - - meta
    - name: description
      content: Overview of the buildUserOperationFromTx method on SmartAccountClient
  - - meta
    - property: og:description
      content: Overview of the buildUserOperationFromTx method on SmartAccountClient
---

# buildUserOperationFromTx

Converts a traditional Ethereum transaction and builds an _unsigned_ `UserOperation` (UO) struct with all middleware of the `SmartAccountClient` run through the middleware pipeline.

The order of the middlewares is:

1.  `dummyPaymasterDataMiddleware` -- populates a dummy paymaster data to use in estimation (default: "0x")
2.  `feeDataGetter` -- sets maxfeePerGas and maxPriorityFeePerGas
3.  `gasEstimator` -- calls eth_estimateUserOperationGas
4.  `paymasterMiddleware` -- used to set paymasterAndData. (default: "0x")
5.  `customMiddleware` -- allows you to override any of the results returned by previous middlewares

Note that `to`, `data`, `value`, `maxFeePerGas`, `maxPriorityFeePerGas` fields of the transaction request type are considered and used to build the user operation from the transaction, while other fields are not used.

## Usage

::: code-group

```ts [example.ts]
import type { RpcTransactionRequest } from "viem";
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
// buildUserOperationFromTx converts a traditional Ethereum transaction and returns
// the unsigned user operation struct after constructing the user operation struct
// through the middleware pipeline
const tx: RpcTransactionRequest = {
  from, // ignored
  to,
  data: encodeFunctionData({
    abi: ContractABI.abi,
    functionName: "func",
    args: [arg1, arg2, ...],
  }),
};
const uoStruct = await smartAccountClient.buildUserOperationFromTx(tx);

// signUserOperation signs the above unsigned user operation struct built
// using the account connected to the smart account client
const request = await smartAccountClient.signUserOperation({ uoStruct });

// You can use the BundlerAction `sendRawUserOperation` (packages/core/src/actions/bundler/sendRawUserOperation.ts)
// to send the signed user operation request to the bundler, requesting the bundler to send the signed uo to the
// EntryPoint contract pointed at the entryPoint address parameter
const entryPointAddress = client.account.getEntryPoint().address;
const uoHash = await smartAccountClient.sendRawUserOperation({ request, entryPoint: entryPointAddress });
```

<<< @/snippets/aa-core/smartAccountClient.ts
:::

## Returns

### `Promise<BuildUserOperationFromTransactionsResult>`

A `Promise` containing the _unsigned_ UO struct converted from the input transaction with all the middleware run on the resulting UO

## Parameters

### `args: SendTransactionParameters<TChain, TAccount, TChainOverride>`

::: details SendTransactionParameters

```ts
export type SendTransactionParameters<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
  ///
  derivedChain extends Chain | undefined = DeriveChain<TChain, TChainOverride>
> = UnionOmit<FormattedTransactionRequest<derivedChain>, "from"> &
  GetAccountParameter<TAccount> &
  GetChainParameter<TChain, TChainOverride>;
```

:::

The [`SendTransactionParameters`](https://github.com/wevm/viem/blob/6ef4ac131a878bf1dc4b335f5dc127e62618dda0/src/types/transaction.ts#L209) used as the parameter to the `WalletAction` [`sendTransaction`](https://viem.sh/docs/actions/wallet/sendTransaction) method representing a traditional ethereum transaction request.

- `overrides?:` [`UserOperationOverrides`](/resources/types#useroperationoverrides)

Optional parameter where you can specify override values for `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit`, `paymasterAndData`, or `nonceKey` for the user operation request
