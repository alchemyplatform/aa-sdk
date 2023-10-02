---
outline: deep
head:
  - - meta
    - property: og:title
      content: AccountSigner • getPublicErc4337Client
  - - meta
    - name: description
      content: Overview of the getPublicErc4337Client method on AccountSigner in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the getPublicErc4337Client method on AccountSigner in aa-ethers
---

# getPublicErc4337Client

`getPublicErc4337Client` is a method on `AccountSigner` that gets the underlying viem client which has [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) capability.

## Usage

::: code-group

```ts [example.ts]
import { signer } from "./ethers-signer";

// get the signer's underlying viem client with EIP-4337 capabilties
const client = signer.getPublicErc4337Client();
```

<<< @/snippets/ethers-signer.ts
:::

## Returns

### `PublicErc4337Client`

The provider's underlying `PublicErc4337Client`
