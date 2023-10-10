---
outline: deep
head:
  - - meta
    - property: og:title
      content: convertCoinTypeToChain
  - - meta
    - name: description
      content: Overview of the convertCoinTypeToChain method in aa-core utils
  - - meta
    - property: og:description
      content: Overview of the convertCoinTypeToChain method in aa-core utils
---

# convertCoinTypeToChain

Converts a coinType into a viem Chain object. The conversion follows [ENSIP-11](https://docs.ens.domains/ens-improvement-proposals/ensip-11-evmchain-address-resolution).

::: tip Note
For mainnet, the conversion expects `coinType == 60`. This comes from [ENSIP-9](https://docs.ens.domains/ens-improvement-proposals/ensip-9-multichain-address-resolution).
:::

## Usage

::: code-group

```ts [example.ts]
import { convertCoinTypeToChain } from "@alchemy/aa-core";

// mainnet
const result = convertCoinTypeToChain(60);
```

:::

## Returns

### `Chain`

A viem `Chain` object that the coinType represents

## Parameters

### `coinType: number`

The coinType to convert to a `Chain` object
