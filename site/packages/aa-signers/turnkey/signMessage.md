---
outline: deep
head:
  - - meta
    - property: og:title
      content: TurnkeySigner • signMessage
  - - meta
    - name: description
      content: Overview of the signMessage method on TurnkeySigner
  - - meta
    - property: og:description
      content: Overview of the signMessage method on TurnkeySigner
---

# signMessage

`signMessage` supports signing messages from the `TurnkeySigner`.

This method must be called after [`authenticate`](/packages/aa-signers/turnkey/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createTurnkeySigner } from "./turnkey";
// [!code focus:99]
const turnkeySigner = await createTurnkeySigner();

const signedMessage = await turnkeySigner.signMessage("test");
```

<<< @/snippets/turnkey.ts
:::

## Returns

### `Promise<Hex>`

A Promise containing the signature of the message.

## Parameters

### `msg: string | Uint8Array)` -- the message to sign
