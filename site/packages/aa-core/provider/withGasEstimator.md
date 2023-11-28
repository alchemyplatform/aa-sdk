---
outline: deep
head:
  - - meta
    - property: og:title
      content: ISmartAccountProvider • withGasEstimator
  - - meta
    - name: description
      content: Overview of the withGasEstimator method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the withGasEstimator method on ISmartAccountProvider
---

# withGasEstimator

Override the [`gasEstimator`](#gasEstimator) middleware.

This middleware is used for setting the `callGasLimit`, `preVerificationGas`, and `verificationGasLimit` fields on the `UserOperation` (UO) prior to its execution. This middleware is between the `feeDataGetter` middleware and the `paymasterDataMiddleware`.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";

// Define the GasEstimatorMiddlewareOverrideFunction // [!code focus:99]
const GasEstimatorMiddlewareOverrideFunction = async () => {
  // For demonstration purposes, we're setting hardcoded gas values.
  // In a real-world scenario, you might fetch these values from a service
  // Or make other determinations.
  return {
    callGasLimit: 0n,
    preVerificationGas: 0n,
    verificationGasLimit: 0n,
  };
};

// Integrate the custom gas estimator middleware with the provider
provider.withGasEstimator(GasEstimatorMiddlewareOverrideFunction);

// Define the user operation data
const userOpData = {
  target: "0xTARGET_ADDRESS", // Replace with your actual target address
  data: "0xSOME_DATA", // Replace with your actual data
};

const resultingUO = await provider.buildUserOperation(userOpData);
console.log("Modified callGasLimit:", resultingUO.callGasLimit);
console.log("Modified preVerificationGas:", resultingUO.preVerificationGas);
console.log("Modified verificationGasLimit:", resultingUO.verificationGasLimit);
```

<<< @/snippets/provider.ts
:::

## Returns

### `SmartAccountProvider`

An updated instance of the provider, which now uses the overridden `gasEstimator` middleware.

## Parameters

### `override: GasEstimatorMiddleware`

A function for overriding the default gas estimator middleware. This middleware is specifically utilized to set the gas-related fields (`callGasLimit`, `preVerificationGas`, and `verificationGasLimit`) on the UO before it's executed.

## `gasEstimator`

The `gasEstimator` is a readonly field on the `ISmartAccountProvider` interface that represents the default gas estimator middleware.

It's used to set the gas-related fields on a UO by making calls to the connected `rpcClient` to estimate the user operation gas limits.

You can access the current fee data getter configuration for the provider via:

```ts
const currentGasEstimator = provider.gasEstimator;
```
