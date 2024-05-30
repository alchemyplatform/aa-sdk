---
title: FireblocksSigner • signMessage
description: Overview of the signMessage method on FireblocksSigner
---

# signMessage

`signMessage` supports signing messages from the `FireblocksSigner`.

This method must be called after [`authenticate`](/packages/aa-signers/fireblocks/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createFireblocksSigner } from "./fireblocks";
// [!code focus:99]
const fireblocksSigner = await createFireblocksSigner();

const signedMessage = await fireblocksSigner.signMessage("test");
```

```ts [fireblocks.ts]
// [!include ~/snippets/signers/fireblocks.ts]
```

:::

## Returns

### `Promise<Hex>`

A `Promise` containing the signature of the message.

## Parameters

### `msg: string | Uint8Array)` -- the message to sign
