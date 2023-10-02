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

`connectToAccount` is a method on `EthersProviderAdapter` that you can optionally call to connect the Provider to an Account and returns a Signer. This enables the returned `AccountSigner` to leverage the provider when signing messages, UserOperations, and transactions for a smart contract account using the owner account.
Ø

## Usage

::: code-group

<<< @/snippets/ethers-provider.ts
:::

## Returns

### `AccountSigner<TAccount extends ISmartContractAccount>`

A new instance of a connected `AccountSigner`for any implementation class of `ISmartContractAccount`.

## Parameters

### `fn: (rpcClient: PublicErc4337Client) => TAccount extends ISmartContractAccount` -- a function that takes in the provider's rpcClient and returns an AccountSigner
