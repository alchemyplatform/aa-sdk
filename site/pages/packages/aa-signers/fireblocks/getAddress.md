---
title: FireblocksSigner • getAddress
description: Overview of the getAddress method on FireblocksSigner
---

# getAddress

`getAddress` returns the EOA address of the Signer.

This method must be called after [`authenticate`](/packages/aa-signers/fireblocks/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createFireblocksSigner } from "./fireblocks";
// [!code focus:99]
const fireblocksSigner = await createFireblocksSigner();

const address = await fireblocksSigner.getAddress();
```

```ts [fireblocks.ts]
// [!include ~/snippets/signers/fireblocks.ts]
```

:::

## Returns

### `Promise<Address>`

A `Promise` containing the address of the Signer.
