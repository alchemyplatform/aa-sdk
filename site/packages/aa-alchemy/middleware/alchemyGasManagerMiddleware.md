---
outline: deep
head:
  - - meta
    - property: og:title
      content: Middleware • alchemyGasManagerMiddleware
  - - meta
    - name: description
      content: Overview of the alchemyGasManagerMiddleware method in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the alchemyGasManagerMiddleware method in aa-alchemy
---

# alchemyGasManagerMiddleware

`alchemyGasManagerMiddleware` is a middleware method you can use to easily leverage our Gas Manager (an [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) Paymaster) for sponsoring user operations.

## Usage

::: code-group

```ts [example.ts]
import {
  alchemyGasManagerMiddleware,
  createAlchemyRpcClient,
} from "@alchemy/aa-alchemy";
import { createSmartAccountClient } from "@alchemy/aa-core";
import { http } from "viem";
import { sepolia } from "viem/chains";

const alchemyClient = createAlchemyRpcClient({
  transport: http("ALCHEMY_RPC_URL"),
  chain: sepolia,
});

// Use this middleware generator to set up your account to use Alchemy's Gas Manager Service
const clientAlchemyGasManager = createSmartAccountClient({
  ...config,
  ...alchemyGasManagerMiddleware(alchemyClient, {
    policyId: PAYMASTER_POLICY_ID,
  }),
});
```

:::

## Returns

### `{ feeEstimator: ClientMiddlewareFn, paymasterAndData: ClientMiddlewareFn, dummyPaymasterAndData: ClientMiddlewareFn, gasEstimator: ClientMiddlewareFn }`

A set of `ClientMiddlewareFn` that will get the paymaster and data fields from Alchemy's Gas Manager, and optionally do gas / fee estimation.

## Parameters

### `client: ClientWithAlchemyMethods` -- an `PublicClient` that is connected to Alchemy's RPC

### `AlchemyGasManagerConfig: AlchemyGasManagerConfig`

- `policyId: string` -- the Gas Manager policy ID

- `gasEstimationOptions?: AlchemyGasEstimationOptions` -- optional params for configuring gas estimation during paymaster resolution
  - `disableGasEstimation?: boolean` -- if true, then gas estimation will be done locally instead of requesting it from the paymaster endpoint
