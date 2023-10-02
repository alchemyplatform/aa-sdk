---
outline: deep
head:
  - - meta
    - property: og:title
      content: EthersProviderAdapter • connectToAccount
  - - meta
    - name: description
      content: Overview of the connectToAccount method on EthersProviderAdapter in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the connectToAccount method on EthersProviderAdapter in aa-ethers
---

# send

`send` is a method on `EthersProviderAdapter` that uses that adapter's `SmartAccountProvider`'s [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193)-compliant `request` method.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./ethers-provider";

// EIP-1193 compliant requests
const chainId = await provider.send("eth_chainId", []);
```

<<< @/snippets/ethers-provider.ts
:::

## Returns

### `Promise<any>`

The result of the RPC call

## Parameters

### `method: string`

The RPC method to call

### `params: any[]`

The params required by the RPC method
