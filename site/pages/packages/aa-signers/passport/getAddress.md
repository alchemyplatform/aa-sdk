---
title: PassportSigner • getAddress
description: Overview of the getAddress method on PassportSigner
---

# getAddress

`getAddress` returns the EOA address of the Signer.

This method must be called after [`authenticate`](/packages/aa-signers/passport/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createPassportSigner } from "./webauthn-signer"; // If using passkeys
import { createPassportSigner } from "./key-signer"; // If using your own authentication methods
// [!code focus:99]
const passportSigner = await createPassportSigner();

const address = await passportSigner.getAddress();
```

```ts [passport.ts]
// [!include ~/snippets/signers/passport.ts]
```

```ts [doa-signer.ts]
// [!include ~/snippets/signers/passport/key-signer.ts]
```

:::

## Returns

### `Promise<Address>`

A `Promise` containing the address of the Signer.
