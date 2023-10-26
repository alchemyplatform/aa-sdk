---
outline: deep
head:
  - - meta
    - property: og:title
      content: Magic Link Integration Guide
  - - meta
    - name: description
      content: Follow this integration guide to use Magic.Link as a signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this integration guide to use Magic.Link as a signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: Magic Link Integration Guide
  - - meta
    - name: twitter:description
      content: Follow this integration guide to use Magic.Link as a signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# Magic Link Integration Guide

[Magic](https://magic.link) is an embedded wallet provider that allows users to generate wallets scoped to your application via Social Logins, Email OTP, or Webauthn. This is great for enabling a better experience for your users. But ultimately these wallets are not much different from EOA's, so you don't have the benefit of Account Abstraction (gas sponsorship, batching, etc).

Combining Magic with Account Kit allows you to get the best of both worlds. You can use Magic to generate a wallet scoped to your application, and then use Account Kit to create Smart Contract Accounts for your users!

## Integration

### Install the SDK

::: code-group

```bash [npm]
npm i -s magic-sdk
```

```bash [yarn]
yarn add magic-sdk
```

:::

### Create a SmartAccountSigner

Next, setup the magic sdk and create a `SmartAccountSigner`:

<<< @/snippets/magic.ts

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
import { magicSigner } from "./magic";

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
      owner: magicSigner,
      factoryAddress: getDefaultLightAccountFactory(chain),
      rpcClient,
    })
);
```

<<< @/snippets/magic.ts

:::
