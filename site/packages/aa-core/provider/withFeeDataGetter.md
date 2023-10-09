---
outline: deep
head:
  - - meta
    - property: og:title
      content: ISmartAccountProvider • withFeeDataGetter
  - - meta
    - name: description
      content: Overview of the withFeeDataGetter method and accessing the feeDataGetter readonly field on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the withFeeDataGetter method and accessing the feeDataGetter readonly field on ISmartAccountProvider
---

# withFeeDataGetter

Overrides the default [`feeDataGetter`](#feedatagetter) middleware. This middleware is used for setting the `maxFeePerGas` and `maxPriorityFeePerGas` fields on the `UserOperation` prior to its execution.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";

// Define the FeeDataMiddlewareOverrideFunction // [!code focus:99]
const FeeDataMiddlewareOverrideFunction = async (uoStruct) => {
  // For demonstration purposes, we're setting hardcoded fee values.
  // In a real-world scenario, you might fetch these values from a service
  // Or make other determinations.

  // Setting the max fee per gas
  uoStruct.maxFeePerGas = "0x500";

  // Setting the max priority fee per gas
  uoStruct.maxPriorityFeePerGas = "0x50";

  return uoStruct;
};

// Integrate the custom fee data middleware with the provider
provider.withFeeDataGetter(FeeDataMiddlewareOverrideFunction);

// Define the user operation data
const userOpData = {
  target: "0xTARGET_ADDRESS", // Replace with your actual target address
  data: "0xSOME_DATA", // Replace with your actual data
};

const resultingUO = await provider.buildUserOperation(userOpData);
console.log("Modified maxFeePerGas:", resultingUO.maxFeePerGas);
console.log(
  "Modified maxPriorityFeePerGas:",
  resultingUO.maxPriorityFeePerGas
);
```

<<< @/snippets/provider.ts
:::

## Returns

### `ISmartAccountProvider`

An updated instance of the provider, which now uses the overridden `feeDataGetter` middleware.

## Parameters

### `override: FeeDataMiddleware`

A function for overriding the default `feeDataGetter` middleware. This middleware is specifically utilized to set the fee-related fields (`maxFeePerGas` and `maxPriorityFeePerGas`) on the `UserOperation` before it's executed.

## `feeDataGetter`

The `feeDataGetter` is a readonly field on the `ISmartAccountProvider` interface that represents the default fee data getter middleware. It's used to set the fee-related fields on a `UserOperation` by making calls to the connected `rpcClient` to estimate the maximum priority fee per gas and retrieve fee data.

You can access the current fee data getter configuration for the provider via:

```ts
const currentFeeDataGetter = provider.feeDataGetter;
```
