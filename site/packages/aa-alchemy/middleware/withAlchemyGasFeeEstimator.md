---
outline: deep
head:
  - - meta
    - property: og:title
      content: Middleware • withAlchemyGasFeeEstimator
  - - meta
    - name: description
      content: Overview of the withAlchemyGasFeeEstimator method in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the withAlchemyGasFeeEstimator method in aa-alchemy
---

# withAlchemyGasFeeEstimator

`withAlchemyGasFeeEstimator` is a middleware method you can use to easily leverage the Alchemy Rundler (an [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) Bundler) for estimating gas fees for user operations.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
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
