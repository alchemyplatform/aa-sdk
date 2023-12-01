---
outline: deep
head:
  - - meta
    - property: og:title
      content: TurnkeySigner • authenticate
  - - meta
    - name: description
      content: Overview of the authenticate method on TurnkeySigner
  - - meta
    - property: og:description
      content: Overview of the authenticate method on TurnkeySigner
---

# authenticate

`authenticate` is a method on the `TurnkeySigner` which leverages the `Turnkey` SDK to authenticate a user.

This method must be called before accessing the other methods available on the `TurnkeySigner`, such as signing messages or typed data or accessing user details.

## Usage

::: code-group

```ts [example.ts]
// [!code focus:99]
import { TurnkeySigner } from "@alchemy/aa-signers";
import { WebauthnStamper } from "@turnkey/webauthn-stamper";
import { http } from "viem";

// Create the Turnkey client
const turnkeyClient = new TurnkeyClient(
  {
    baseUrl: "api.turnkey.com",
  },
  new WebauthnStamper({
    rpId: "your.app.xyz",
  }),
);

// If you need to retrieve your user's wallet ID from Turnkey
const wallets = await turnkeyClient.getWallets({
  organizationId: "TURNKEY_ORGANIZATION_ID",
});
if (wallets.length === 0) throw new Error("No wallets created!");
const walletId = wallets[0].walletId;

// Now create the TurnkeySigner and authenticate with the wallet
const turnkeySigner = new TurnkeySigner({ inner: turnkeyClient });
const authParams = {
  organizationId: "TURNKEY_ORGANIZATION_ID",
  signWith: walletId,
  transport: http("https://eth-sepolia.g.alchemy.com/v2/ALCHEMY_API_KEY");
};
await turnkeySigner.authenticate(authParams);
```
:::

## Returns

### `Promise<TurnkeyUserMetadata>`

A Promise containing the `TurnkeyUserMetadata`, and object with the following fields:

- `organizationId: string` -- unique identifier for the user's organization.
- `organizationName: string` -- human-readable name for the user's organization.
- `userId: string` -- unique identifier for the user.
- `username: string` -- human-readable name for the user.

## Parameters

### `authParams: <TurnkeyAuthParams>`

An object with the following fields:

- `organizationId` -- unique identifier for the user's organization that you can generate using the [Turnkey quickstart guide](https://docs.turnkey.com/getting-started/quickstart).
- `signWith` -- an address or unique identifer for a user's wallet. A user can create a wallet using the [`create_wallet`](https://docs.turnkey.com/api#tag/Wallets/operation/CreateWallet) endpoint.
- `transport` -- a `viem` [Transport](https://viem.sh/docs/clients/intro.html#transports) you can define to execute RPC requests.
