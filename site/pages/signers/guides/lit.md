---
outline: deep
title: Lit Protocol Integration Guide
description: Follow this integration guide to use PKP Wallet as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Lit Protocol Integration Guide

[LitProtocol](https://litprotocol.com/) is distributed cryptography for signing, encryption, and compute. A generalizable key management network, Lit provides you with a set of tools for managing sovereign identities on the open Web.

Combining Lit Protocol's [pkp wallet](https://www.npmjs.com/package/@lit-protocol/pkp-ethers) with Account Kit allows you to use your Programmable Key Pairs (PKPs) as a smart account for your users.

:::warning

Lit Protocol's pkp network is still in testnet. Backwards compatibility, and data availability will not be guaranteed until mainnet. Do not use PKP wallets to store valuable assets.

:::

# Integration

### Install the pkp ethers package

:::code-group

```bash [npm]
npm i @lit-protocol/pkp-ethers@cayenne
```

```bash [yarn]
yarn add @lit-protocol/pkp-ethers@cayenne
```

:::

### Install the LitNodeClient

:::code-group

```bash [npm]
npm i @lit-protocol/lit-node-client@cayenne
npm i @lit-protocol/crypto@cayenne
npm i @lit-protocol/auth-helpers@cayenne
```

```bash [yarn]
yarn add @lit-protocol/lit-node-client@cayenne
yarn add @lit-protocol/crypto@cayenne
yarn add @lit-protocol/auth-helpers@cayenne
```

:::

### Creating PKP

First we will need a pkp with an `AuthMethod`
See documentation [here](https://developer.litprotocol.com/v3/sdk/wallets/minting) for creating PKPs

### Create A LitSigner

```ts [lit.ts]
// [!include ~/snippets/signers/lit.ts]
```

### Use it with Modular Account

We can link our `SmartAccountSigner` to a Modular Account using `createModularAccountAlchemyClient` from `aa-alchemy`:

:::code-group

```ts [example.ts]
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { createLitSigner } from "./lit";
const chain = sepolia;

const provider = await createModularAccountAlchemyClient({
  apiKey: "ALCHEMY_API_KEY",
  chain,
  signer: await createLitSigner(AUTH_METHOD),
});
```

```ts [lit.ts]
// [!include ~/snippets/signers/lit.ts]
```

:::
