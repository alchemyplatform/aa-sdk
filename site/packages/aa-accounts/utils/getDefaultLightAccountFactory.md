---
outline: deep
head:
  - - meta
    - property: og:title
      content: getDefaultLightAccountFactory
  - - meta
    - name: description
      content: Overview of the getDefaultLightAccountFactory method in aa-accounts utils
  - - meta
    - property: og:description
      content: Overview of the getDefaultLightAccountFactory method in aa-accounts utils
---

# getDefaultLightAccountFactory

Utility method that returns the default Light Account Factory contrafct address for a given chain

## Usage

::: code-group

```ts [example.ts]
import { sepolia } from "viem/chains";
import { getDefaultLightAccountFactory } from "@alchemy/aa-accounts";

const chain = sepolia;
const factoryAddress = getDefaultLightAccountFactory(chain);
```

:::

## Returns

### `Address`

The Address of the default Light Account Factory contrafct address for the input chain

## Paramters

### `chain: Chain`

The chain to get the default Light Account Factory address for
