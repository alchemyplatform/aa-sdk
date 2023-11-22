---
outline: deep
head:
  - - meta
    - property: og:title
      content: Web3AuthSigner • getAddress
  - - meta
    - name: description
      content: Overview of the getAddress method on Web3AuthSigner
  - - meta
    - property: og:description
      content: Overview of the getAddress method on Web3AuthSigner
---

# getAddress

`getAddress` returns the EOA address of the Signer.

This method must be called after [`authenticate`](/packages/aa-signers/web3auth/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

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

A Promise containing the address of the Signer.
