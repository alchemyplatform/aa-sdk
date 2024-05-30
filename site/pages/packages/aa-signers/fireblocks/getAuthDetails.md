---
title: FireblocksSigner • getAuthDetails
description: Overview of the getAuthDetails method on FireblocksSigner
---

# getAuthDetails

`getAuthDetails` returns the details about the authenticated user, specifically all EOA addresses tied to the user's Fireblocks vault.

This method must be called after [`authenticate`](/packages/aa-signers/fireblocks/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createFireblocksSigner } from "./fireblocks";
// [!code focus:99]
const fireblocksSigner = await createFireblocksSigner();

const details = await fireblocksSigner.getAuthDetails();
```

```ts [fireblocks.ts]
// [!include ~/snippets/signers/fireblocks.ts]
```

:::

## Returns

### `Promise<FireblocksUserInfo>`

A `Promise` containing the `FireblocksUserInfo`, an object with the following fields:

- `addresses: Address[]` -- all EOA addresses accessible via the user's Fireblocks vault.
