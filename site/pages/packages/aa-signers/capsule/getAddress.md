---
title: CapsuleSigner • getAddress
description: Overview of the getAddress method on CapsuleSigner
---

# getAddress

`getAddress` returns the EOA address of the Signer.

This method must be called after [`authenticate`](/packages/aa-signers/capsule/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createCapsuleSigner } from "./capsule";
// [!code focus:99]
const capsuleSigner = await createCapsuleSigner();

const address = await capsuleSigner.getAddress();
```

```ts [capsule.ts]
// [!include ~/snippets/signers/capsule.ts]
```

:::

## Returns

### `Promise<Address>`

A `Promise` containing the address of the Signer.
