---
title: PassportSigner • authenticate
description: Overview of the authenticate method on PassportSigner
---

# authenticate

`authenticate` is a method on the `PassportSigner` which leverages the `Passport` SDK to initiate login and authenticate a user.

This method must be called before accessing the other methods available on the `PassportSigner`, such as signing messages or typed data or accessing user details. Once authenticated this state will remain constant on the signer instance, and `authenticate` will no longer need to be called for access to the other methods; unless the account state is disrupted, upon which `authenticate` will be required once again.

## Usage

```ts [example.ts]
// [!code focus:99]
import { PassportSigner } from "@alchemy/aa-signers/passport";
import { WebAuthnSigner } from "@0xpass/webauthn-signer";
import { sepolia } from "@alchemy/aa-core";

const passportSigner = new PassportSigner({
  scope_id: "<scope_id>",
  signer: new WebAuthnSigner({
    rpId: "<rpId>",
    rpName: "<rpName>",
  }),
});

await passportSigner.authenticate();
```

## Returns

### `Promise<PassportUserInfo>`

A `Promise` containing the `PassportUserInfo`, an object derived from Particle's [`UserInfo`](https://github.com/Particle-Network/particle-react-native/blob/main/particle-auth/src/Models/LoginInfo.ts#L83) interface.

## Parameters

### `authParams: <PassportAuthenticationParams>`

An object with the following fields:

- `authenticationParams: PassportAuthenticationParams` -- an object with the following properties:

  - `username: string` -- The username of the user trying to authenticate.

  - `userDisplayName: string` -- The display name of the user.

  - `chain: Chain` -- The blockchain chain that the user is interacting with.

  - `fallbackProvider: string` -- The fallback provider in case the primary provider fails.

  - `endpoint?: string` -- [optional] The endpoint to which authentication requests should be sent.

- `userInfo: PassportUserInfo` -- an object with the following properties:

  - `authenticatedHeaders: PassportAuthenticatedHeaders` -- Headers that include encrypted key and session information.

    - `x-encrypted-key: string` -- The encrypted key header.

    - `x-session: string` -- The session header.

  - `addresses: Address[]` -- An array of blockchain addresses associated with the user.

- `authenticate: (authenticationParams: PassportAuthenticationParams) => Promise<PassportUserInfo>` -- a method that initiates authentication for a user and returns user information upon successful authentication.
