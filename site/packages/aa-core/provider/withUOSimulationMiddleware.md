---
outline: deep
head:
  - - meta
    - property: og:title
      content: ISmartAccountProvider • withUOSimulationMiddleware
  - - meta
    - name: description
      content: Overview of the withUOSimulationMiddleware method and accessing the simulateUOMiddleware readonly field on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the withUOSimulationMiddleware method and accessing the simulateUOMiddleware readonly field on ISmartAccountProvider
---

# withUOSimulationMiddleware

Adds a function to the end of the middleware call stack to simulate the constructed `UserOperation`. It can be used to override or add additional functionality, but the typical use case would be to simulate the `uoStruct` and throwing an error if the method for simulation fails, or just pass-through the chained `uoStruct` if simulation passes.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";

// Define the simulation middleware override function // [!code focus:99]
const SimulateUOMiddlewareOverrideFunction = async (uoStruct) => {
  try {
    const uoSimResult = await someMethodSimulatingTheUserOperation();
  } catch (e) {
    throw new Error(e);
  }

  return uoStruct;
};

// Add the custom middleware
provider.withUOSimulationMiddleware(SimulateUOMiddlewareOverrideFunction);

// function to call buildUserOperation which will simulate the user operation
const resultingUO = await provider.buildUserOperation(userOpData);
```

<<< @/snippets/provider.ts
:::

## Returns

### `ISmartAccountProvider`

An updated instance of the provider, which now uses the simulation middleware.

## Parameters

### `override: AccountMiddlewareFn`

The User Operation (UO) transform function that will run as the simulation middleware.

## `simulateUOMiddleware`

The `simulateUOMiddleware` is a readonly field that represents the final middleware step in the stack. It allows overriding any of the results returned by previous middlewares, but the typical use case would be to simulate the `uoStruct` and throwing an error if the method for simulation fails, and just pass-through the chained `uoStruct` if simulation passes.

You can access the current `simulateUOMiddleware` configuration for the provider via:

```ts
const currentMiddleware = provider.simulateUOMiddleware;
```
