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

`connect` is a method on `AccountSigner` that you can call to connect an `EthersProviderAdapter` to this Signer. This lets the returned `AccountSigner` leverage the provider when signing messages, sending user operations and transactions for the smart account using the signer.

## Usage

:::code-group

```ts [example.ts]
import { accountSigner } from "./ethers-signer";

// changing the ethers provider for the account signer
const alchemy = new Alchemy({
  apiKey: process.env.API_KEY!,
  network: Network.SEPOLIA, // new chain -> new provider
});
const ethersProvider = await alchemy.config.getProvider();
const newProvider = EthersProviderAdapter.fromEthersProvider(ethersProvider);

// connecting the account signer to ethers
const newAccountSigner = accountSigner.connect(newProvider);
```

```ts [ethers-signer.ts]
// [!include ~/snippets/aa-ethers/ethers-signer.ts]
```

:::

## Returns

### `AccountSigner`

A new instance of a connected `AccountSigner`

## Parameters

### `provider: EthersProviderAdapter`

the `EthersProviderAdapter` to connect with this `AccountSigner`
