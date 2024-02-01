---
outline: deep
head:
  - - meta
    - property: og:title
      content: AccountSigner • getBundlerClient
  - - meta
    - name: description
      content: Overview of the getBundlerClient method on AccountSigner in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the getBundlerClient method on AccountSigner in aa-ethers
---

# getBundlerClient

`getBundlerClient` is a method on `AccountSigner` that gets the underlying viem client which has [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) capability.

## Usage

::: code-group

```ts [example.ts]
import { signer } from "./ethers-signer";

// get the signer's underlying viem client with EIP-4337 capabilties
const client = signer.getBundlerClient();
```

<<< @/snippets/aa-ethers/ethers-signer.ts
:::

## Returns

### `BundlerClient`

The provider's underlying `BundlerClient`
