---
outline: deep
head:
  - - meta
    - property: og:title
      content: Lit Protocol Integration Guide
  - - meta
    - name: description
      content: Follow this integration guide to use PKP Wallet as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this integration guide to use PKP Wallet as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: Lit Protocol Integration Guide
  - - meta
    - name: twitter:description
      content: Follow this integration guide to use PKP Wallet as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# Lit Protocol Integration Guide

[LitProtocol](https://litprotocol.com/) is distributed cryptography for signing, encryption, and compute. A generalizable key management network, Lit provides you with a set of tools for managing sovereign identities on the open Web.

Combining Lit Protocol's [pkp wallet](https://www.npmjs.com/package/@lit-protocol/pkp-ethers) with Account Kit allows you to use your Programmable Key Pairs (PKPs) as a smart account for your users.

::: warning

Lit Protocol's pkp network is still in testnet. Backwards compatibility, and data availability will not be guaranteed until mainnet. Do not use PKP wallets to store valuable assets.

:::

# Integration

### Install the pkp ethers package

::: code-group

```bash [npm]
npm i @lit-protocol/pkp-ethers@cayenne
```

```bash [yarn]
yarn add @lit-protocol/pkp-ethers@cayenne
```

:::

### Install the LitNodeClient

::: code-group

```bash [npm]
npm i @lit-protocol/lit-node-client@cayenne
```

```bash [yarn]
yarn add @lit-protocol/lit-node-client@cayenne
```

:::

### Creating PKP

See documentation [here](https://developer.litprotocol.com/v2/pkp/intro) for creating PKPs

### Create a SmartAccountSigner

Next, setup the `LitNodeClient` and `PKPEthersWallet` to create a `SmartAccountSigner`:

<<< @/snippets/lit.ts

### Use it with Light Account

We can link our `SmartAccountSigner` to a `LightSmartContractAccount` from `aa-accounts`:
::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { litSigner } from "./lit";

const chain = sepolia;
const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY",
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      chain,
      owner: litSigner,
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
    })
);
```

<<< @/snippets/lit.ts
:::
