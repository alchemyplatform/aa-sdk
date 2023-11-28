---
outline: deep
head:
  - - meta
    - property: og:title
      content: ISmartAccountProvider • withPaymasterMiddleware
  - - meta
    - name: description
      content: Overview of the withPaymasterMiddleware method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the withPaymasterMiddleware method on ISmartAccountProvider
---

# withPaymasterMiddleware

Override the default dummy paymaster data middleware and paymaster data middleware which set the `paymasterAndData` field during `sendUserOperation` calls.

The `withPaymasterMiddleware` method has two overrides - `dummyPaymasterData` and `paymasterAndData` generator functions. This `dummyPaymasterData` is needed to estimate gas correctly when using a paymaster and is specific to the paymaster you're using. The second override is the actual `paymasterAndData` generator function. This function is called after gas estimation and fee estimation and is used to set the `paymasterAndData` field. The default `dummyPaymasterData` generator function returns `0x` for both the `paymasterAndData` fields. The default `paymasterAndData` generator function returns `0x` for both the `paymasterAndData` fields.

These middleware are often used together. The dummy paymaster data is used in gas estimation before we actually have paymaster data. Because the paymaster data has an impact on the gas estimation, it's good to supply dummy paymaster data that is valid for your paymaster contract.

It's recommend to use this middleware if you want more customization over the gas and fee estimation middleware, including setting non-default buffer values for the fee/gas estimation. You can also use `AlchemyProvider`'s [`withAlchemyGasManager`](/packages/aa-alchemy/provider/withAlchemyGasManager) method to simply the interface for these middleware.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";

// Define the DummyPaymasterDataMiddlewareOverrideFunction // [!code focus:99]
const DummyPaymasterDataMiddlewareOverrideFunction = async (uoStruct) => {
  // Return an object like {paymasterAndData: "0x..."} where "0x..." is the valid paymasterAndData for your paymaster contract (used in gas estimation)
  // You can even hardcode these dummy singatures
  // You can read up more on dummy signatures here: https://www.alchemy.com/blog/dummy-signatures-and-gas-token-transfers
  const paymasterAndData = await someFunctionToFetchDummyPaymasterAndData();

  return {
    paymasterAndData,
  };
};

// Define the PaymasterDataMiddlewareOverrideFunction // [!code focus:99]
const PaymasterDataMiddlewareOverrideFunction = async (uoStruct) => {
  // Return at minimum {paymasterAndData: "0x..."}, can also return gas estimates
  const paymasterAndData = await someFunctionToFetchPaymasterAndData();

  return {
    paymasterAndData,
  };
};

// Integrate the dummy paymaster data middleware and paymaster data middleware middleware with the provider
provider.withPaymasterMiddleware({
  DummyPaymasterDataMiddlewareOverrideFunction,
  PaymasterDataMiddlewareOverrideFunction,
});

// Define the user operation data
const userOpData = {
  target: "0xTARGET_ADDRESS", // Replace with your actual target address
  data: "0xSOME_DATA", // Replace with your actual data
};

const resultingUO = await provider.buildUserOperation(userOpData);
console.log("Modified paymasterAndData:", resultingUO.paymasterAndData);
```

<<< @/snippets/provider.ts
:::

## Returns

### `ISmartAccountProvider`

An updated instance of the provider, which now uses the overridden `dummyPaymasterDataMiddleware` and/or `paymasterDataMiddleware` middlewares.

## Parameters

### `overrides: {dummyPaymasterDataMiddleware, paymasterDataMiddleware}`

- `dummyPaymasterDataMiddleware?: PaymasterAndDataMiddleware` - `dummyPaymasterData` generator function specific to the paymaster you are using to estimate gas correctly. Default: `0x` for both the `paymasterAndData` fields. You should implement your own middleware to override these or extend this class and provider your own implemenation.
- `paymasterDataMiddleware?: PaymasterAndDataMiddleware` - `paymasterAndData` generator function called after gas estimation and fee estimated used to set the `paymasterAndData` field. Default: `0x` for both the `paymasterAndData` fields. These are dependent on the specific paymaster being used. You should implement your own middleware to override these or extend this class and provider your own implemenation.

## `dummyPaymasterDataMiddleware`

The `dummyPaymasterDataMiddleware` is a readonly field on the `ISmartAccountProvider` interface that represents the default dummy paymaster data middleware. It's used to set the `paymasterAndData` fields on a `UserOperation` (UO).

You can access the current dummy paymaster data middleware configuration for the provider via:

```ts
const currentDummyPaymasterDataMiddleware =
  provider.dummyPaymasterDataMiddleware;
```

## `paymasterDataMiddleware`

The `paymasterDataMiddleware` is a readonly field on the `ISmartAccountProvider` interface that represents the default paymaster data middleware. It's used to set the `paymasterAndData` field on a UO.

You can access the current paymaster data middleware configuration for the provider via:

```ts
const currentPaymasterDataMiddleware = provider.paymasterDataMiddleware;
```
