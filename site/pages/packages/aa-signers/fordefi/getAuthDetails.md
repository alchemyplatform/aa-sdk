---
title: FordefiSigner • getAuthDetails
description: Overview of the getAuthDetails method on FordefiSigner
---

# getAuthDetails

`getAuthDetails` currently does not have a return value.

This method must be called after [`authenticate`](/packages/aa-signers/fordefi/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createFordefiSigner } from "./fordefi";
// [!code focus:99]
const fordefiSigner = await createFordefiSigner();

const details = await fordefiSigner.getAuthDetails();
```

```ts [fordefi.ts]
// [!include ~/snippets/signers/fordefi.ts]
```

:::

## Returns

### `Promise<void>`

Verifies that this signer is authenticated, and throws an error otherwise.
Authentication details are not available.
