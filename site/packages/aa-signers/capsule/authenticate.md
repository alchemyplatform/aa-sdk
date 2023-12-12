---
outline: deep
head:
  - - meta
    - property: og:title
      content: CapsuleSigner • authenticate
  - - meta
    - name: description
      content: Overview of the authenticate method on CapsuleSigner
  - - meta
    - property: og:description
      content: Overview of the authenticate method on CapsuleSigner
---

# authenticate

`authenticate` is a method on the `CapsuleSigner` which leverages the `Capsule` SDK to authenticate a user.

You must call this method before accessing the other methods available on the `CapsuleSigner`, such as signing messages or typed data or accessing user details.

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
await capsuleSigner.authenticate({ email: "test@gmail.com" });
```

:::

## Returns

### `Promise<CapsuleUserInfo>`

A Promise containing the `CapsuleUserInfo`, an `Record<string, Wallet>` where Wallet is an object with the following properties:

- `id: string` -- ID of the Capsule Signer.

- `signer: string` -- Capsule Signer information.

- `address: string` -- [optional] EOA address of the Capusle Signer.

- `publicKey: string` -- [optional] Public Key of the Capusle Signer.

- `scheme: WalletScheme` -- [optional] either `CGGMP` or `DKLS`.

## Parameters

### `params: CapsuleAuthenticationParams`

- `email: string` -- the email to use for Capsule authentication.
