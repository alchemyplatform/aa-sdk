---
outline: deep
head:
  - - meta
    - property: og:title
      content: WithAlchemyGasManager
  - - meta
    - name: description
      content: Overview of the withAlchemyGasManager method on Alchemy Provider in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the withAlchemyGasManager method on Alchemy Provider in aa-alchemy
---

# WithAlchemyGasManager

`withAlchemyGasManager` is a method on `AlchemyProvider` that you can optionally call to create a new provider instance with added middleware leveraging the Alchemy Gas Manager (an [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) Paymaster). Under the hood, this will call the [`withAlchemyGasManager`](/packages/aa-alchemy/middleware/withAlchemyGasManager.ts).

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./alchemy-provider";

// use Alchemy Gas Manager to sponsorship transactions
const providerWithGasManager = provider.withAlchemyGasManager({
  policyId: PAYMASTER_POLICY_ID,
  entryPoint: ENTRYPOINT_ADDRESS,
});
```

<<< @/snippets/alchemy-provider.ts
:::
