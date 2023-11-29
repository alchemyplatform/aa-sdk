---
outline: deep
head:
  - - meta
    - property: og:title
      content: Middleware
  - - meta
    - name: description
      content: Overview of the Middleware methods in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the Middleware methods in aa-alchemy
---

# Middleware

The `aa-alchemy` package contains middleware you can use to easily leverage our Bundler(Rundler) (an [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) Bundler) and our Gas Manager (an [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) Paymaster).

Currently, `aa-alchemy` has implementations for:

1.  [`withAlchemyGasFeeEstimator`](/packages/aa-alchemy/middleware/withAlchemyGasFeeEstimator) -- estimates gas fees according to the expectations of the Alchemy Rundler.
2.  [`withAlchemyGasManager`](/packages/aa-alchemy/middleware/withAlchemyGasManager) -- adds the Alchemy Gas Manager middleware to the provider.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
import {
  withAlchemyGasFeeEstimator,
  withAlchemyGasManager,
} from "@alchemy/aa-alchemy";

// use Alchemy Gas Fee Estimator to estimate fees according to the expectations of the Alchemy Rundler.
// this is already set on AlchemyProvider, but you can always use the middleware directly to create a new instance.
const providerWithGasFeeEstimator = withAlchemyGasFeeEstimator(
  provider,
  50n,
  50n
);

// use Alchemy Gas Manager to sponsorship transactions
const providerWithGasManager = withAlchemyGasManager(
  provider,
  {
    policyId: PAYMASTER_POLICY_ID,
  },
  true // if true, uses `alchemy_requestGasAndPaymasterAndData`, otherwise uses `alchemy_requestPaymasterAndData`
);
```

<<< @/snippets/provider.ts
:::
