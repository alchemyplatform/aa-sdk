---
outline: deep
head:
  - - meta
    - property: og:title
      content: MagicSigner • getAddress
  - - meta
    - name: description
      content: Overview of the getAddress method on MagicSigner
  - - meta
    - property: og:description
      content: Overview of the getAddress method on MagicSigner
---

# getAddress

`getAddress` returns the EOA address of the Signer.

This method must be called after [`authenticate`](/packages/aa-signers/magic/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createMagicSigner } from "./magic";
// [!code focus:99]
const magicSigner = await createMagicSigner();

const address = await magicSigner.getAddress();
```

<<< @/snippets/magic.ts
:::

## Returns

### `Promise<Address>`

A Promise containing the address of the Signer.
