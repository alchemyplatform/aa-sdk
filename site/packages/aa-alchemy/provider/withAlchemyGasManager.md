---
outline: deep
head:
  - - meta
    - property: og:title
      content: AlchemyProvider • withAlchemyGasManager
  - - meta
    - name: description
      content: Overview of the withAlchemyGasManager method on Alchemy Provider in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the withAlchemyGasManager method on Alchemy Provider in aa-alchemy
---

# withAlchemyGasManager

`withAlchemyGasManager` is a method on `AlchemyProvider` that you can optionally call to create a new provider instance with added middleware leveraging the Alchemy Gas Manager (an [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) Paymaster). Under the hood, this will call the [`withAlchemyGasManager`](/packages/aa-alchemy/middleware/withAlchemyGasManager.ts).

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]

// use Alchemy Gas Manager to sponsorship transactions
const providerWithGasManager = provider.withAlchemyGasManager({
  policyId: PAYMASTER_POLICY_ID,
  entryPoint: ENTRYPOINT_ADDRESS,
});
```

<<< @/snippets/provider.ts
:::

## Returns

### `AlchemyProvider`

A new instance of an `AlchemyProvider` with the same attributes as the input, now with middleware for accessing the Alchemy Gas Manager to sponsor UserOperations.

## Parameters

### `config: AlchemyGasManagerConfig`

- `policyId: string` -- the Alchemy Gas Manager policy ID
- `entryPoint: Address` -- the entrypoint contract address for the chain the provider is used for
