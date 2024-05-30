---
title: MagicSigner • signMessage
description: Overview of the signMessage method on MagicSigner
---

# signMessage

`signMessage` supports signing messages from the `MagicSigner`.

This method must be called after [`authenticate`](/packages/aa-signers/magic/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createMagicSigner } from "./magic";
// [!code focus:99]
const magicSigner = await createMagicSigner();

const signedMessage = await magicSigner.signMessage("test");
```

```ts [magic.ts]
// [!include ~/snippets/signers/magic.ts]
```

:::

## Returns

### `Promise<Hex>`

A `Promise` containing the signature of the message.

## Parameters

### `msg: string | Uint8Array)` -- the message to sign
