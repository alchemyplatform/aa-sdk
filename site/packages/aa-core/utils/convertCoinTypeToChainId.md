---
outline: deep
head:
  - - meta
    - property: og:title
      content: convertCoinTypeToChainId
  - - meta
    - name: description
      content: Overview of the convertCoinTypeToChainId method in aa-core utils
  - - meta
    - property: og:description
      content: Overview of the convertCoinTypeToChainId method in aa-core utils
---

# convertCoinTypeToChainId

Converts a coinType into a chain ID. The conversion follows [ENSIP-11](https://docs.ens.domains/ens-improvement-proposals/ensip-11-evmchain-address-resolution).

::: tip Note
For mainnet, the conversion expects `coinType == 60`. This comes from [ENSIP-9](https://docs.ens.domains/ens-improvement-proposals/ensip-9-multichain-address-resolution).
:::

## Usage

::: code-group

```ts [example.ts]
import { convertCoinTypeToChainId } from "@alchemy/aa-core";

const result = convertCoinTypeToChainId(60);
// 1
```

:::

## Returns

### `number`

The chain ID

## Parameters

### `coinType: number`

The coinType to convert to a chain ID
