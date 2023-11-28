---
outline: deep
head:
  - - meta
    - property: og:title
      content: AlchemyProvider • withAlchemyUserOpSimulation
  - - meta
    - name: description
      content: Overview of the withAlchemyUserOpSimulation method on Alchemy Provider in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the withAlchemyUserOpSimulation method on Alchemy Provider in aa-alchemy
next:
  text: Middleware
---

# withAlchemyUserOpSimulation

`withAlchemyUserOpSimulation` is a method on `AlchemyProvider` that you can optionally call to create a new provider instance with added middleware leveraging the Alchemy `UserOperation` (UO) Simulation API. Under the hood, this will call the [`withAlchemyUserOpSimulation`](/packages/aa-alchemy/middleware/withAlchemyUserOpSimulation) middleware to simulate asset changes resulting from user operation.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]

// use Alchemy UserOperation Simulation API to simulate simulate asset changes resulting from user operation before sending
const providerWithGasManager = provider.withAlchemyUserOpSimulation();
```

<<< @/snippets/provider.ts
:::

## Returns

### `AlchemyProvider`

A new instance of an `AlchemyProvider` with the same attributes as the input, now with middleware for accessing the Alchemy UO Simulation API to simulate asset changes resulting from user operation.
