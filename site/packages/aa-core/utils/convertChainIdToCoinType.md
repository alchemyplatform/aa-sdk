---
outline: deep
head:
  - - meta
    - property: og:title
      content: convertChainIdToCoinType
  - - meta
    - name: description
      content: Overview of the convertChainIdToCoinType method in aa-core utils
  - - meta
    - property: og:description
      content: Overview of the convertChainIdToCoinType method in aa-core utils
---

# convertChainIdToCoinType

Converts an ethereum chain ID to an ENS coin type as per [ENSIP-11](https://docs.ens.domains/ens-improvement-proposals/ensip-11-evmchain-address-resolution) and assumes this is how mappings are stored for non mainnet chains.

::: tip Note
For mainnet, this method will return `60` as the coin type. This comes from [ensip-9](https://docs.ens.domains/ens-improvement-proposals/ensip-9-multichain-address-resolution).
:::

## Usage

::: code-group

```ts [example.ts]
import { convertChainIdToCoinType } from "@alchemy/aa-core";

const result = convertChainIdToCoinType(1);
// 60
```

:::

## Returns

### `number`

The converted coin type

## Parameters

### `chainId: number`

The chain ID to convert
