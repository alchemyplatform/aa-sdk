---
outline: deep
head:
  - - meta
    - property: og:title
      content: Capsule
  - - meta
    - name: description
      content: Guide to use Capsule as a signer
  - - meta
    - property: og:description
      content: Guide to use Capsule as a signer
---

# Capsule

[Capsule](https://usecapsule.com/) is a signing solution that you can use to create secure, embedded [MPC wallets](https://www.alchemy.com/overviews/mpc-wallet) with just an email or a social login. Capsule-enabled wallets are portable across applications, recoverable, and programmable, so your users do not need to create different signers or contract accounts for every application they use.

Combining Capsule with Account Kit allows you to get the best of both on and off-chain programmability. You can use Capsule as a signer to create a wallet that works across apps, and then connect it to Account Kit to create expressive smart accounts for your users!

## Integration

Follow these steps to begin integrating Capsule:

1. Obtain access to the Capsule SDK and an API key by completing [this form](https://form.typeform.com/to/hLaJeYJW).
2. For further assistance or if you wish to add more permissions or automation, consult the [complete Capsule developer documentation](https://docs.usecapsule.com) or contact hello@usecapsule.com.

### Install the SDK

Web
::: code-group

```bash [npm]
npm i -s @usecapsule/web-sdk
```

```bash [yarn]
yarn add @usecapsule/web-sdk
```

:::

React Native
::: code-group

```bash [npm]
npm i -s @usecapsule/react-native-sdk
```

```bash [yarn]
yarn add @usecapsule/react-native-sdk
```

:::

### Create a SmartAccountSigner

Next, setup the Capsule SDK and create a `SmartAccountSigner`

<<< @/snippets/capsule.ts

### Use it with LightAccount

Let's see it in action with `aa-alchemy` and `LightSmartContractAccount` from `aa-accounts`:
::: code-group

```ts [alchemy.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactory,
} from "@alchemy/aa-accounts";
import { sepolia } from "viem/chains";
import { capsuleSigner } from "./capsule";

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
      owner: capsuleSigner,
      factoryAddress: getDefaultLightAccountFactory(chain),
      rpcClient,
    })
);
```

<<< @/snippets/capsule.ts

:::
