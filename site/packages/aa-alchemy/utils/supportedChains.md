---
outline: deep
head:
  - - meta
    - property: og:title
      content: Utils • SupportedChains
  - - meta
    - name: description
      content: Overview of the SupportedChains util method in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the SupportedChains util method in aa-alchemy
next:
  text: aa-accounts
---

# SupportedChains

`SupportedChains` provides a mapping from chain ID to a viem `Chain` object for all chains supported by the Alchemy RPC. This util includes mappings for both supported mainnets and supported testnets.

## Usage

::: code-group

```ts [example.ts]
import { SupportedChains } from "@alchemy/aa-alchemy";

// eth mainnet
const mainnet = SupportedChains.get(1);

// bsc mainnet is unsupported, so the variable will be undefined
const bsc = SupportedChains.get(56);
```

:::

## Returns

### `Chain`

the associated viem `Chain` object.

## Parameters

### `chainId: number` -- the struct containig UserOperation fields, where each field may be asychronously returned from the middleware used to generate its final value.
