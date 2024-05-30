---
title: EthersProviderAdapter • getBundlerClient
description: Overview of the getBundlerClient method on EthersProviderAdapter in aa-ethers
---

# getBundlerClient

`getBundlerClient` is a method on `EthersProviderAdapter` that gets the underlying viem client which has [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) capability.

## Usage

:::code-group

```ts [example.ts]
import { provider } from "./ethers-provider";

// get the provider's underlying viem client with EIP-4337 capabilities
const client = provider.getBundlerClient();
```

```ts [ethers-provider.ts]
// [!include ~/snippets/aa-ethers/ethers-provider.ts]
```

:::

## Returns

### `BundlerClient`

The provider's underlying `BundlerClient`
