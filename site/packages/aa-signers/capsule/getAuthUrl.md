---
outline: deep
head:
  - - meta
    - property: og:title
      content: CapsuleSigner • getAuthUrl
  - - meta
    - name: description
      content: Overview of the getAuthUrl method on CapsuleSigner
  - - meta
    - property: og:description
      content: Overview of the getAuthUrl method on CapsuleSigner
---

# getAuthUrl

`getAuthUrl` is a method on the `CapsuleSigner` which leverages the `Capsule` SDK to get an authorization URL to surface to the user.

You must call this method before `authenticate` on the `CapsuleSigner`, which is for accessing the other methods available on the `CapsuleSigner`, such as signing messages or typed data or accessing user details.

## Usage

::: code-group

```ts [example.ts]
// [!code focus:99]
import { CapsuleSigner } from "@alchemy/aa-signers";

const capsuleSigner = new CapsuleSigner({
  env: Environment.DEVELOPMENT,
  apiKey: "CAPSULE_API_KEY",
  walletConfig: {
    chain: sepolia,
    // get your own Alchemy API key at: https://dashboard.alchemy.com/
    transport: http(`${sepolia.rpcUrls.alchemy.http[0]}/ALCHEMY_API_KEY`),
  },
});

await capsuleSigner.getAuthUrl({
  email: "test@gmail.com",
  verificationCode: "test",
});
```

:::

## Returns

### `Promise<string>`

A Promise containing a Capsule authentication URL for the user to visit.

## Parameters

### `params: CapsuleGetAuthUrlParams`

- `email: string` -- the email to use for Capsule authentication.

- `verificationCode: string` -- [optiona] the verification code to use for Capsule authentication.
