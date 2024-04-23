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
