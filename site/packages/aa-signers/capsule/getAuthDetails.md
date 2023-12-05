---
outline: deep
head:
  - - meta
    - property: og:title
      content: CapsuleSigner • getAuthDetails
  - - meta
    - name: description
      content: Overview of the getAuthDetails method on CapsuleSigner
  - - meta
    - property: og:description
      content: Overview of the getAuthDetails method on CapsuleSigner
---

# getAuthDetails

`getAuthDetails` returns the details about the authenticated user, specifically all EOA addresses tied to the user's Capsule vault.

This method must be called after [`authenticate`](/packages/aa-signers/capsule/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createCapsuleSigner } from "./capsule";
// [!code focus:99]
const capsuleSigner = await createCapsuleSigner();

const details = await capsuleSigner.getAuthDetails();
```

<<< @/snippets/capsule.ts
:::

## Returns

### `Promise<CapsuleUserInfo>`

A Promise containing the `CapsuleUserInfo`, an `Record<string, Wallet>` where Wallet is an object with the following properties:

- `id: string` -- ID of the Capsule Signer.

- `signer: string` -- Capsule Signer information.

- `address: string` -- [optional] EOA address of the Capusle Signer.

- `publicKey: string` -- [optional] Public Key of the Capusle Signer.

- `scheme: WalletScheme` -- [optional] either `CGGMP` or `DKLS`.
