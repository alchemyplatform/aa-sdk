---
outline: deep
head:
  - - meta
    - property: og:title
      content: Web3Auth
  - - meta
    - name: description
      content: Guide to use Web3Auth as a signer
  - - meta
    - property: og:description
      content: Guide to use Web3Auth as a signer
---

# Web3Auth

[Web3Auth](https://web3auth.io/) is an embedded wallet provider that allows users to generate wallets scoped to your application via Social Logins, Email OTP, or Custom Authentication Methods. This is great for enabling a better experience for your users. But ultimately these wallets are not much different from EOA's, so you don't have the benefit of Account Abstraction (gas sponsorship, batching, etc).

Combining Web3Auth with Account Kit allows you to get the best of both worlds. You can use Web3Auth to generate a wallet scoped to your application, and then use Account Kit to create Smart Contract Accounts for your users!

# Integrataion

### Install the SDK

::: code-group

```bash [npm]
npm i -s @web3auth/modal
```

```bash [yarn]
yarn add @web3auth/modal
```

:::

### Create a SmartAccountSigner

Next, setup the web3auth sdk and create a `SmartAccountSigner`

<<< @/snippets/web3auth.ts

### Use it with LightAccount

Let's see it in action with `aa-alchemy` and `LightSmartContractAccount` from `aa-accounts`:
::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactory,
} from "@alchemy/aa-accounts";
import { sepolia } from "viem/chains";
import { web3authSigner } from "./web3auth";

const chain = sepolia;
const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY",
  chain,
  entryPointAddress: "0x...",
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: "0x...",
      chain: rpcClient.chain,
      owner: web3authSigner,
      factoryAddress: getDefaultLightAccountFactory(chain),
      rpcClient,
    })
);
```

<<< @/snippets/web3auth.ts

:::
