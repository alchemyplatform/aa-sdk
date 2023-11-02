---
outline: deep
head:
  - - meta
    - property: og:title
      content: AlchemyProvider • constructor
  - - meta
    - name: description
      content: Overview of the constructor method on Alchemy Provider in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the constructor method on Alchemy Provider in aa-alchemy
---

# constructor

To initialize the Alchemy Provider

## Usage

::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { sepolia } from "viem/chains";

export const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY", // replace with your Alchemy API Key
  chain: sepolia,
});
```

:::

## Returns

### `AlchemyProvider`

A new instance of an `AlchemyProvider`.

## Parameters

### `config: AlchemyGasManagerConfig`

- `policyId: string` -- the Alchemy Gas Manager policy ID
