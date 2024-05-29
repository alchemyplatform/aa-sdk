---
outline: deep
title: Portal Integration Guide
description: Follow this integration guide to use Portal as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Portal Integration Guide

[Portal](https://www.portalhq.io/) is an embedded blockchain infrastructure company that powers companies with an end to end platform for key management for self-custodial wallets (MPC and AA), security firewall, and web3 protocol connect kit.

A combination of Portal and Account Kit allows you to have robust key management and security, while also exploring everything that web3 has to offer with smart accounts for your users.

## Integration

Check out Portal's developer [docs](https://docs.portalhq.io/) to learn more about Portal. If you want to get quick access to their SDKs, please reach out via [this](https://form.typeform.com/to/AfPtKjj7?utm_source=AlchemyDocs&utm_medium=xxxxx&utm_campaign=xxxxx) form.

### Install the Portal SDK

Using `PortalSigner` in the `aa-signers` package requires installation of the [`@portal-hq/web`](https://docs.portalhq.io/sdk/web-beta) SDK. `aa-signers` lists it as optional dependency.

:::code-group

```bash [npm]
npm install --save @portal-hq/web
```

```bash [yarn]
yarn add @portal-hq/web
```

:::

### Create a SmartAccountSigner

Next, setup the Portal SDK and create an authenticated `PortalSigner` using the `aa-signers` package:

```ts [portal.ts]
// [!include ~/snippets/signers/portal.ts]
```

### Use it with Modular Account

Let's see it in action with `aa-alchemy`:

:::code-group

```ts [example.ts]
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { createPortalSigner } from "./portal";

const chain = sepolia;

const provider = await createModularAccountAlchemyClient({
  apiKey: "ALCHEMY_API_KEY",
  chain,
  signer: await createPortalSigner(),
});
```

```ts [portal.ts]
// [!include ~/snippets/signers/portal.ts]
```

:::
