---
outline: deep
title: Passport Protcol Integration Guide
description: Follow this integration guide to use Passport Protcol as a Signer with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Passport Integration Guide

[Passport](https://0xpass.io) is an MPC-based programmable, distributed, and non-custodial key management system, that allows users to generate wallets, scoped to their application, either via user Passkeys or any developer defined authentication method. Passport also allows users to sign messages, transactions, encrypt data, and more. Using secure multi-party computation (MPC) algorithms Passport splits private keys into shares that are solely distributed among nodes in the network. It also leverages secure enclaves and developer-defined policies, to ensure that the decryption of keys is confined to an enclave and that the signing process adheres to the policy framework established by your application.

Combining Passport with Account Kit allows you to create a seamless user experience for your users, with the security of Passport's MPC-based key management system and the flexibility of Account Abstraction. You can use Passport through the [`aa-signers`](/packages/aa-signers/passport/introduction) package to generate integrated wallets at scale, and then leverage [`aa-alchemy`](/packages/aa-alchemy/) to create smart accounts for your users.

## Integration

### Getting Started

You can get started on Passport by configuring your scope and authentication rules, you can find detailed instructions on this, by following the [Passport Documentation](https://docs.0xpass.io/guides-and-examples/getting-started).

### Install the SDK

Using `PassportSigner` in the `aa-signers` package requires installation of the [`@0xpass/passport`](https://github.com/0xpass/passport-sdk/tree/main/packages/passport) and [`@0xpass/webauthn-signer`](https://github.com/0xpass/passport-sdk/tree/main/packages/webauthn-signer).

:::code-group

```bash [npm]
npm i @0xpass/passport
npm i @0xpass/webauthn-signer
```

```bash [yarn]
yarn add @0xpass/passport
yarn add @0xpass/webauthn-signer
```

:::

### Create a PassportSigner

Next, setup the Passport SDK and create an authenticated `PassportSigner` using the `aa-signers` package to use an authenticated Passport Signer, you need to register a user account, which is attached to your application scope, following that you can authenticate the user, and and begin combining with Alchemy's Account Kit.

```ts [passport.ts]
// [!include ~/snippets/signers/passport.ts]
```

### Use it with Light Account

Let's see it in action with `aa-alchemy` and `ModularAccount` from `aa-accounts`:
:::code-group

```ts [example.ts]
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { createPassportSigner } from "./passport";

const chain = sepolia;

await passport.register({ username: "test", userDisplayName: "test" });

const provider = await createModularAccountAlchemyClient({
  apiKey: "ALCHEMY_API_KEY",
  chain,
  signer: await createPassportSigner(),
});
```

```ts [passport.ts]
// [!include ~/snippets/signers/passport.ts]
```

:::
