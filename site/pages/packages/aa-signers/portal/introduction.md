---
title: PortalSigner
description: Overview of the PortalSigner class in aa-signers
---

# Portal Signer

`PortalSigner` is a signer implementation which extends `SmartAccountAuthenticator` to leverage the [Portal SDK](https://docs.portalhq.io/sdk/web-beta). It supports features such as authentication, message and typed data signing, and authentication details retrieval.

`PortalSigner` provides implementations for all methods on `SmartAccountAuthenticator`:

1.  [`authenticate`](/packages/aa-signers/portal/authenticate) -- supports user authentication.
2.  [`getAddress`](/packages/aa-signers/portal/getAddress) -- gets the address of the smart contract account's connected EOA signer account.
3.  [`signMessage`](/packages/aa-signers/portal/signMessage) -- supports message signatures.
4.  [`signTypedData`](/packages/aa-signers/portal/signTypedData) -- supports typed data signatures.
5.  [`getAuthDetails`](/packages/aa-signers/portal/getAuthDetails) -- supports authentication details retrieval.

## Install Dependencies

`PortalSigner` requires installation of the [`@portal-hq/web`](https://docs.portalhq.io/sdk/web-beta) SDK. `aa-signers` lists it as an optional dependency.

:::code-group

```bash [npm]
npm i -s @portal-hq/web
```

```bash [yarn]
yarn add @portal-hq/web
```

## Usage

:::code-group

```ts [example.ts]
import { createPortalSigner } from "./portal";

const portalSigner = await createPortalSigner();

const address = await portalSigner.getAddress();

const details = await portalSigner.getAuthDetails();

const signedMessage = await portalSigner.signMessage("test");

const typedData = {
  types: {
    Request: [{ name: "hello", type: "string" }],
  },
  primaryType: "Request",
  message: {
    hello: "world",
  },
};
const signTypedData = await portalSigner.signTypedData(typedData);
```

```ts [portal.ts]
// [!include ~/snippets/signers/portal.ts]
```

:::

## Developer Links

- [Portal SDK](https://docs.portalhq.io/sdk/web-beta)
- [PortalSigner Tests](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/signers/src/portal/__tests__/signer.test.ts)
