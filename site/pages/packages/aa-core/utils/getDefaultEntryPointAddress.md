---
title: getDefaultEntryPointAddress
description: Overview of the getDefaultEntryPointAddress method in aa-core utils
---

# getDefaultEntryPointAddress

Utility method that returns the default EntryPoint contract address for a given chain

## Usage

:::code-group

```ts [example.ts]
import { sepolia } from "@alchemy/aa-core";
import { getDefaultEntryPointAddress } from "@alchemy/aa-core";

const chain = sepolia;
const entryPointAddress = getDefaultEntryPointAddress(chain);
```

:::

## Returns

### `Address`

The Address of the default EntryPoint contract for the input chain

## Paramaters

### `chain: Chain`

The chain to get the default EntryPoint contract address for
