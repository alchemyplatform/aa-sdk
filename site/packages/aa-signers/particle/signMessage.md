---
outline: deep
head:
  - - meta
    - property: og:title
      content: ParticleSigner • signMessage
  - - meta
    - name: description
      content: Overview of the signMessage method on ParticleSigner
  - - meta
    - property: og:description
      content: Overview of the signMessage method on ParticleSigner
---

# signMessage

`signMessage` supports signing messages from the `ParticleSigner`.

This method must be called after [`authenticate`](/packages/aa-signers/particle/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createParticleSigner } from "./particle";
// [!code focus:99]
const particleSigner = await createParticleSigner();

const signedMessage = await particleSigner.signMessage("test");
```

<<< @/snippets/signers/particle.ts
:::

## Returns

### `Promise<Hex>`

A `Promise` containing the signature of the message.

## Parameters

### `msg: string | Uint8Array)` -- the message to sign
