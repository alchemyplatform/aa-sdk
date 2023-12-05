---
outline: deep
head:
  - - meta
    - property: og:title
      content: TurnkeySigner
  - - meta
    - name: description
      content: Overview of the TurnkeySigner class in aa-signers
  - - meta
    - property: og:description
      content: Overview of the TurnkeySigner class in aa-signers
---

# Turnkey Signer

`TurnkeySigner` is a signer implementation which extends `SmartAccountAuthenticator` to leverage the [Turnkey SDK](https://docs.turnkey.com/category/sdk). It supports features such as authentication, message and typed data signing, and authentication details retrieval.

`TurnkeySigner` provides implementations for all methods on `SmartAccountAuthenticator`:

1.  [`authenticate`](/packages/aa-signers/turnkey/authenticate) -- supports user authentication.
2.  [`getAddress`](/packages/aa-signers/turnkey/getAddress) -- supports typed data signatures from the smart contract account's owner address.
3.  [`signMessage`](/packages/aa-signers/turnkey/signMessage) -- supports message signatures.
4.  [`signTypedData`](/packages/aa-signers/turnkey/signTypedData) -- supports typed data signatures.
5.  [`getAuthDetails`](/packages/aa-signers/turnkey/getAuthDetails) -- supports authentication details retrieval.

## Install Dependencies

`TurnkeySigner` requires installation of the [`@turnkey/http`](https://github.com/tkhq/sdk/tree/main/packages/http) and [`@turnkey/viem`](https://github.com/tkhq/sdk/tree/main/packages/viem) dependencies. `aa-signers` lists them as optional dependencies.

Every request to Turnkey must be signed using a [stamper](https://docs.turnkey.com/category/api-design). In this example, we use the WebAuthn stamper from [`@turnkey/webauthn-stamper`](https://github.com/tkhq/sdk/tree/main/packages/webauthn-stamper).

::: code-group

```bash [npm]
npm i -s @turnkey/http
npm i -s @turnkey/viem
npm i -s @turnkey/webauthn-stamper
```

```bash [yarn]
yarn add @turnkey/http
yarn add @turnkey/viem
yarn add @turnkey/webauthn-stamper
```

## Usage

::: code-group

```ts [example.ts]
import { TurnkeySigner, TurnkeySubOrganization } from "@alchemy/aa-signers";
import { WebauthnStamper } from "@turnkey/webauthn-stamper";
import { http } from "viem";

const turnkeySigner = new TurnkeySigner({
  apiUrl: "api.turnkey.com",
  stamper: new WebauthnStamper({
    rpId: "your.app.xyz",
  }),
});

const authParams = {
  resolveSubOrganization: async () => {
    return new TurnkeySubOrganization({
      subOrganizationId: "12345678-1234-1234-1234-123456789abc",
      signWith: "0x1234567890123456789012345678901234567890",
    })
  },
  transport: http("https://eth-sepolia.g.alchemy.com/v2/ALCHEMY_API_KEY");
};

await turnkeySigner.authenticate(authParams);

const address = await turnkeySigner.getAddress();

const details = await turnkeySigner.getAuthDetails();

const signedMessage = await turnkeySigner.signMessage("test");

const typedData = {
  types: {
    Request: [{ name: "hello", type: "string" }],
  },
  primaryType: "Request",
  message: {
    hello: "world",
  },
};
const signTypedData = await turnkeySigner.signTypedData(typedData);
```

<<< @/snippets/turnkey.ts
:::

## Developer Links

- [Turnkey SDK](https://docs.turnkey.com/category/sdk)
- [Turnkey Tests](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/signers/src/turnkey/__tests__/signer.test.ts)
