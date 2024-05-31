---
outline: deep
title: Magic Link Integration Guide
description: Follow this integration guide to use Magic.Link as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Magic Link Integration Guide

[Magic](https://magic.link) is an embedded wallet provider that allows users to generate wallets scoped to your application via Social Logins, Email OTP, or Webauthn. This is great for enabling a better experience for your users. But ultimately these wallets are not much different from EOA's, so you don't have the benefit of Account Abstraction (gas sponsorship, batching, etc).

Combining Magic with Account Kit allows you to get the best of both worlds. You can use Magic via the [`aa-signers`](/packages/aa-signers/magic/introduction) package to generate a wallet scoped to your application, and then use [`aa-alchemy`](/packages/aa-alchemy/) to create smart accounts for your users!

## Integration

### Install the SDK

Using `MagicSigner` in the `aa-signers` package requires installation of the [`magic-sdk`](https://github.com/magiclabs/magic-js) SDK. `aa-signers` lists it as optional dependency.

:::code-group

```bash [npm]
npm i -s magic-sdk
```

```bash [yarn]
yarn add magic-sdk
```

:::warning Note
To use `MagicSigner` in your app's client, you must ensure the `window` object is defined.
:::

### Create a MagicSigner

Next, setup the magic sdk and create an authenticated `MagicSigner` using the `aa-signers` package:

```ts [magic.ts]
// [!include ~/snippets/signers/magic.ts]
```

### Use it with Modular Account

Let's see it in action with `aa-alchemy`:

:::code-group

```ts [example.ts]
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { createMagicSigner } from "./magic";

const chain = sepolia;

// NOTE: the below is async because it depends on creating a magic Signer. You can choose to break that up how you want
// e.g. use a useEffect + useState to create the Signer and then pass it down to the provider
const provider = await createModularAccountAlchemyClient({
  apiKey: "ALCHEMY_API_KEY",
  chain,
  signer: await createMagicSigner(),
});
```

```ts [lit.ts]
// [!include ~/snippets/signers/lit.ts]
```

:::
