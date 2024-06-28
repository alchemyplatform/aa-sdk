---
title: EthersProviderAdapter • constructor
description: Overview of the constructor method on EthersProviderAdapter in aa-ethers
---

# constructor

There are two ways to construct `EthersProviderAdapter`. You can provide either the `rpcProvider` and `chainId` to have the `EthersProviderAdapter` constructor, which will initialize the `SmartAccountClient` using the input parameters internally.

Or you can also input a `SmartAccountClient` instance already initialized (`AlchemyProvider` for instance) to the `EthersProviderAdapter` constructor.

## Usage

```ts [example.ts]
import { createAlchemySmartAccountClient } from "@account-kit/infra";
import { getDefaultEntryPointAddress } from "@aa-sdk/core";
import { EthersProviderAdapter } from "@aa-sdk/ethers";
import { sepolia } from "@aa-sdk/core";

// one way to initialize
export const provider = new EthersProviderAdapter({
  rpcProvider: "ALCHEMY_RPC_URL",
  chainId: 80001,
});

// another way to initialize
export const accountProvider = createAlchemySmartAccountClient({
  apiKey: "ALCHEMY_API_KEY", // replace with your Alchemy API Key
  chain: sepolia,
  opts: {
    txMaxRetries: 10,
    txRetryIntervalMs: 2_000,
    txRetryMultiplier: 1.5,
    minPriorityFeePerBid: 100_000_000n,
    feeOpts: {
      baseFeeBufferMultiplier: 1.5,
      maxPriorityFeeBufferMultiplier: 1.5,
      preVerificationGasBufferMultiplier: 1.5,
    },
  },
});

export const anotherProvider = new EthersProviderAdapter({
  accountProvider,
});
```

## Returns

### `EthersProviderAdapter`

A new instance of an `EthersProviderAdapter`.

## Parameters

### `opts: EthersProviderAdapterOpts`

Either:

- `rpcProvider: string | BundlerClient` -- a JSON-RPC URL, or a viem Client that supports ERC-4337 methods and Viem public actions. See [createBundlerClient](/packages/aa-core/bundler-client/).

- `chainId: number` -- the ID of the chain on which to create the provider.

Or:

- `accountProvider: SmartAccountClient` -- See [SmartAccountClient](/packages/aa-core/smart-account-client/).
