---
title: TurnkeySigner • authenticate
description: Overview of the authenticate method on TurnkeySigner
---

# authenticate

`authenticate` is a method on the `TurnkeySigner` which leverages the `Turnkey` SDK to authenticate a user.

This method must be called before accessing the other methods available on the `TurnkeySigner`, such as signing messages or typed data or accessing user details.

## Usage

```ts [example.ts]
// [!code focus:99]
import {
  TurnkeySigner,
  TurnkeySubOrganization,
} from "@alchemy/aa-signers/turnkey";
import { TurnkeyClient, createActivityPoller } from "@turnkey/http";
import { WebauthnStamper } from "@turnkey/webauthn-stamper";
import { http } from "viem";

// Create the Turnkey client
const turnkeyClient = new TurnkeyClient(
  {
    baseUrl: "api.turnkey.com",
  },
  new WebauthnStamper({
    rpId: "your.app.xyz",
  })
);

const resolveSubOrganization = async () => {
  // Follow [Turnkey's Sub-Organization as Wallets guide](https://docs.turnkey.com/integration-guides/sub-organizations-as-wallets)
  // to see all options.
  const activityPoller = createActivityPoller({
    client: turnkeyClient,
    requestFn: turnkeyClient.createSubOrganization,
  });

  const activity = await activityPoller({
    type: "ACTIVITY_TYPE_CREATE_SUB_ORGANIZATION_V4",
    timestampMs: String(Date.now()),
    organizationId: "TURNKEY_ORGANIZATION_ID",
    parameters: {
      subOrganizationName: "Sub-Org Name",
      rootQuorumThreshold: 1,
      rootUsers: [
        {
          userName: "User Name",
          apiKeys: [],
          authenticators: [
            {
              authenticatorName: "User Passkey",
              challenge: "c29tZV9yYW5kb21fY2hhbG-bmdl",
              attestation: {
                credentialId: "Y3JlZGVudGlhbElEX2V4YW1wbGU=+",
                clientDataJson: "eyJ0eXBlIjoiY3JlYXRlIiwiY2hhbGxlbmdlIjoiYzI",
                attestationObject: "YXR0ZXN0YXRpb25PYmplY3RfZXhhbXBsZQ_F",
                transports: ["AUTHENTICATOR_TRANSPORT_HYBRID"],
              },
            },
          ],
        },
      ],
      wallet: {
        walletName: "User Wallet",
        accounts: [
          {
            curve: "CURVE_SECP256K1",
            pathFormat: "PATH_FORMAT_BIP32",
            path: "m/44'/60'/0'/0/0",
            addressFormat: "ADDRESS_FORMAT_ETHEREUM",
          },
        ],
      },
    },
  });

  return new TurnkeySubOrganization({
    subOrganizationId:
      activity.result.createSubOrganizationResultV4!.subOrganizationId,
    signWith: activity.result.createSubOrganizationResultV4!.wallet!.walletId,
  });
};

// Now create the TurnkeySigner and authenticate with the wallet
const turnkeySigner = new TurnkeySigner({ inner: turnkeyClient });
const authParams = {
  transport: http("https://eth-sepolia.g.alchemy.com/v2/ALCHEMY_API_KEY"),
  resolveSubOrganization,
};
await turnkeySigner.authenticate(authParams);
```

## Returns

### `Promise<TurnkeyUserMetadata>`

A `Promise` containing the `TurnkeyUserMetadata`, and object with the following fields:

- `organizationId: string` -- unique identifier for the user's organization.
- `organizationName: string` -- human-readable name for the user's organization.
- `userId: string` -- unique identifier for the user.
- `username: string` -- human-readable name for the user.

## Parameters

### `authParams: <TurnkeyAuthParams>`

An object with the following fields:

- `transport` -- a `viem` [Transport](https://viem.sh/docs/clients/intro#transports) you can define to execute RPC requests.
- `resolveSubOrganization: () => Promise<TurnkeySubOrganization>` -- a method you can define as necessary to leverage the `Turnkey` SDK for authenticating a wallet as a [sub-organization](https://docs.turnkey.com/integration-guides/sub-organizations-as-wallets). For instance, in the example above, `authenticate` uses the [`createSubOrganization`](https://docs.turnkey.com/api#tag/Organizations/operation/CreateSubOrganization) method.
