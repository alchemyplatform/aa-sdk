---
title: Middleware • alchemyFeeEstimator
description: Overview of the alchemyFeeEstimator method in aa-alchemy
---

# alchemyFeeEstimator

`alchemyFeeEstimator` is a middleware method you can use to easily leverage Rundler (an [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) Bundler) for estimating gas fees for user operations.

## Usage

```ts [example.ts]
import {
  alchemyFeeEstimator,
  createAlchemyRpcClient,
} from "@alchemy/aa-alchemy";
import { createSmartAccountClient } from "@alchemy/aa-core";
import { http } from "viem";
import { sepolia } from "viem/chains";

const alchemyClient = createAlchemyRpcClient({
  transport: http("ALCHEMY_RPC_URL"),
  chain: sepolia,
});

// use Alchemy Gas Fee Estimator to estimate gas fees according to the expectations of Rundler.
const clientWithGasFeeEstimator = createSmartAccountClient({
  ...config,
  feeEstimator: alchemyFeeEstimator(alchemyClient),
});
```

## Returns

### `ClientMiddlewareFn`

A `ClientMiddlewareFn` that will estimate fees using the Rundler.

## Parameters

### `client: ClientWithAlchemyMethods` -- an `PublicClient` that is connected to Alchemy's RPC
