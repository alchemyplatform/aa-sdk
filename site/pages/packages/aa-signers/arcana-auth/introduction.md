---
title: ArcanaAuthSigner
description: Overview of the ArcanaAuthSigner class in aa-signers
---

# Arcana Auth Signer

`ArcanaAuthSigner` is a signer implementation that extends `SmartAccountAuthenticator` to leverage the [Arcana Auth SDK](https://docs.arcana.network). It supports features such as authentication, message and typed data signing, and authentication details retrieval.

`ArcanaAuthSigner` provides implementations for all methods on `SmartAccountAuthenticator`:

1.  [`authenticate`](/packages/aa-signers/arcana-auth/authenticate) -- supports user authentication.
2.  [`getAddress`](/packages/aa-signers/arcana-auth/getAddress) -- gets the address of the smart contract account's connected signer.
3.  [`signMessage`](/packages/aa-signers/arcana-auth/signMessage) -- supports message signatures.
4.  [`signTypedData`](/packages/aa-signers/arcana-auth/signTypedData) -- supports typed data signatures.
5.  [`getAuthDetails`](/packages/aa-signers/arcana-auth/getAuthDetails) -- supports authentication details retrieval.

## Install Dependencies

`ArcanaAuthSigner` requires the installation of the [`Arcana Auth`](https://www.npmjs.com/package/@arcana/auth) SDK. `aa-signers` lists it as an optional dependency.

:::code-group

```bash [npm]
npm i -s @arcana/auth
```

```bash [yarn]
yarn add @arcana/auth
```

## Usage

:::code-group

```ts [example.ts]
import { ArcanaAuthSigner } from "@alchemy/aa-signers/arcana-auth";

const newArcanaAuthSigner = new ArcanaAuthSigner({
  clientId: "ARCANA_AUTH_CLIENT_ID",
});
// or by using inner

import { AuthProvider } from "@arcana/auth";

const authParams = {
  theme: "light",
  network: "testnet",
  position: "left",
};

const inner = new AuthProvider("ARCANA_AUTH_CLIENT_ID", authParams);
const newArcanaAuthSigner2 = new ArcanaAuthSigner({ inner });

const getUserInfo = await newArcanaAuthSigner.authenticate();

const address = await newArcanaAuthSigner.getAddress();

const details = await newArcanaAuthSigner.getAuthDetails();

const signedMessage = await newArcanaAuthSigner.signMessage("test");

const typedData = {
  types: {
    Request: [{ name: "hello", type: "string" }],
  },
  primaryType: "Request",
  message: {
    hello: "world",
  },
};
const signTypedData = await newArcanaAuthSigner.signTypedData(typedData);
```

```ts [arcana-auth.ts]
// [!include ~/snippets/signers/arcana-auth.ts]
```

:::

## Developer Links

- [authParams](https://authsdk-ref-guide.netlify.app/interfaces/constructorparams)
- [Arcana Auth SDK Reference Guide](https://authsdk-ref-guide.netlify.app/)
- [Arcana Auth Documentation](https://docs.arcana.network)
- [GitHub: Arcana Auth](https://github.com/arcana-network/auth)
