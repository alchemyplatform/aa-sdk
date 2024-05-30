---
title: ArcanaAuthSigner • authenticate
description: Overview of the authenticate method on ArcanaAuthSigner
---

# authenticate

`authenticate` is a method on the `ArcanaAuthSigner` that leverages the `Arcana` Auth Web SDK to authenticate a user.

This method must be called before accessing the other methods available on the `ArcanaAuthSigner`, such as signing messages or typed data or accessing user details.

## Usage

```ts [example.ts]
// [!code focus:99]
import { ArcanaAuthSigner } from "@alchemy/aa-signers";
// Register app through Arcana Developer Dashboard to get clientId
// ARCANA_AUTH_CLIENTID = "xar_live_nnnnnnnnnn"
const newArcanaAuthSigner = new ArcanaAuthSigner({
  clientId: ARCANA_AUTH_CLIENTID,
});
// or
// import { AuthProvider } from "@arcana/auth";
// const inner = new AuthProvider ("xar_live_nnnn");
// const newArcanaAuthSigner = new ArcanaAuthSigner({inner});
const getUserInfo = await newArcanaAuthSigner.authenticate();
```

## Returns

### `Promise<UserInfo>`

A `Promise` containing the `UserInfo`, an object with the following fields:

- `address: string | null` -- the EoA account address associated with the authenticated user's wallet.
- `email: string | null` -- email address of the authenticated user.
- `id: string | null` -- the decentralized user identifier.
- `loginToken: string` -- JWT token returned after the user authenticates.
- `loginType: Logins | passwordless` -- login provider type or passwordless used for authentication (ex. `[{ Logins: "google" | "github" | "discord" | "twitch" | "twitter" | "aws" | "firebase" | "steam" }]`).
- `name: string` -- user name associated with the email id
- `picture: string` -- url pointing to the user profile image
- `publicKey: string` -- public key associated with the user account

See [Arcana Auth SDK Reference Guide](https://authsdk-ref-guide.netlify.app/interfaces/userinfo) for details.

## Parameters

### `clientId`: Unique app identifier assigned after app registration via the Arcana Developer Dashboard

or

### `inner`: An AuthProvider object. For field details, see [AuthProvider constructor](https://authsdk-ref-guide.netlify.app/classes/authprovider#constructor).
