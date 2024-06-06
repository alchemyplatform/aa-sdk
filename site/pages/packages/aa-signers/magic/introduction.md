---
title: MagicSigner
description: Overview of the MagicSigner class in aa-signers
---

# Magic Signer

`MagicSigner` is a signer implementation which extends `SmartAccountAuthenticator` to leverage the [Magic web SDK](https://magic.link/docs/api/client-side-sdks/web). It supports features such as authentication, message and typed data signing, and authentication details retrieval.

`MagicSigner` provides implementations for all methods on `SmartAccountAuthenticator`:

1.  [`authenticate`](/packages/aa-signers/magic/authenticate) -- supports user authentication.
2.  [`getAddress`](/packages/aa-signers/magic/getAddress) -- gets the address of the smart contract account's connected EOA signer account.
3.  [`signMessage`](/packages/aa-signers/magic/signMessage) -- supports message signatures.
4.  [`signTypedData`](/packages/aa-signers/magic/signTypedData) -- supports typed data signatures.
5.  [`getAuthDetails`](/packages/aa-signers/magic/getAuthDetails) -- supports authentication details retrieval.

## Install dependencies

`MagicSigner` requires installation of the [`magic-sdk`](https://github.com/magiclabs/magic-js) SDK. `aa-signers` lists it as an optional dependency.

:::code-group

```bash [npm]
npm i -s magic-sdk
```

```bash [yarn]
yarn add magic-sdk
```

## Usage

:::code-group

```ts [example.ts]
import { createMagicSigner } from "./magic";

const magicSigner = new MagicSigner({ apiKey: "MAGIC_API_KEY" });

const authParams = {
  authenticate: async () => {
    await magicSigner.inner.wallet.connectWithUI();
  },
};
await magicSigner.authenticate(authParams);

const address = await magicSigner.getAddress();

const details = await magicSigner.getAuthDetails();

const signedMessage = await magicSigner.signMessage("test");

const typedData = {
  types: {
    Request: [{ name: "hello", type: "string" }],
  },
  primaryType: "Request",
  message: {
    hello: "world",
  },
};
const signTypedData = await signer.signTypedData(typedData);
```

```ts [magic.ts]
// [!include ~/snippets/signers/magic.ts]
```

:::

## Developer links

- [Magic web SDK](https://magic.link/docs/api/client-side-sdks/web)
- [MagicSigner Tests](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/signers/src/magic/__tests__/signer.test.ts)
