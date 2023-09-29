---
outline: deep
head:
  - - meta
    - property: og:title
      content: AlchemyProvider • gasEstimator
  - - meta
    - name: description
      content: Overview of the gasEstimator method on Alchemy Provider in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the gasEstimator method on Alchemy Provider in aa-alchemy
---

# GasEstimator

`gasEstimator` is an override of the same middleware on `SmartAccountProvider`. As part of the middleware stack that the `AlchemyProvider` would run on each UO built and sent, this middleware estimates gas using the Alchemy Rundler (an [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) Bundler), and updates `callGasLimit`, `verificationGasLimit`, and `preVerificationGas` in a UO request with appropriate buffers.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";

// building a UO struct will use the overrided `gasEstimator` middleware on AlchemyProvider
const uoStruct = await provider.buildUserOperation({
  target: TO_ADDRESS,
  data: ENCODED_DATA,
  value: VALUE, // optional
});
const uoHash = await provider.sendUserOperation(uoStruct);
```

<<< @/snippets/alchemy-provider.ts
:::
