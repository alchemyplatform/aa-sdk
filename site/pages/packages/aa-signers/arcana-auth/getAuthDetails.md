---
title: ArcanaAuthSigner • getAuthDetails
description: Overview of the getAuthDetails method on ArcanaAuthSigner
---

# getAuthDetails

`getAuthDetails` returns the details about the authenticated user, per the `Arcana Auth` SDK's `getUser` [UserInfo specifications](https://authsdk-ref-guide.netlify.app/interfaces/userinfo.

This method must be called after [`authenticate`](/packages/aa-signers/arcana-auth/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createArcanaAuthSigner } from "./arcana-auth";
// [!code focus:99]
const newArcanaAuthSigner = await createArcanaAuthSigner();

const details = await newArcanaAuthSigner.getAuthDetails();
```

```ts [arcana-auth.ts]
// [!include ~/snippets/signers/arcana-auth.ts]
```

:::

## Returns

### `Promise<UserInfo>`

A `Promise` containing the `UserInfo`, an object with the following fields:

- `address: string | null` -- the EOA account address associated with the authenticated user's wallet.
- `email: string | null` -- email address of the authenticated user.
- `id: string | null` -- the decentralized user identifier.
- `loginToken: string` -- JWT token returned after the user authenticates.
- `loginType: Logins | passwordless` -- login provider type or passwordless used for authentication (ex. `[{ Logins: "google" | "github" | "discord" | "twitch" | "twitter" | "aws" | "firebase" | "steam" }]`).
- `name: string` -- user name associated with the email id
- `picture: string` -- url pointing to the user profile image
- `publicKey: string` -- public key associated with the user account

See [Arcana Auth SDK Reference Guide](https://authsdk-ref-guide.netlify.app/interfaces/userinfo) for details.
