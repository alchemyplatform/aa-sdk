---
title: MagicSigner • getAddress
description: Overview of the getAddress method on MagicSigner
---

# getAddress

`getAddress` returns the EOA address of the Signer.

This method must be called after [`authenticate`](/packages/aa-signers/magic/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createMagicSigner } from "./magic";
// [!code focus:99]
const magicSigner = await createMagicSigner();

const address = await magicSigner.getAddress();
```

```ts [magic.ts]
// [!include ~/snippets/signers/magic.ts]
```

:::

## Returns

### `Promise<Address>`

A `Promise` containing the address of the Signer.
