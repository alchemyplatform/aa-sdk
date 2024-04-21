---
outline: deep
head:
  - - meta
    - property: og:title
      content: ParticleSigner • getAddress
  - - meta
    - name: description
      content: Overview of the getAddress method on ParticleSigner
  - - meta
    - property: og:description
      content: Overview of the getAddress method on ParticleSigner
---

# getAddress

`getAddress` returns the EOA address of the Signer.

This method must be called after [`authenticate`](/packages/aa-signers/particle/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createParticleSigner } from "./particle";
// [!code focus:99]
const particleSigner = await createParticleSigner();

const address = await particleSigner.getAddress();
```

<<< @/snippets/signers/particle.ts
:::

## Returns

### `Promise<Address>`

A `Promise` containing the address of the Signer.
