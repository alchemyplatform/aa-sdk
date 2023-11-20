---
outline: deep
head:
  - - meta
    - property: og:title
      content: Portal Integration Guide
  - - meta
    - name: description
      content: Follow this integration guide to use Portal as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this integration guide to use Portal as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: Portal Integration Guide
  - - meta
    - name: twitter:description
      content: Follow this integration guide to use Portal as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# Portal Integration Guide

[Portal](https://www.portalhq.io/) is an embedded blockchain infrastructure company that powers companies with an end to end platform for key management for self-custodial wallets (MPC and AA), security firewall, and web3 protocol connect kit.

A combination of Portal and Account Kit allows you to have robust key management and security, while also exploring everything that web3 has to offer with smart accounts for your users.

## Integration

Check out Portal's developer [docs](https://docs.portalhq.io/) to learn more about Portal. If you want to get quick access to their SDKs, please reach out via [this](https://5g2cefp2j92.typeform.com/portal-labs?typeform-source=www.portalhq.io) form.

### Install the Portal SDK

::: code-group

```bash [npm]
npm install --save @portal-hq/web
```

```bash [yarn]
yarn add @portal-hq/web
```

:::

### Create a SmartAccountSigner

Next, setup the Portal SDK and create a `SmartAccountSigner`:

<<< @/snippets/portal.ts

### Use it with Light Account

Let's see it in action with `aa-alchemy` and `LightSmartContractAccount` from `aa-accounts`:
::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { polygonMumbai } from "viem/chains";
import { portalSigner } from "./portalSigner";

const chain = polygonMumbai;
const provider = new AlchemyProvider({
  apiKey: process.env.ALCHEMY_API_KEY,
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      chain,
      owner: portalSigner,
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
    })
);
```

<<< @/snippets/portal.ts

:::
