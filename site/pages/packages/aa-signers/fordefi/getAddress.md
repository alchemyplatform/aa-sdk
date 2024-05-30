---
title: FordefiSigner • getAddress
description: Overview of the getAddress method on FordefiSigner
---

# getAddress

`getAddress` returns the EOA address of the Signer.

This method must be called after [`authenticate`](/packages/aa-signers/fordefi/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createFordefiSigner } from "./fordefi";
// [!code focus:99]
const fordefiSigner = await createFordefiSigner();

const address = await fordefiSigner.getAddress();
```

```ts [fordefi.ts]
// [!include ~/snippets/signers/fordefi.ts]
```

:::

## Returns

### `Promise<Address>`

A Promise containing the EOA address accessible via the Signer.
