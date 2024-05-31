---
title: TurnkeySigner • signMessage
description: Overview of the signMessage method on TurnkeySigner
---

# signMessage

`signMessage` supports signing messages from the `TurnkeySigner`.

This method must be called after [`authenticate`](/packages/aa-signers/turnkey/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createTurnkeySigner } from "./turnkey";
// [!code focus:99]
const turnkeySigner = await createTurnkeySigner();

const signedMessage = await turnkeySigner.signMessage("test");
```

```ts [turnkey.ts]
// [!include ~/snippets/signers/turnkey.ts]
```

:::

## Returns

### `Promise<Hex>`

A `Promise` containing the signature of the message.

## Parameters

### `msg: string | Uint8Array)` -- the message to sign
