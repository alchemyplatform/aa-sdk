---
outline: deep
head:
  - - meta
    - property: og:title
      content: FordefiSigner • signMessage
  - - meta
    - name: description
      content: Overview of the signMessage method on FordefiSigner
  - - meta
    - property: og:description
      content: Overview of the signMessage method on FordefiSigner
---

# signMessage

`signMessage` supports signing messages from the `FordefiSigner`.

This method must be called after [`authenticate`](/packages/aa-signers/fordefi/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createFordefiSigner } from "./fordefi";
// [!code focus:99]
const fordefiSigner = await createFordefiSigner();

const signedMessage = await fordefiSigner.signMessage("test");
```

<<< @/snippets/signers/fordefi.ts
:::

## Returns

### `Promise<Hex>`

A Promise containing the signature of the message.

## Parameters

### `msg: string | Uint8Array` -- the message to sign
