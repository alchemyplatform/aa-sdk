---
outline: deep
head:
  - - meta
    - property: og:title
      content: EthersProviderAdapter • connectToAccount
  - - meta
    - name: description
      content: Overview of the connectToAccount method on EthersProviderAdapter in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the connectToAccount method on EthersProviderAdapter in aa-ethers
---

# connectToAccount

`connectToAccount` is a method on `EthersProviderAdapter` that you can optionally call to connect the provider to an account and returns a `AccountSigner`. This enables the returned `AccountSigner` to leverage the provider when signing messages, UserOperations, and transactions for a smart account using the connected EOA signer account.

## Usage

::: code-group

<<< @/snippets/aa-ethers/ethers-signer.ts
<<< @/snippets/aa-ethers/ethers-provider.ts
:::

## Returns

### `AccountSigner<TAccount extends SmartContractAccount>`

A new instance of a connected `AccountSigner`for any implementation class of `SmartContractAccount`

## Parameters

### `account: TAccount extends SmartContractAccount`

A function that takes in the provider's rpcClient and returns an AccountSigner
