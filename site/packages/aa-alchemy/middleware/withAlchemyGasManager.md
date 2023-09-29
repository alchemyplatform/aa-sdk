---
outline: deep
head:
  - - meta
    - property: og:title
      content: WithAlchemyGasManager
  - - meta
    - name: description
      content: Overview of the withAlchemyGasManager method in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the withAlchemyGasManager method in aa-alchemy
---

# WithAlchemyGasManager

The `WithAlchemyGasManager` package contains middleware to easily leverage the Alchemy Rundler (an [EIP-4337 Bundler](https://eips.ethereum.org/EIPS/eip-4337)), and Alchemy Gas Manager (an [EIP-4337 Paymaster](https://eips.ethereum.org/EIPS/eip-4337)).

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./alchemy-provider";
import { withAlchemyGasManager } from "@alchemy/aa-alchemy";

// use Alchemy Gas Manager to sponsorship transactions
const providerWithGasManager = withAlchemyGasManager(
  provider,
  {
    policyId: PAYMASTER_POLICY_ID,
    entryPoint: ENTRYPOINT_ADDRESS,
  },
  true // If true, uses `alchemy_requestGasAndPaymasterAndData`, otherwise uses `alchemy_requestPaymasterAndData`
);
```

<<< @/snippets/alchemy-provider.ts
:::
