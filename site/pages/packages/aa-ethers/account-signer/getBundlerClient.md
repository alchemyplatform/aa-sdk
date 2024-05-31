---
title: AccountSigner • getBundlerClient
description: Overview of the getBundlerClient method on AccountSigner in aa-ethers
---

# getBundlerClient

`getBundlerClient` is a method on `AccountSigner` that gets the underlying viem client which has [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) capability.

## Usage

:::code-group

```ts [example.ts]
import { accountSigner } from "./ethers-signer";

// get the account signer's underlying viem client with EIP-4337 capabilities
const client = accountSigner.getBundlerClient();
```

```ts [ethers-signer.ts]
// [!include ~/snippets/aa-ethers/ethers-signer.ts]
```

:::

## Returns

### `BundlerClient`

The provider's underlying `BundlerClient`
