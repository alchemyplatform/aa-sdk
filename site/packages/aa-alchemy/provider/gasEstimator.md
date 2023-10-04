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

# gasEstimator

`gasEstimator` is an override of the same middleware on `SmartAccountProvider`. As part of the middleware stack that the `AlchemyProvider` would run on each UO built and sent, this middleware estimates gas using the Alchemy Rundler (an [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) Bundler), and updates `callGasLimit`, `verificationGasLimit`, and `preVerificationGas` in a UO request with appropriate buffers.

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
```

<<< @/snippets/provider.ts
:::

## Returns

### `Promise<Deferrable<UserOperationStruct>>`

the resulting user operation struct after gas estimation, run as part of a middleware chain when building and sending UserOperations.

## Parameters

### `struct: Deferrable<UserOperationStruct>` -- the struct containing UserOperation fields, where each field may be asychronously returned from the middleware used to generate its final value.

Note: You typically will call this method as part of a middleware chain when building and sending UserOperations, so the parameters of `UserOperationStruct` should be generated for you, as long as you pass in the initial parameters needed for [sendUserOperation](/packages/aa-core/provider/sendUserOperation).
