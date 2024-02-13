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

const bundlePromise = new Promise(async (resolve) => {
  // up to you define how you collect the OTP from the user
  const otpFromUser = await getOtpFromUser();
  resolve(otpFromUser);
});

const user = await signer.authenticate({
  type: "email",
  email: "user@email.com",
  // the bundle is the OTP that the user will input from their email
  bundle: bundlePromise,
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
  | { type: "email"; email: string; bundle: Promise<string> }
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
