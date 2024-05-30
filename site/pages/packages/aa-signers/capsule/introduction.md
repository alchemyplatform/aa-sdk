---
title: CapsuleSigner
description: Overview of the CapsuleSigner class in aa-signers
---

# Capsule Signer

`CapsuleSigner` is a signer implementation which extends `SmartAccountAuthenticator` to leverage the [Capsule SDK](https://docs.usecapsule.com/getting-started/initial-setup). It supports features such as authentication, message and typed data signing, and authentication details retrieval.

`CapsuleSigner` provides implementations for all methods on `SmartAccountAuthenticator`:

1.  [`authenticate`](/packages/aa-signers/capsule/authenticate) -- supports user authentication.
2.  [`getAddress`](/packages/aa-signers/capsule/getAddress) -- gets the address of the smart contract account's connected EOA signer account.
3.  [`signMessage`](/packages/aa-signers/capsule/signMessage) -- supports message signatures.
4.  [`signTypedData`](/packages/aa-signers/capsule/signTypedData) -- supports typed data signatures.
5.  [`getAuthDetails`](/packages/aa-signers/capsule/getAuthDetails) -- supports authentication details retrieval.

## Install Dependencies

`CapsuleSigner` requires installation of the [`@usecapsule/web-sdk`](https://capsule-org.github.io/web-sdk/) SDK. `aa-signers` lists it as an optional dependency.

:::code-group

```bash [npm]
npm i -s @usecapsule/web-sdk
```

```bash [yarn]
yarn add @usecapsule/web-sdk
```

## Usage

:::code-group

```ts [example.ts]
import { createCapsuleSigner } from "./capsule";

const capsuleSigner = await createCapsuleSigner();

const address = await capsuleSigner.getAddress();

const details = await capsuleSigner.getAuthDetails();

const signedMessage = await capsuleSigner.signMessage("test");

const typedData = {
  types: {
    Request: [{ name: "hello", type: "string" }],
  },
  primaryType: "Request",
  message: {
    hello: "world",
  },
};
const signTypedData = await capsuleSigner.signTypedData(typedData);
```

```ts [capsule.ts]
// [!include ~/snippets/signers/capsule.ts]
```

:::

## Developer Links

- [Capsule SDK](https://capsule-org.github.io/web-sdk/)
- [CapsuleSigner Tests](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/signers/src/capsule/__tests__/signer.test.ts)
