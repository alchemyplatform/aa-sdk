---
title: Alchemy Smart Account Client
description: Overview of the Alchemy Smart Account Client in aa-alchemy
---

# Alchemy Smart Account Client

To create an `AlchemySmartAccountClient`, you must provide a set of parameters detailed below. For Fraxtal, Fraxtal Testnet, Zora, and Zora Sepolia networks, `apiKey` and `jwt `provide an `rpcUrl` from a RPC provider since Alchemy currently only supports Account Abstraction for these networks. Please refer to documentation from [Frax](https://docs.frax.com/fraxtal/network/network-information) and [Zora](https://docs.zora.co/docs/zora-network/network) about RPC options.

## Usage

```ts [example.ts]
import { createAlchemySmartAccountClient } from "@alchemy/aa-alchemy";
import { getDefaultEntryPointAddress } from "@alchemy/aa-core";
import { sepolia } from "@alchemy/aa-core";

// instantiates using every possible parameter, as a reference
export const client = createAlchemySmartAccountClient({
  /// REQUIRED ///
  apiKey: "ALCHEMY_API_KEY", // replace with your Alchemy API Key
  chain: sepolia,
  /// OPTIONAL ///
  opts: {
    txMaxRetries: 10,
    txRetryIntervalMs: 2_000,
    txRetryMultiplier: 1.5,
    minPriorityFeePerBid: 100_000_000n,
    feeOpts: {
      baseFeeBufferMultiplier: 1.5n,
      maxPriorityFeeBufferMultiplier: 1.05,
      preVerificationGasBufferMultiplier: 1.05,
    },
  },
  // will simulate user operations before sending them to ensure they don't revert
  useSimulation: true,
  // if you want to use alchemy's gas manager
  gasManagerConfig: {
    policyId: "policy-id",
  },
});
```

## Returns

### `AlchemySmartAccountClient`

A new instance of an `AlchemySmartAccountClient`.

## Parameters

### `config: AlchemySmartAccountClientConfig`

- `rpcUrl: string | undefined | never` -- a JSON-RPC URL. This is required if there is no `apiKey`.

- `apiKey: string | undefined | never` -- an Alchemy API Key. This is required if there is no `rpcUrl` or `jwt`.

- `jwt: string | undefined | never` -- an Alchemy JWT (JSON web token). This is required if there is no `apiKey`.

- `useSimulation: boolean` -- [optional] -- whether or not to simulate User Operations before sending them to ensure they don't revert

- `gasManagerConfig: AlchemyGasManagerConfig` -- [optional] if you want to use Alchemy's gas manager to sponsor gas.

  - `policyId: string` -- the policy id of the gas manager you want to use.
  - `gasEstimationOptions: AlchemyGasEstimationOptions` -- [optional] optional option configurable for the gas estimation portion of the Alchemy gas manager
  - `paymasterAddress: Address` -- [optional] paymaster address to use for the gas estimation. If not provided, the default paymaster address for the chain will be used.
  - `dummyData: Hex` -- [optional] dummy paymaster data to use for the gas estimation. If not provided, the default dummy data string will be used.

- `...accountParams`: CreateLightAccountParams -- additional parameters to pass to the [`createLightAccount`](/packages/aa-accounts/light-account/#createlightaccount).

- `...clientParams` -- [optional] additional parameters to pass to the [`SmartAccountClient`](/packages/aa-core/smart-account-client/) constructor.
