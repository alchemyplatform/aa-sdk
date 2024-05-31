---
title: getDefaultSimpleAccountFactoryAddress
description: Overview of the getDefaultSimpleAccountFactoryAddress method in aa-core utils
---

# getDefaultSimpleAccountFactoryAddress

Utility method that returns the default Simple Account Factory contract address for a given chain

## Usage

:::code-group

```ts [example.ts]
import { sepolia } from "@alchemy/aa-core";
import { getDefaultSimpleAccountFactoryAddress } from "@alchemy/aa-core";

const chain = sepolia;
const factoryAddress = getDefaultSimpleAccountFactoryAddress(chain);
```

:::

## Returns

### `Address`

The Address of the default Simple Account Factory contract address for the input chain

## Paramaters

### `chain: Chain`

The chain to get the default Simple Account Factory address for
