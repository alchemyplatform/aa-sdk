---
outline: deep
head:
  - - meta
    - property: og:title
      content: WithAlchemyGasFeeEstimator
  - - meta
    - name: description
      content: Overview of the withAlchemyGasFeeEstimator method in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the withAlchemyGasFeeEstimator method in aa-alchemy
---

# WithAlchemyGasFeeEstimator

The `withAlchemyGasFeeEstimator` middleware method to easily leverage the Alchemy Rundler (an [EIP-4337 Bundler](https://eips.ethereum.org/EIPS/eip-4337)) for estimating gas fees.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./alchemy-provider";
import { withAlchemyGasFeeEstimator } from "@alchemy/aa-alchemy";

// use Alchemy Gas Fee Estimator to estimate gas fees according to the expectations of the Alchemy Rundler.
// this is already set on AlchemyProvider, but you can always use the middleware directly to create a new instance.
const providerWithGasFeeEstimator = withAlchemyGasFeeEstimator(
  provider,
  50n,
  50n
);
```

<<< @/snippets/alchemy-provider.ts
:::
