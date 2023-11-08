---
outline: deep
head:
  - - meta
    - property: og:title
      content: EthersProviderAdapter • fromEthersProvider
  - - meta
    - name: description
      content: Overview of the fromEthersProvider method on EthersProviderAdapter in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the fromEthersProvider class on EthersProviderAdapter in aa-ethers
next:
  text: AccountSigner
---

# fromEthersProvider

`fromEthersProvider` is a static method on `EthersProviderAdapter` that converts an ethers.js `JsonRpcProvider` to an `EthersProviderAdapter`.

## Usage

::: code-group

<<< @/snippets/ethers-provider.ts
:::

## Returns

### `EthersProviderAdapter`

An instance of `EthersProviderAdapter`

## Parameters

### `provider: JsonRpcProvider`

The ethers JSON RPC provider to convert
