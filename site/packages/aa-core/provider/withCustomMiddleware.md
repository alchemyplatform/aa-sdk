---
outline: deep
head:
  - - meta
    - property: og:title
      content: ISmartAccountProvider • withCustomMiddleware
  - - meta
    - name: description
      content: Overview of the withCustomMiddleware method and accessing the customMiddleware readonly field on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the withCustomMiddleware method and accessing the customMiddleware readonly field on ISmartAccountProvider
---

# withCustomMiddleware

Adds a function to the end of the middleware call stack before signature verification. It can be used to override or add additional functionality. Like modifying the user operation, making an additional RPC call, or logging data.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";

// Define the custom middleware override function // [!code focus:99]
// The function below just changes the call data for the userOp
// But you can do anything you want here
const CustomMiddlewareOverrideFunction = async (uoStruct) => {
  uoStruct.callData = "0xNEW_CALL_DATA"; // Changing the call data
  return uoStruct;
};

// Add the custom middleware
provider.withCustomMiddleware(CustomMiddlewareOverrideFunction);

// Defining the user operation data
const userOpData = {
  target: "0xTARGET_ADDRESS", // Replace with the actual target address
  data: "0xSOME_DATA", // Replace with the actual data
};

// function to call buildUserOperation and log the modified callData
const resultingUO = await provider.buildUserOperation(userOpData);
console.log("Modified callData:", resultingUO.callData);
```

<<< @/snippets/provider.ts
:::

## Returns

### `ISmartAccountProvider`

An updated instance of the provider, which now uses the custom middleware.

## Parameters

### `override: AccountMiddlewareFn`

The User Operation (UO) transform function that will run as the custom middleware.

## `customMiddleware`

The `customMiddleware` is a readonly field that represents the final middleware step in the stack. It allows overriding any of the results returned by previous middlewares, ensuring customized processing of user operations.

You can access the current middleware configuration for the provider via:

```ts
const currentMiddleware = provider.customMiddleware;
```
