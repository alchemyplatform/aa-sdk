---
title: PassportSigner • signMessage
description: Overview of the signMessage method on PassportSigner
---

# signMessage

`signMessage` supports signing messages from the `PassportSigner`.

This method must be called after [`authenticate`](/packages/aa-signers/passport/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

You can sign messages using both a passkey signer, or a the key signer which allows you to bring your own authentication method.

## Usage

:::code-group

```ts [example.ts]
import { createPassportSigner } from "./webauthn-signer"; // If using passkeys
import { createPassportSigner } from "./key-signer"; // If using your own authentication methods
// [!code focus:99]
const passportSigner = await createPassportSigner();

const signedMessage = await passportSigner.signMessage("test");
```

```ts [passkey-signer.ts]
// [!include ~/snippets/signers/passport/webauthn-signer.ts]
```

```ts [doa-signer.ts]
// [!include ~/snippets/signers/passport/key-signer.ts]
```

:::

## Returns

### `Promise<Hex>`

A `Promise` containing the signature of the message.

## Parameters

### `msg: string | Uint8Array)` -- the message to sign
