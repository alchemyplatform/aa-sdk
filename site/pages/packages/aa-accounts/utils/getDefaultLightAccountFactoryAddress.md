---
title: getDefaultLightAccountFactoryAddress
description: Overview of the getDefaultLightAccountFactoryAddress method in
  aa-accounts utils
---

# getDefaultLightAccountFactoryAddress

Utility method that returns the default Light Account Factory contract address for a given chain

## Usage

```ts
import { sepolia } from "@alchemy/aa-core";
import { getDefaultLightAccountFactoryAddress } from "@alchemy/aa-accounts";

const chain = sepolia;
const factoryAddress = getDefaultLightAccountFactoryAddress(chain);
```

## Returns

### `Address`

The Address of the default Light Account Factory contract address for the input chain

## Paramaters

### `chain: Chain`

The chain to get the default Light Account Factory address for
