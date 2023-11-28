---
outline: deep
head:
  - - meta
    - property: og:title
      content: Web3AuthSigner
  - - meta
    - name: description
      content: Overview of the Web3AuthSigner class in aa-signers
  - - meta
    - property: og:description
      content: Overview of the Web3AuthSigner class in aa-signers
---

# web3auth Signer

`Web3AuthSigner` is a signer implementation which extends `SmartAccountAuthenticator` to leverage the [web3auth web modal SDK](https://web3auth.io/docs/sdk/pnp/web/modal). It supports features such as authentication, message and typed data signing, and authentication details retrieval.

`Web3AuthSigner` provides implementations for all methods on `SmartAccountAuthenticator`:

1.  [`authenticate`](/packages/aa-signers/web3auth/authenticate) -- supports user authentication.
2.  [`getAddress`](/packages/aa-signers/web3auth/getAddress) -- supports typed data signatures from the smart contract account's owner address.
3.  [`signMessage`](/packages/aa-signers/web3auth/signMessage) -- supports message signatures.
4.  [`signTypedData`](/packages/aa-signers/web3auth/signTypedData) -- supports typed data signatures.
5.  [`getAuthDetails`](/packages/aa-signers/web3auth/getAuthDetails) -- supports authentication details retrieval.

## Install Dependencies

`Web3AuthSigner` requires installation of the [`@web3auth/modal`](https://github.com/Web3Auth/web3auth-web/tree/master/packages/modal) and [`@web3auth/base`](https://github.com/Web3Auth/web3auth-web/tree/master/packages/base) SDKs. `aa-signers` lists them as optional dependencies.

::: code-group

```bash [npm]
npm i -s @web3auth/modal
npm i -s @web3auth/base
```

```bash [yarn]
yarn add @web3auth/modal
yarn add @web3auth/base
```

## Usage

::: code-group

```ts [example.ts]
import { createWeb3AuthSigner } from "./web3auth";

const web3AuthSigner = await createWeb3AuthSigner();

const address = await web3AuthSigner.getAddress();

const details = await web3AuthSigner.getAuthDetails();

const signedMessage = await web3AuthSigner.signMessage("test");

const typedData = {
  types: {
    Request: [{ name: "hello", type: "string" }],
  },
  primaryType: "Request",
  message: {
    hello: "world",
  },
};
const signTypedData = await web3AuthSigner.signTypedData(typedData);
```

<<< @/snippets/web3auth.ts
:::

## Developer Links

- [web3auth web modal SDK](https://web3auth.io/docs/sdk/pnp/web/modal)
- [Web3AuthSigner Tests](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/signers/src/web3auth/__tests__/signer.test.ts)
