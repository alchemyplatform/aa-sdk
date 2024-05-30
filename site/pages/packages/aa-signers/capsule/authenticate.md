---
title: CapsuleSigner • authenticate
description: Overview of the authenticate method on CapsuleSigner
---

# authenticate

`authenticate` is a method on the `CapsuleSigner` which leverages the `Capsule` SDK to authenticate a user.

You must call this method before accessing the other methods available on the `CapsuleSigner`, such as signing messages or typed data or accessing user details.

## Usage

```ts [example.ts]
// [!code focus:99]
import { CapsuleSigner } from "@alchemy/aa-signers/capsule";

const capsuleSigner = new CapsuleSigner({
  env: Environment.DEVELOPMENT,
  apiKey: "CAPSULE_API_KEY",
  walletConfig: {
    chain: sepolia,
    // get your own Alchemy API key at: https://dashboard.alchemy.com/
    transport: http(`${sepolia.rpcUrls.alchemy.http[0]}/ALCHEMY_API_KEY`),
  },
});

await capsuleSigner.authenticate();

// after calling `authenticate`, a user must either be created or logged in to perform any signing operations using `capsuleSigner`
// follow the documentation at https://docs.usecapsule.com/integration-guide/user-and-wallet-creation using `capsuleSigner.inner` to create or login a user
```

## Returns

### `Promise<CapsuleUserInfo>`

A `Promise` containing the `CapsuleUserInfo`, an `Record<string, Wallet>` where Wallet is an object with the following properties:

- `id: string` -- ID of the Capsule Signer.

- `signer: string` -- Capsule Signer information.

- `address: string` -- [optional] EOA address of the Capsule Signer.

- `publicKey: string` -- [optional] Public Key of the Capsule Signer.

- `scheme: WalletScheme` -- [optional] either `CGGMP` or `DKLS`.
