---
outline: deep
head:
  - - meta
    - property: og:title
      content: Utils
  - - meta
    - name: description
      content: Overview of the Utils methods in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the Utils methods in aa-alchemy
---

# Utils

`aa-alchemy` offers util methods to speed up your development with `AlchemyProvider`.

Notable util methods include:

1.  [`SupportedChains`](/packages/aa-alchemy/utils/supportedChains) -- calls `eth_estimateUserOperationGas` and returns the result.

## Usage

::: code-group

```ts [example.ts]
import { SupportedChains } from "@alchemy/aa-alchemy";

// eth mainnet
const mainnet = SupportedChains.get(1);

// bsc is unsupported, so the variable will be undefined
const bsc = SupportedChains.get(56);
```

:::
