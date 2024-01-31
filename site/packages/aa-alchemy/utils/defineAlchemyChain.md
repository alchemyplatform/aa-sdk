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

# defineAlchemyChain

`defineAlchemyChain` allows you to extend a `viem` chain if it is not configured with Alchemy's RPC Url. This is useful `@alchemy/aa-core` does not export a chain you can use with the Alchemy Clieny.

## Usage

::: code-group

```ts [example.ts]
import { defineAlchemyChain } from "@alchemy/aa-alchemy";
import { mainnet } from "viem";

// eth mainnet
const mainnetWithAlch = defineAlchemyChain({
  chain: mainnet,
  rpcBaseUrl: "https://eth-mainnet.g.alchemy.com/v2/",
});
```

:::

## Returns

### `Chain`

the associated viem `Chain` object.

## Parameters

### `config: AlchemyChainConfig`

- `chain: Chain` -- the chain you want to extend
- `rpcBaseUrl: string` -- the Alchemy RPC Url for the chain (without the API Key appended)
