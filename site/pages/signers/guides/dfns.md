---
outline: deep
title: Dfns Integration Guide
description: Guide for using Dfns as a Signer
---

# Dfns Integration Guide

[Dfns](https://www.dfns.co) is an MPC/TSS Wallet-as-a-Service API/SDK provider. Dfns aims to optimize the balance of security and UX by deploying key shares into a decentralized network on the backend while enabling wallet access via biometric open standards on the frontend like Webauthn. Reach out [here](https://www.dfns.co/learn-more) to set up a sandbox environment to get started.

Dfns seamlessly integrates with Account Abstraction by signing `UserOperation`s. See the examples below for initializing a DFNS signer and creating a provider with that signer. You can follow [this](/using-smart-accounts/sponsoring-gas/gas-manager) guide to send and sponsor `UserOperation`s with the provider created.

Dfns created a full example of a gas-less transaction via a paymaster [in our SDK](https://github.com/dfns/dfns-sdk-ts/tree/m/examples/libs/viem/alchemy-aa-gasless), adapted from our [gas sponsorship example](/using-smart-accounts/sponsoring-gas/gas-manager).

## Install Dfns SDK

:::code-group

```bash [npm]
npm i @dfns/lib-viem @dfns/sdk @dfns/sdk-keysigner
```

```bash [yarn]
yarn add @dfns/lib-viem @dfns/sdk @dfns/sdk-keysigner
```

:::

### Create a SmartAccountSigner

Setup the Dfns Web3 Provider and wrap it in an `AlchemyProvider`.

```ts [dfns.ts]
// [!include ~/snippets/signers/dfns.ts]
```

### Use it with Light Account

:::code-group

```ts [example.ts]
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { createDfnsSigner } from "./dfns";

// Remember to replace "ALCHEMY_API_KEY" with your own Alchemy API key, get one here: https://dashboard.alchemy.com/
const ALCHEMY_API_KEY = "API_KEY";
const chain = sepolia;

const createAlchemyProvider = async () => {
  return createModularAccountAlchemyClient({
    apiKey: ALCHEMY_API_KEY,
    chain,
    signer: await createDfnsSigner(),
  });
};
```

```ts [dfns.ts]
// [!include ~/snippets/signers/dfns.ts]
```

:::
