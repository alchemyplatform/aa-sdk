---
title: ParticleSigner • getAddress
description: Overview of the getAddress method on ParticleSigner
---

# getAddress

`getAddress` returns the EOA address of the Signer.

This method must be called after [`authenticate`](/packages/aa-signers/particle/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createParticleSigner } from "./particle";
// [!code focus:99]
const particleSigner = await createParticleSigner();

const address = await particleSigner.getAddress();
```

```ts [particle.ts]
// [!include ~/snippets/signers/particle.ts]
```

:::

## Returns

### `Promise<Address>`

A `Promise` containing the address of the Signer.
