---
title: getChain
description: Overview of the getChain method in aa-core utils
---

# getChain

This is a utility method for converting a chainId to a `viem` `Chain` object

## Usage

:::code-group

```ts [example.ts]
import { getChain } from "@alchemy/aa-core";

const result = getChain(1);
// mainnet
```

:::

## Returns

### `Chain`

a `viem` [`Chain`](https://github.com/wagmi-dev/viem/blob/main/src/types/chain.ts) object

## Parameters

### `chainId: number`

The chainId to convert to a `Chain` object
