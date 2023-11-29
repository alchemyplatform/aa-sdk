---
outline: deep
head:
  - - meta
    - property: og:title
      content: Web3Auth Integration Guide
  - - meta
    - name: description
      content: Follow this integration guide to use an EOA as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this integration guide to use an EOA as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: Web3Auth Integration Guide
  - - meta
    - name: twitter:description
      content: Follow this integration guide to use an EOA as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# Web3Auth Integration Guide

[Web3Auth](https://web3auth.io/) is an embedded wallet provider that allows users to generate wallets scoped to your application via Social Logins, Email OTP, or Custom Authentication Methods. This is great for enabling a better experience for your users. But ultimately these wallets are not much different from EOA's, so you don't have the benefit of Account Abstraction (gas sponsorship, batching, etc).

Combining Web3Auth with Account Kit allows you to get the best of both worlds. You can use Web3Auth via the [`aa-signers`](/packages/aa-signers/index) package to generate a wallet scoped to your application, and then use [`aa-alchemy`](/packages/aa-alchemy/index) to create smart accounts for your users!

# Integration

### Install the SDK

`Web3AuthSigner` requires installation of the [`@web3auth/modal`](https://github.com/Web3Auth/web3auth-web/tree/master/packages/modal) and [`@web3auth/base`](https://github.com/Web3Auth/web3auth-web/tree/master/packages/base) SDKs. They are listed as optional dependencies on `aa-signers`. `aa-signers` lists them as optional dependencies.

::: code-group

```bash [npm]
npm i -s @web3auth/modal
npm i -s @web3auth/base
```

```bash [yarn]
yarn add @web3auth/modal
yarn add @web3auth/base
```

:::

### Create a SmartAccountSigner

Next, setup the web3auth sdk and create a `SmartAccountSigner` using the `aa-signers` package:

<<< @/snippets/web3auth.ts

### Use it with Light Account

Let's see it in action with `aa-alchemy` and `LightSmartContractAccount` from `aa-accounts`:
::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { sepolia } from "viem/chains";
import { createWeb3AuthSigner } from "./web3auth";

const chain = sepolia;

const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY",
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      chain,
      owner: await createWeb3AuthSigner(),
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
      rpcClient,
    })
);
```

<<< @/snippets/web3auth.ts

:::
