---
outline: deep
head:
  - - meta
    - property: og:title
      content: EthersProviderAdapter • getBundlerClient
  - - meta
    - name: description
      content: Overview of the getBundlerClient method on EthersProviderAdapter in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the getBundlerClient method on EthersProviderAdapter in aa-ethers
---

# getBundlerClient

`getBundlerClient` is a method on `EthersProviderAdapter` that gets the underlying viem client which has [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) capability.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./ethers-provider";

// get the provider's underlying viem client with EIP-4337 capabilities
const client = provider.getBundlerClient();
```

<<< @/snippets/aa-ethers/ethers-provider.ts
:::

## Returns

### `BundlerClient`

The provider's underlying `BundlerClient`
