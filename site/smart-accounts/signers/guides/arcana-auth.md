---
outline: deep
head:
  - - meta
    - property: og:title
      content: Arcana Auth Integration Guide
  - - meta
    - name: description
      content: Follow this integration guide to use Arcana Auth Web3 Wallet Address as a signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this integration guide to use Arcana Auth Web3 Wallet Address as a signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: Arcana Auth Integration Guide
  - - meta
    - name: twitter:description
      content: Follow this integration guide to use Arcana Auth Web3 Wallet Address as a signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# Arcana Auth Integration Guide

[Arcana Auth](https://arcana.network) enables an embedded, self-custodial Web3 wallet powered by asynchronous distributed key generation algorithms that ensure security with privacy. It does not require installing a browser extension. Authenticated users can instantly access the Arcana wallet within the app context and sign blockchain transactions.

Apps using Account Kit can easily onboard users with [social login](https://docs.arcana.network/concepts/social-login) offered by Arcana Auth. It allows devs to easily configure smart accounts for their users.

# Integration

### Install the SDK

::: code-group

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

<<< @/snippets/arcana-auth.ts

### Use it with LightAccount

Let's see it in action with `aa-alchemy` and `LightSmartContractAccount` from `aa-accounts`:

::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { sepolia } from "viem/chains";
import { arcanaAuthSigner } from "./arcana-auth";

const chain = sepolia;

const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY",
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      chain,
      owner: arcanaAuthSigner,
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
    })
);
```

<<< @/snippets/arcana-auth.ts

:::
