---
outline: deep
head:
  - - meta
    - property: og:title
      content: FordefiSigner • getAuthDetails
  - - meta
    - name: description
      content: Overview of the getAuthDetails method on FordefiSigner
  - - meta
    - property: og:description
      content: Overview of the getAuthDetails method on FordefiSigner
---

# getAuthDetails

`getAuthDetails` returns the details about the authenticated user, specifically all EOA addresses tied to the user's Fordefi vault.

This method must be called after [`authenticate`](/packages/aa-signers/fordefi/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createFordefiSigner } from "./fordefi";
// [!code focus:99]
const FordefiSigner = await createFordefiSigner();

const details = await fordefiSigner.getAuthDetails();
```

<<< @/snippets/signers/fordefi.ts
:::

## Returns

### `Promise<FordefiUserInfo>`

A Promise containing the `FordefiUserInfo`, an object with the following fields:

- `addresses: Address[]` -- an array with a single EOA address accessible via the Signer.
