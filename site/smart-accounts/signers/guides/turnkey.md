---
outline: deep
head:
  - - meta
    - property: og:title
      content: Turnkey Integration Guide
  - - meta
    - name: description
      content: Follow this integration guide to use Turnkey as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this integration guide to use Turnkey as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: Turnkey Integration Guide
  - - meta
    - name: twitter:description
      content: Follow this integration guide to use Turnkey as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# Turnkey Integration Guide

[Turnkey](https://turnkey.com) provides simple APIs to securely manage your private keys. With Turnkey, users are able to spin up thousands of wallets and sign millions of transactions, all without compromising on security.

## Integration

### Sign up for a Turnkey Account

Signing up for a Turnkey Account is quick and easy. You can follow our [quickstart guide](https://docs.turnkey.com/getting-started/quickstart) to create a your first organization, API key and private key in minutes.

### Install the SDK

::: code-group

```bash [npm]
npm i -s @turnkey/api-key-stamper
npm i -s @turnkey/http
npm i -s @turnkey/viem
```

```bash [yarn]
yarn add @turnkey/api-key-stamper
yarn add @turnkey/http
yarn add @turnkey/viem
```

:::

### Create a SmartAccountSigner

Next, setup the Turnkey sdk and create a `SmartAccountSigner`:

<<< @/snippets/turnkey.ts

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
import { newTurnkeySigner } from "./turnkey";

async function main() {
  const owner = await newTurnkeySigner();
  const chain = sepolia;

  const provider = new AlchemyProvider({
    apiKey: "ALCHEMY_API_KEY",
    chain,
  }).connect(
    (rpcClient) =>
      new LightSmartContractAccount({
        chain,
        owner,
        factoryAddress: getDefaultLightAccountFactoryAddress(chain),
        rpcClient,
      })
  );
}
```

<<< @/snippets/turnkey.ts

:::
