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

`getAddress` returns the EOA address of the `Signer`.

## Usage

::: code-group

```ts [example.ts]
import { createWeb3AuthSigner } from "./web3auth";
// [!code focus:99]
const web3AuthSigner = await createWeb3AuthSigner();
const address = await web3AuthSigner.getAddress();
```

<<< @/snippets/web3auth.ts
:::

## Returns

### `Promise<Address>`

A Promise containing the address of the smart contract account's owner address.
