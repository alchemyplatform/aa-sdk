---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • authenticate
  - - meta
    - name: description
      content: Learn how to use the AlchemySigner.authenticate method
  - - meta
    - property: og:description
      content: Learn how to use the AlchemySigner.authenticate method
  - - meta
    - name: twitter:title
      content: Alchemy Signer • authenticate
  - - meta
    - name: twitter:description
      content: Learn how to use the AlchemySigner.authenticate method
---

# authenticate

The `authenticate` method is used to authenticate a user with the Alchemy Signer.

## Usage

::: code-group

```ts
import { signer } from "./signer";

// init the email auth flow
// NOTE: the signer will handle waiting for email auth to complete in another tab with this method
const user = await signer.authenticate({
  type: "email",
  email: "user@email.com",
});

// OR if you have the bundle the query params

const user = await signer.authenticate({
  type: "email",
  bundle: new URLSearchParams(window.location.search).get("bundle"),
});
```

<<< @/snippets/signers/alchemy/signer.ts

:::

## Returns

`Promise<User>` -- on success returns a `User` object representing the authenticated user.

## Parameters

`AuthParams` -- an object that contains the following properties:

```ts
export type AuthParams =
  | { type: "email"; email: string }
  | { type: "email"; bundle: string }
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
