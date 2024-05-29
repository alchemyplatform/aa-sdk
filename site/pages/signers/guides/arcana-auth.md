---
outline: deep
title: Arcana Auth Integration Guide
description: Follow this integration guide to use Arcana Auth Web3 Wallet Address as a signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Arcana Auth Integration Guide

[Arcana Auth](https://arcana.network) enables an embedded, self-custodial Web3 wallet powered by asynchronous distributed key generation algorithms that ensure security with privacy. It does not require installing a browser extension. Authenticated users can instantly access the Arcana wallet within the app context and sign blockchain transactions.

Apps using Account Kit can easily onboard users with [social login](https://docs.arcana.network/concepts/social-login) offered by Arcana Auth. It allows devs to easily configure smart accounts for their users.

# Integration

### Install the SDK

:::code-group

```bash [npm]
npm i -s @arcana/auth
```

```bash [yarn]
yarn add @arcana/auth
```

:::

### Register the App

Use [Arcana Developer Dashboard](https://dashboard.arcana.network) to register your app and obtain a unique **clientId**. Use this unique app identifier when creating a `SmartAcccountSigner`.

### Create a SmartAccountSigner

Use the **clientId** assigned to your app via the dashboard and integrate with the Arcana Auth SDK by creating a `SmartAccountSigner`.

```ts [arcana-auth.ts]
// [!include ~/snippets/signers/arcana-auth.ts]
```

### Use it with Modular Account

Let's see it in action with `aa-alchemy`:

:::code-group

```ts [example.ts]
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { createArcanaAuthSigner } from "./arcana-auth";

const chain = sepolia;

export async function getProvider() {
  const signer = await createArcanaAuthSigner();
  return createModularAccountAlchemyClient({
    apiKey: "ALCHEMY_API_KEY",
    chain,
    signer,
  });
}
```

```ts [arcana-auth.ts]
// [!include ~/snippets/signers/arcana-auth.ts]
```

:::
