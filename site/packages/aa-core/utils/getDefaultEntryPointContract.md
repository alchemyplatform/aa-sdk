---
outline: deep
head:
  - - meta
    - property: og:title
      content: getDefaultEntryPointContract
  - - meta
    - name: description
      content: Overview of the getDefaultEntryPointContract method in aa-core utils
  - - meta
    - property: og:description
      content: Overview of the getDefaultEntryPointContract method in aa-core utils
---

# getDefaultEntryPointContract

Utility method that returns the default EntryPoint contrafct address for a given chain

## Usage

::: code-group

```ts [example.ts]
import { sepolia } from "viem/chains";
import { getDefaultEntryPointContract } from "@alchemy/aa-core";

const chain = sepolia;
const entryPointAddress = getDefaultEntryPointContract(chain);
```

:::

## Returns

### `Address`

The Address of the default EntryPoint contrafct for the input chain

## Paramters

### `chain: Chain`

The chain to get the default EntryPoint contract address for
