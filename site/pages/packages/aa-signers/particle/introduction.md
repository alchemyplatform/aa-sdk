---
title: ParticleSigner
description: Overview of the ParticleSigner class in aa-signers
---

# Particle Signer

`ParticleSigner` is a signer implementation which extends `SmartAccountAuthenticator` to leverage the [Particle SDK](https://www.npmjs.com/package/@particle-network/auth). It supports features such as authentication, message and typed data signing, and authentication details retrieval.

`ParticleSigner` provides implementations for all methods on `SmartAccountAuthenticator`:

1.  [`authenticate`](/packages/aa-signers/particle/authenticate) -- supports user authentication.
2.  [`getAddress`](/packages/aa-signers/particle/getAddress) -- gets the address of the smart contract account's connected EOA signer account.
3.  [`signMessage`](/packages/aa-signers/particle/signMessage) -- supports message signatures.
4.  [`signTypedData`](/packages/aa-signers/particle/signTypedData) -- supports typed data signatures.
5.  [`getAuthDetails`](/packages/aa-signers/particle/getAuthDetails) -- supports authentication details retrieval.

## Install Dependencies

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

## Usage

:::code-group

```ts [example.ts]
import { createParticleSigner } from "./particle";

const particleSigner = await createParticleSigner();

const address = await particleSigner.getAddress();

const details = await particleSigner.getAuthDetails();

const signedMessage = await particleSigner.signMessage("test");

const typedData = {
  types: {
    Request: [{ name: "hello", type: "string" }],
  },
  primaryType: "Request",
  message: {
    hello: "world",
  },
};
const signTypedData = await particleSigner.signTypedData(typedData);
```

```ts [particle.ts]
// [!include ~/snippets/signers/particle.ts]
```

:::

## Developer Links

- [Particle SDK](https://www.npmjs.com/package/@particle-network/auth)
- [ParticleSigner Tests](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/signers/src/particle/__tests__/signer.test.ts)
- [Account Kit Tutorial](https://developers.particle.network/docs/aa-signers-with-particle-network)
