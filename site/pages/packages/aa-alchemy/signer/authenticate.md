---
title: Alchemy Signer • authenticate
description: Learn how to use the AlchemySigner.authenticate method
---

# authenticate

The `authenticate` method is used to authenticate a user with the Alchemy Signer.

## Usage

:::code-group

```ts [example.ts]
import { signer } from "./signer";

// init the email auth flow
// NOTE: the signer will handle waiting for email auth to complete in another tab with this method
const user = await signer.authenticate({
  type: "email",
  email: "user@email.com",
  // optionally, pass in redirect params that will be appended to the magic link url for the user
  // in this example, a callback=/home param will be added to the final URL
  redirectParams: new URLSearchParams({ callback: "/home" }),
});

// OR if you have the bundle the query params

const user = await signer.authenticate({
  type: "email",
  bundle: new URLSearchParams(window.location.search).get("bundle"),
});
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

## Returns

`Promise<User>` -- on success returns a `User` object representing the authenticated user.

## Parameters

`AuthParams` -- an object that contains the following properties:

```ts
export type AuthParams =
  | { type: "email"; email: string; redirectParams?: URLSearchParams }
  | { type: "email"; bundle: string; orgId?: string }
  | {
      type: "passkey";
      createNew: false;
    }
  | {
      type: "passkey";
      createNew: true;
      username: string;
      creationOpts?: CredentialCreationOptionOverrides;
    };
```
