---
title: FireblocksSigner
description: Overview of the FireblocksSigner class in aa-signers
---

# Fireblocks Signer

`FireblocksSigner` is a signer implementation which extends `SmartAccountAuthenticator` to leverage the [Fireblocks SDK](https://github.com/fireblocks/fireblocks-web3-provider). It supports features such as authentication, message and typed data signing, and authentication details retrieval.

`FireblocksSigner` provides implementations for all methods on `SmartAccountAuthenticator`:

1.  [`authenticate`](/packages/aa-signers/fireblocks/authenticate) -- supports user authentication.
2.  [`getAddress`](/packages/aa-signers/fireblocks/getAddress) -- gets the address of the smart contract account's connected EOA signer account.
3.  [`signMessage`](/packages/aa-signers/fireblocks/signMessage) -- supports message signatures.
4.  [`signTypedData`](/packages/aa-signers/fireblocks/signTypedData) -- supports typed data signatures.
5.  [`getAuthDetails`](/packages/aa-signers/fireblocks/getAuthDetails) -- supports authentication details retrieval.

## Install Dependencies

`FireblocksSigner` requires installation of the [`@fireblocks/fireblocks-web3-provider`](https://github.com/fireblocks/fireblocks-web3-provider) SDK. `aa-signers` lists it as an optional dependency.

:::code-group

```bash [npm]
npm i -s @fireblocks/fireblocks-web3-provider
```

```bash [yarn]
yarn add @fireblocks/fireblocks-web3-provider
```

## Usage

:::code-group

```ts [example.ts]
import { createFireblocksSigner } from "./fireblocks";

const fireblocksSigner = await createFireblocksSigner();

const address = await fireblocksSigner.getAddress();

const details = await fireblocksSigner.getAuthDetails();

const signedMessage = await fireblocksSigner.signMessage("test");

const typedData = {
  types: {
    Request: [{ name: "hello", type: "string" }],
  },
  primaryType: "Request",
  message: {
    hello: "world",
  },
};
const signTypedData = await fireblocksSigner.signTypedData(typedData);
```

```ts [fireblocks.ts]
// [!include ~/snippets/signers/fireblocks.ts]
```

:::

## Developer Links

- [Fireblocks SDK](https://github.com/fireblocks/fireblocks-web3-provider)
- [FireblocksSigner Tests](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/signers/src/fireblocks/__tests__/signer.test.ts)
