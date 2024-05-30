---
title: ArcanaAuthSigner • getAddress
description: Overview of the getAddress method on ArcanaAuthSigner
---

# getAddress

`getAddress` returns the EOA address of the `ArcanaAuthSigner`.

This method must be called after [`authenticate`](/packages/aa-signers/arcana-auth/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createArcanaAuthSigner } from "./arcana-auth";
// [!code focus:99]
const newArcanaAuthSigner = await createArcanaAuthSigner();

const address = await newArcanaAuthSigner.getAddress();
```

```ts [arcana-auth.ts]
// [!include ~/snippets/signers/arcana-auth.ts]
```

:::

## Returns

### `Promise<Address>`

A `Promise` containing the address of the `ArcanaAuthSigner`.
