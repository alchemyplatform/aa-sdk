---
outline: deep
head:
  - - meta
    - property: og:title
      content: Middleware • alchemyUserOperationSimulator
  - - meta
    - name: description
      content: Overview of the alchemyUserOperationSimulator method in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the alchemyUserOperationSimulator method in aa-alchemy
next:
  text: Utils
---

# alchemyUserOperationSimulator

`alchemyUserOperationSimulator` is a middleware method you can use to easily leverage the [`alchemy_simulateUserOperationAssetChanges`](https://docs.alchemy.com/reference/alchemy-simulateuseroperationassetchanges/?a=ak-docs) API to simulate asset changes resulting from user operation. Having this as part of your middleware stack will ensure `UserOperations` that fail simulation do not get sent unnecessarily.

## Usage

```ts [example.ts]
import {
  alchemyUserOperationSimulator,
  createAlchemyRpcClient,
} from "@alchemy/aa-alchemy";
import { createSmartAccountClient } from "@alchemy/aa-core";
import { http } from "viem";
import { sepolia } from "viem/chains";

const alchemyClient = createAlchemyRpcClient({
  transport: http("ALCHEMY_RPC_URL"),
  chain: sepolia,
});

// use Alchemy to simulate User Ops
const clientWithUserOpSimulator = createSmartAccountClient({
  ...config,
  userOperationSimulator: alchemyUserOperationSimulator(alchemyClient),
});
```

## Returns

### `ClientMiddlewareFn`

A `ClientMiddlewareFn` that will simulate a user operation using the Alchemy UserOperation Simulation API.

## Parameters

### `client: ClientWithAlchemyMethods` -- an `PublicClient` that is connected to Alchemy's RPC
