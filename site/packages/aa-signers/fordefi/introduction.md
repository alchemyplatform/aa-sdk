---
outline: deep
head:
  - - meta
    - property: og:title
      content: FordefiSigner
  - - meta
    - name: description
      content: Overview of the FordefiSigner class in aa-signers
  - - meta
    - property: og:description
      content: Overview of the FordefiSigner class in aa-signers
---

# Fordefi Signer

`FordefiSigner` is a signer implementation which extends `SmartAccountAuthenticator` to leverage the [Fordefi SDK](https://github.com/FordefiHQ/web3-provider). It supports features such as authentication, message and typed data signing, and authentication details retrieval.

`FordefiSigner` provides implementations for all methods on `SmartAccountAuthenticator`:

1.  [`authenticate`](/packages/aa-signers/fordefi/authenticate) -- supports user authentication.
2.  [`getAddress`](/packages/aa-signers/fordefi/getAddress) -- gets the address of the smart contract account's connected EOA signer account.
3.  [`signMessage`](/packages/aa-signers/fordefi/signMessage) -- supports message signatures.
4.  [`signTypedData`](/packages/aa-signers/fordefi/signTypedData) -- supports typed data signatures.
5.  [`getAuthDetails`](/packages/aa-signers/fordefi/getAuthDetails) -- supports authentication details retrieval.

## Install Dependencies

`FordefiSigner` requires installation of the [`@fordefi/web3-provider`](https://github.com/FordefiHQ/web3-provider) SDK. `aa-signers` lists it as an optional dependency.

::: code-group

```bash [npm]
npm i -s @fordefi/web3-provider
```

```bash [yarn]
yarn add @fordefi/web3-provider
```

## Usage

::: code-group

```ts [example.ts]
import { createFordefiSigner } from "./fordefi";

const fordefiSigner = await createFordefiSigner();

const address = await fordefiSigner.getAddress();

const details = await fordefiSigner.getAuthDetails();

const signedMessage = await fordefiSigner.signMessage("test");

const typedData = {
  types: {
    Request: [{ name: "hello", type: "string" }],
  },
  primaryType: "Request",
  message: {
    hello: "world",
  },
};
const signTypedData = await fordefiSigner.signTypedData(typedData);
```

<<< @/snippets/signers/fordefi.ts
:::

## Developer Links

- [Fordefi Web3 Provider](https://github.com/FordefiHQ/web3-provider)
- [FordefiSigner Tests](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/signers/src/fordefi/__tests__/signer.test.ts)
