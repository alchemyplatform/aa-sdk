---
outline: deep
head:
  - - meta
    - property: og:title
      content: AlchemyProvider
  - - meta
    - name: description
      content: Overview of the AlchemyProvider class in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the AlchemyProvider class in aa-alchemy
---

# AlchemyProvider

`AlchemyProvider` is an extension of the `SmartAccountProvider` implementation. It's a simpler interface you can use to leverage the Alchemy stack - JSON-RPC requests via API Key or JSON Web Token (JWT), Alchemy Rundler (an [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) Bundler), and Alchemy Gas Manager (an [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) Paymaster).

Notable differences between `AlchemyProvider` and `SmartAccountProvider` are implementations for:

1.  [`gasEstimator`](/packages/aa-alchemy/provider/gasEstimator) -- overrides the `SmartAccountProvider` gas estimator.
2.  [`withAlchemyGasManager`](/packages/aa-alchemy/provider/withAlchemyGasManager) -- adds the Alchemy Gas Manager middleware to the provider.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
// building a UO struct will use the overrided `gasEstimator` middleware on AlchemyProvider
const uoStruct = await provider.buildUserOperation({
  target: TO_ADDRESS,
  data: ENCODED_DATA,
  value: VALUE, // optional
});
const uoHash = await provider.sendUserOperation(uoStruct);

// use Alchemy Gas Manager to sponsorship transactions
const providerWithGasManager = provider.withAlchemyGasManager({
  policyId: PAYMASTER_POLICY_ID,
  entryPoint: ENTRYPOINT_ADDRESS,
});
```

<<< @/snippets/provider.ts
:::
