---
outline: deep
title: Particle Network
description: Guide to use Particle Network as a Signer
---

# Particle Network

[**Particle Network**](https://particle.network/) is the Intent-Centric, Modular Access Layer of Web3. With Particle's [Smart Wallet-as-a-Service](https://blog.particle.network/announcing-our-smart-wallet-as-a-service-modular-stack-upgrading-waas-with-erc-4337), developers can curate unparalleled user experience through modular and customizable embedded wallet components. By utilizing MPC-TSS for key management, Particle can streamline onboarding via familiar Web2 accounts—such as Google accounts, email addresses, phone numbers, etc.

Leveraging both Particle and Account Kit enables a streamlined onboarding flow, with social logins and Signer key management being handled by Particle while Account Kit takes this experience to the next level with account abstraction - facilitating powerful user experience.

## Integration

### Sign up for a Particle Account

To configure Particle, you'll need to start by quickly signing up for a Particle account, creating a project, and then creating an application. You can learn more about this process within their [quickstart guide](https://developers.particle.network/docs/web-desktop-quickstart). Additionally, you can sign up through the [Particle dashboard](https://dashboard.particle.network/#/login).

### Install the SDK

`ParticleSigner` requires installation of the [`@particle-network/auth`](https://developers.particle.network/docs/building-with-particle-auth) and [`@particle-network/provider`](https://developers.particle.network/reference/auth-web). `aa-signers` lists them as optional dependencies.

:::code-group

```bash [npm]
npm i -s @particle-network/auth
npm i -s @particle-network/provider
```

```bash [yarn]
yarn add @particle-network/auth
yarn add @particle-network/provider
```

:::

### Create a SmartAccountSigner

With `@particle-network/auth` and `@particle-network/provider` installed, you can move on to creating a `SmartAccountSigner`. To do this, you will need to ensure you have your `projectId`, `clientKey`, and `appId` from the Particle dashboard to use in the configuration of `ParticleNetwork`.

From here, setting up a `SmartAccountSigner` involves the initialization of `ParticleProvider` to be used in a viem wallet client, which then gets passed into our `SmartAccountSigner`.

```ts [particle.ts]
// [!include ~/snippets/signers/particle.ts]
```

### Use it with Light Account

Next, setup the Particle SDK and create an authenticated `ParticleSigner` using the `aa-signers` package:

:::code-group

```ts [example.ts]
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { createParticleSigner } from "./particle";

const chain = polygonMumbai;
const provider = await createModularAccountAlchemyClient({
  apiKey: process.env.ALCHEMY_API_KEY,
  chain,
  signer: await createParticleSigner(),
});
```

```ts [particle.ts]
// [!include ~/snippets/signers/particle.ts]
```

:::

### Video tutorial

Particle Network has also produced a comprehensive step-by-step video tutorial detailing the above process (the utilization of Particle as a signer within Account Kit). This video can be found [here](https://twitter.com/TABASCOweb3/status/1715034613184147721), and the associated written walkthrough can be found [here](https://developers.particle.network/docs/aa-signers-with-particle-network).
