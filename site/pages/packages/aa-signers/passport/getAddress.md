---
outline: deep
head:
  - - meta
    - property: og:title
      content: PassportSigner • getAddress
  - - meta
    - name: description
      content: Overview of the getAddress method on PassportSigner
  - - meta
    - property: og:description
      content: Overview of the getAddress method on PassportSigner
---

# getAddress

`getAddress` returns the EOA address of the Signer.

This method must be called after [`authenticate`](/packages/aa-signers/passport/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createPassportSigner } from "./passport";
// [!code focus:99]
const passportSigner = await createPassportSigner();

const address = await passportSigner.getAddress();
```

<<< @/snippets/signers/passport.ts
:::

## Returns

### `Promise<Address>`

A `Promise` containing the address of the Signer.
