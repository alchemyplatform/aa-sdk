---
outline: deep
head:
  - - meta
    - property: og:title
      content: AccountSigner • getAddress
  - - meta
    - name: description
      content: Overview of the getAddress method on AccountSigner in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the getAddress method on AccountSigner in aa-ethers
---

# getAddress

`getAddress` is a method on `AccountSigner` that gets the `AccountSigner`'s smart account address.

## Usage

::: code-group

```ts [example.ts]
import { signer } from "./ethers-signer";

// get the signer's smart account address
const client = await signer.getAddress();
```

<<< @/snippets/ethers-signer.ts
:::

## Returns

### `Promise<Address>`

A promise containing the `Signer`'s smart account address
