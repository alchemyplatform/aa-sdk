---
title: PassportSigner
description: Overview of the PassportSigner class in aa-signers
---

# Passport Signer

`PassportSigner` is a signer implementation which extends `SmartAccountAuthenticator` to leverage the [Passport SDK](https://github.com/0xpass/passport-sdk). It supports features such as authentication, message and typed data signing, and authentication details retrieval.

`PassportSigner` provides implementations for all methods on `SmartAccountAuthenticator`:

1.  [`authenticate`](/packages/aa-signers/passport/authenticate) -- supports user authentication.
2.  [`getAddress`](/packages/aa-signers/passport/getAddress) -- gets the address of the the smart contract account's connected EOA signer account.
3.  [`signMessage`](/packages/aa-signers/passport/signMessage) -- supports message signatures.
4.  [`signTypedData`](/packages/aa-signers/passport/signTypedData) -- supports typed data signatures.
5.  [`getAuthDetails`](/packages/aa-signers/passport/getAuthDetails) -- supports authentication details retrieval.

## Install Dependencies

`PassportSigner` requires installation of the package requires installation of the [`@0xpass/passport`](https://github.com/0xpass/passport-sdk/tree/main/packages/passport) and [`@0xpass/webauthn-signer`](https://github.com/0xpass/passport-sdk/tree/main/packages/webauthn-signer). If you'd like to use your own authentication method, you can use the [`@0xpass/key-signer`](https://github.com/0xpass/passport-sdk/tree/main/packages/key-signer) package.

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

Alternatively if you'd like to use your own authentication methods you can install the key signer package.

:::code-group

```bash [npm]
npm i @0xpass/passport
npm i @0xpass/key-signer
```

```bash [yarn]
yarn add @0xpass/passport
yarn add @0xpass/key-signer
```

:::

## Usage

:::code-group

```ts [example.ts]
import { createPassportSigner } from "./passport";

const passportSigner = await createPassportSigner();

const address = await passportSigner.getAddress();

const details = await passportSigner.getAuthDetails();

const signedMessage = await passportSigner.signMessage("test");

const typedData = {
  types: {
    Request: [{ name: "hello", type: "string" }],
  },
  primaryType: "Request",
  message: {
    hello: "world",
  },
};
const signTypedData = await passportSigner.signTypedData(typedData);
```

```ts [passkey-signer.ts]
// [!include ~/snippets/signers/passport/webauthn-signer.ts]
```

```ts [doa-signer.ts]
// [!include ~/snippets/signers/passport/key-signer.ts]
```

:::

## Developer Links

- [Passport SDK](https://github.com/0xpass/passport-sdk/tree/main/packages/passport)
- [PassportSigner Tests](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/signers/src/passport/__tests__/signer.test.ts)
- [Passport Documentation](https://docs.0xpass.io/)

```

```
