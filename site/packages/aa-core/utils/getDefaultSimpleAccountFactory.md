---
outline: deep
head:
  - - meta
    - property: og:title
      content: getDefaultSimpleAccountFactory
  - - meta
    - name: description
      content: Overview of the getDefaultSimpleAccountFactory method in aa-core utils
  - - meta
    - property: og:description
      content: Overview of the getDefaultSimpleAccountFactory method in aa-core utils
---

# getDefaultSimpleAccountFactory

Utility method that returns the default Simple Account Factory contrafct address for a given chain

## Usage

::: code-group

```ts [example.ts]
import { sepolia } from "viem/chains";
import { getDefaultSimpleAccountFactory } from "@alchemy/aa-core";

const chain = sepolia;
const factoryAddress = getDefaultSimpleAccountFactory(chain);
```

:::

## Returns

### `Address`

The Address of the default Simple Account Factory contrafct address for the input chain

## Paramters

### `chain: Chain`

The chain to get the default Simple Account Factory address for
