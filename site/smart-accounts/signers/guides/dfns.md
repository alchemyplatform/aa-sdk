---
outline: deep
head:
  - - meta
    - property: og:title
      content: Dfns
  - - meta
    - name: description
      content: Guide for using Dfns as a Signer
  - - meta
    - property: og:description
      content: Guide for using Dfns as a Signer
---

# Dfns Integration Guide

[Dfns](https://www.dfns.co) is an MPC/TSS Wallet-as-a-Service API/SDK provider. Dfns aims to optimize the balance of security and UX by deploying key shares into a decentralized network on the backend while enabling wallet access via biometric open standards on the frontend like Webauthn. Reach out [here](https://www.dfns.co/learn-more) to set up a sandbox environment to get started.

Dfns seamlessly integrates with Account Abstraction by signing `UserOperation`s. See the examples below for initializing a DFNS signer and creating a provider with that signer. You can follow [this](http://localhost:5173/tutorials/send-user-operation.html) guide to send `UserOperation`s with the provider created.

We've created a full example of a gas-less transaction via a paymaster [in our SDK](https://github.com/dfnsext/typescript-sdk/blob/m/examples/viem/alchemy-aa-gasless/README.md), adapted from Alchemy's [gas sponsorship example](https://accountkit.alchemy.com/guides/sponsoring-gas.html).

## Install Dfns SDK

::: code-group

```bash [npm]
npm i @dfns/lib-viem @dfns/sdk @dfns/sdk-keysigner
```

```bash [yarn]
yarn add @dfns/lib-viem @dfns/sdk @dfns/sdk-keysigner
```

:::

### Create a SmartAccountSigner

Setup the Dfns Web3 Provider and wrap it in an AlchemyProvider.

<<< @/snippets/dfns.ts

### Use it with Light Account

::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { encodeFunctionData, parseAbi } from "viem";
import { sepolia } from "viem/chains";
import { createDfnsSigner } from "./dfns";

// Remember to replace "ALCHEMY_API_KEY" with your own Alchemy API key, get one here: https://dashboard.alchemy.com/
const ALCHEMY_API_KEY = null;
const chain = sepolia;

const createDfnsAlchemyProvider = async (): Promise<AlchemyProvider> => {
  return new AlchemyProvider({
    apiKey: ALCHEMY_API_KEY,
    chain,
  }).connect(
    (rpcClient) =>
      new LightSmartContractAccount({
        chain,
        owner: await createDfnsSigner(),
        factoryAddress: getDefaultLightAccountFactoryAddress(chain),
        rpcClient,
      })
  );
};
```

<<< @/snippets/dfns.ts

:::
