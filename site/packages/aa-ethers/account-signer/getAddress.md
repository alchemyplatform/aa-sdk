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
import { accountSigner } from "./ethers-signer";

// get the account signer's account address
const client = await accountSigner.getAddress();
```

<<< @/snippets/aa-ethers/ethers-signer.ts
:::

## Returns

### `Promise<Address>`

A promise containing the `Signer`'s smart account address
