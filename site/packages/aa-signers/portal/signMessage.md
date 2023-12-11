---
outline: deep
head:
  - - meta
    - property: og:title
      content: PortalSigner • signMessage
  - - meta
    - name: description
      content: Overview of the signMessage method on PortalSigner
  - - meta
    - property: og:description
      content: Overview of the signMessage method on PortalSigner
---

# signMessage

`signMessage` supports signing messages from the `PortalSigner`.

This method must be called after [`authenticate`](/packages/aa-signers/portal/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createPortalSigner } from "./portal";
// [!code focus:99]
const portalSigner = await createPortalSigner();

const signedMessage = await portalSigner.signMessage("test");
```

<<< @/snippets/portal.ts
:::

## Returns

### `Promise<Hex>`

A Promise containing the signature of the message.

## Parameters

### `msg: string | Uint8Array)` -- the message to sign
