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

1.  [`authenticate`](/packages/aa-signers/magic/authenticate) -- supports user authentication.
2.  [`getAddress`](/packages/aa-signers/magic/getAddress) -- supports typed data signatures from the smart contract account's owner address.
3.  [`signMessage`](/packages/aa-signers/magic/signMessage) -- supports message signatures.
4.  [`signTypedData`](/packages/aa-signers/magic/signTypedData) -- supports typed data signatures.
5.  [`getDetails`](/packages/aa-signers/magic/getDetails) -- supports authentication details retrieval.

## Usage

::: code-group

```ts [example.ts]
import { createWeb3AuthSigner } from "./web3auth";

const web3AuthSigner = await createWeb3AuthSigner();

const address = await web3AuthSigner.getAddress();

const details = await web3AuthSigner.getDetails();

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
