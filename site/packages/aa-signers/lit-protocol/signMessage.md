---
outline: deep
head:
  - - meta
    - property: og:title
      content: LitSigner • signMessage
  - - meta
    - name: description
      content: Overview of the signMessage method on LitSigner
  - - meta
    - property: og:description
      content: Overview of the signMessage method on LitSigner
---

# signMessage

`signMessage` supports signing messages from the `LitSigner`.

This method must be called after [`authenticate`](/packages/aa-signers/lit-protocol/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createLitSignerWithAuthMethod } from "./lit";
// [!code focus:99]

const litSigner = new createLitSignerWithAuthMethod();

const signedMessage = await litSigner.signMessage("Hello World!");
```

<<< @/snippets/lit.ts
:::

## Returns

### `Promise<Hex>`

A Promise containing the signature of the message.

## Parameters

### `msg: string | Uint8Array)` -- the message to sign
