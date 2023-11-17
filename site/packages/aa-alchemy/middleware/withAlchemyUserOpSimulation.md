---
outline: deep
head:
  - - meta
    - property: og:title
      content: Middleware • withAlchemyUserOpSimulation
  - - meta
    - name: description
      content: Overview of the withAlchemyUserOpSimulation method in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the withAlchemyUserOpSimulation method in aa-alchemy
next:
  text: Utils
---

# withAlchemyUserOpSimulation

`withAlchemyUserOpSimulation` is a middleware method you can use to easily leverage the [`alchemy_simulateUserOperationAssetChanges`](https://docs.alchemy.com/reference/alchemy-simulateuseroperationassetchanges) API to simulate asset changes resulting from user operation. Having this as part of your middleware stack will ensure `UserOperations` that fail simulation do not get sent unnecessarily.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
import { withAlchemyUserOpSimulation } from "@alchemy/aa-alchemy";

// use Alchemy UserOperation Simulation API to simulate asset changes resulting from user operation
const providerWithUserOpSimulation = withAlchemyUserOpSimulation(provider);
```

<<< @/snippets/provider.ts
:::

## Returns

### `AlchemyProvider`

A new instance of an `AlchemyProvider` with the same attributes as the input, now with middleware for accessing the Alchemy `UserOperation` Simulation API to simulate asset changes resulting from UserOperations.

## Parameters

### `provider: AlchemyProvider` -- an `AlchemyProvider` instance
