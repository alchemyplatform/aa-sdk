---
title: PortalSigner • getAddress
description: Overview of the getAddress method on PortalSigner
---

# getAddress

`getAddress` returns the EOA address of the Signer.

This method must be called after [`authenticate`](/packages/aa-signers/portal/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createPortalSigner } from "./portal";
// [!code focus:99]
const portalSigner = await createPortalSigner();

const address = await portalSigner.getAddress();
```

```ts [portal.ts]
// [!include ~/snippets/signers/portal.ts]
```

:::

## Returns

### `Promise<Address>`

A `Promise` containing the address of the Signer.
