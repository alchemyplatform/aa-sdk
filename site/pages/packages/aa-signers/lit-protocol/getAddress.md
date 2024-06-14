---
title: LitSigner • getAddress
description: Overview of the getAddress method on LitSigner
---

# getAddress

`getAddress` returns the EOA address of the Signer.

This method must be called after [`authenticate`](/packages/aa-signers/lit-protocol/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createLitSignerWithAuthMethod } from "./lit";
// [!code focus:99]

const litSigner = new createLitSignerWithAuthMethod();

const address = await litSigner.getAddress();
```

```ts [lit.ts]
// [!include ~/snippets/signers/lit.ts]
```

:::

## Returns

### `Promise<Address>`

A `Promise` containing the address of the Signer.
