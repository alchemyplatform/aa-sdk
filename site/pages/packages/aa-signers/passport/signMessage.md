---
title: PassportSigner • signMessage
description: Overview of the signMessage method on PassportSigner
---

# signMessage

`signMessage` supports signing messages from the `PassportSigner`.

This method must be called after [`authenticate`](/packages/aa-signers/passport/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createPassportSigner } from "./passport";
// [!code focus:99]
const passportSigner = await createPassportSigner();

const signedMessage = await passportSigner.signMessage("test");
```

```ts [passport.ts]
// [!include ~/snippets/signers/passport.ts]
```

:::

## Returns

### `Promise<Hex>`

A `Promise` containing the signature of the message.

## Parameters

### `msg: string | Uint8Array)` -- the message to sign
