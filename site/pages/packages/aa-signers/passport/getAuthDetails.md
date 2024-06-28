---
title: PassportSigner • getAuthDetails
description: Overview of the getAuthDetails method on PassportSigner
---

# getAuthDetails

`getAuthDetails` returns the details about the authenticated user, specifically the EOA address of the user, and the encrypted headers used to authenticate / manage the user's account.

This method must be called after [`authenticate`](/packages/aa-signers/passport/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createPassportSigner } from "./webauthn-signer"; // If using passkeys
import { createPassportSigner } from "./key-signer"; // If using your own authentication methods
// [!code focus:99]
const passportSigner = await createPassportSigner();

const details = await passportSigner.getAuthDetails();
```

```ts [passport.ts]
// [!include ~/snippets/signers/passport.ts]
```

```ts [doa-signer.ts]
// [!include ~/snippets/signers/passport/key-signer.ts]
```

:::

## Returns

### `Promise<PassportUserInfo>`

A `Promise` containing the `PassportUserInfo`, an object with the following fields:

- `authenticatedHeaders: PassportAuthenticatedHeaders` -- Headers that include encrypted key and session information.

  - `x-encrypted-key: string` -- The encrypted key header.
  - `x-session: string` -- The session header.

- `addresses: Address[]` -- An array of blockchain addresses associated with the user.
