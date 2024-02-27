---
outline: deep
head:
  - - meta
    - property: og:title
      content: Capsule Integration Guide
  - - meta
    - name: description
      content: Follow this integration guide to use Capsule as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - property: og:description
      content: Follow this integration guide to use Capsule as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - name: twitter:title
      content: Capsule Integration Guide
  - - meta
    - name: twitter:description
      content: Follow this integration guide to use Capsule as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Capsule Integration Guide

[Capsule](https://usecapsule.com/) is a signing solution that you can use to create secure, embedded [MPC wallets](https://www.alchemy.com/overviews/mpc-wallet/?a=ak-docs) with just an email or a social login. Capsule-enabled wallets are portable across applications, recoverable, and programmable, so your users do not need to create different signers or contract accounts for every application they use.

Combining Capsule with Account Kit allows you to get the best of both on and off-chain programmability. You can use Capsule as a Signer to create a wallet that works across apps, and then connect it to Account Kit to create expressive smart accounts for your users!

## Integration

Follow these steps to begin integrating Capsule:

1. Obtain access to the Capsule SDK and an API key by completing [this form](https://form.typeform.com/to/hLaJeYJW).
2. For further assistance or if you wish to add more permissions or automation, consult the [complete Capsule developer documentation](https://docs.usecapsule.com) or contact hello@usecapsule.com.

### Install the SDK

Using `CapsuleSigner` in the `aa-signers` package requires installation of the [`@usecapsule/web-sdk`](https://capsule-org.github.io/web-sdk/) SDK. `aa-signers` lists it as optional dependency.

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

::: warning Note
To use `CapsuleSigner` in your app's client, you must ensure the `window` object is defined.
:::

### Create a SmartAccountSigner

Next, setup the Capsule SDK and create an authenticated `CapsuleSigner` using the `aa-signers` package:

<<< @/snippets/signers/capsule.ts

### Use it with Modular Account

Let's see it in action with `aa-alchemy`:

::: code-group

```ts [alchemy.ts]
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { createCapsuleSigner } from "./capsule";

const chain = sepolia;

const provider = await createModularAccountAlchemyClient({
  apiKey: "ALCHEMY_API_KEY",
  chain,
  signer: await createCapsuleSigner(),
});
```

<<< @/snippets/signers/capsule.ts

:::
