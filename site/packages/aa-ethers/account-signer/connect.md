---
outline: deep
head:
  - - meta
    - property: og:title
      content: AccountSigner • connect
  - - meta
    - name: description
      content: Overview of the connect method on AccountSigner in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the connect method on AccountSigner in aa-ethers
next:
  text: Utils
---

# connect

`connect` is a method on `AccountSigner` that you can call to connect an `EthersProviderAdapter` to this Signer. This lets the returned `AccountSigner` leverage the provider when signing messages, UserOperations, and transactions for a smart account using the owner account.

## Usage

::: code-group

```ts [example.ts]
import { signer } from "./ethers-signer";

// changing the provider for the signer
const alchemy = new Alchemy({
  apiKey: process.env.API_KEY!,
  network: Network.SEPOLIA, // new chain -> new provider
});
const ethersProvider = await alchemy.config.getProvider();
const newProvider = EthersProviderAdapter.fromEthersProvider(ethersProvider);

// connecting the signer
const newSigner = signer.connect(newProvider);
```

<<< @/snippets/ethers-signer.ts
:::

## Returns

### `AccountSigner`

A new instance of a connected `AccountSigner`

## Parameters

### `provider: EthersProviderAdapter`

the `EthersProviderAdapter` to connect with this `AccountSigner`
