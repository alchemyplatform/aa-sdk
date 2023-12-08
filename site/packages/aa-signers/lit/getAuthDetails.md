---
outline: deep
head:
  - - meta
    - property: og:title
      content: LitSigner • getAuthDetails
  - - meta
    - name: description
      content: Overview of the getAuthDetails method on LitSigner
  - - meta
    - property: og:description
      content: Overview of the getAuthDetails method on LitSigner
---

# getAuthDetails

`getAuthDetails` returns the details about the authenticated user, in accordance with the `Magic` web SDK's [specifications](https://magic.link/docs/api/client-side-sdks/web#getinfo).

This method must be called after [`authenticate`](/packages/aa-signers/lit/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createMagicSigner } from "./lit";
// [!code focus:99]
const litSigner = await createLitSigner();

const details = await litSigner.getAuthDetails();
```

<<< @/snippets/magic.ts
:::

## Returns

### `Promise<MagicUserMetadata>`

A Promise containing the `MagicUserMetadata`, and object with the following fields: