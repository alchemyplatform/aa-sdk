---
title: 3rd Paymasters
description: Learn how to use a 3rd party Paymaster with Account Kit
---

# Using a third-party paymaster

The `SmartAccountClient` within `@alchemy/aa-core` is unopinionated about which paymaster you use, so you can connect to any paymaster really simply. Configuration is done using the `paymasterAndData` config option when you call `createSmartAccountClient`.

## Usage

```ts
import { createSmartAccountClient } from "@alchemy/aa-core";
import { sepolia } from "viem";

const chain = sepolia;
const client = createSmartAccountClient({
  chain,
  transport: http("RPC_URL"),
  paymasterAndData: {
    // sets the dummy paymasterAndData with paymaster address appended with some dummy paymasterData
    // that looks like a valid paymasterData
    dummyPaymasterAndData: () =>
      `<PAYMASTER_ADDRESS><PAYMASTER_DUMMY_DATA>` as Hex,
    paymasterAndData: async (userop, opts) => {
      // call your paymaster here to sponsor the userop
      // leverage the `opts` field to apply any overrides
      return {
        ...userop,
        paymasterAndData: "0xresponsefromprovider",
      };
    },
  },
});
```

## ERC20 Gas Sponsorship

We are working on building support for an ERC20 paymaster!

In the meantime, you could use a third-party paymaster, such as [Stackup](https://docs.stackup.sh/docs/paymaster-api), to sponsor ERC-20 gas. Here's an example using Stackup with the Alchemy SDK:

```ts
import { createMultiOwnerModularAccountClient } from "@alchemy/aa-accounts";
import {
  alchemyFeeEstimator,
  createAlchemyPublicRpcClient,
} from "@alchemy/aa-alchemy";
import { deepHexlify, resolveProperties } from "@alchemy/aa-core";
import { createClient, http } from "viem";
import { sepolia } from "viem/chains";

const chain = sepolia;
// [!code focus:99]
const stackupClient = createClient({
  transport: http("https://api.stackup.sh/v1/paymaster/STACKUP_API_KEY"), // TODO: Replace with your stackup API key here (https://docs.stackup.sh/docs/paymaster-api)
});

const alchemyRpcClient = createAlchemyPublicRpcClient({
  connectionConfig: { rpcUrl: "ALCHEMY_RPC_URL" }, // TODO: Replace with your Alchemy API key (https://dashboard.alchemypreview.com/apps)
  chain,
});

const alchemyClient = await createMultiOwnerModularAccountClient({
  chain,
  account: {
    signer,
  },
  transport: http("ALCHEMY_RPC_URL"),
  gasEstimator: async (userOp) => ({
    ...userOp,
    callGasLimit: "0x0",
    preVerificationGas: "0x0",
    verificationGasLimit: "0x0",
  }), // Bypasses alchemy gas estimation and instead uses Stackup for gas estimation
  feeEstimator: alchemyFeeEstimator(alchemyRpcClient), // Uses alchemy fee estimation to comply with bundler
  paymasterAndData: {
    dummyPaymasterAndData: () => {
      return "0x";
    },
    paymasterAndData: async (userop, opts) => {
      const pmResponse: any = await stackupClient.request({
        // @ts-ignore
        method: "pm_sponsorUserOperation",
        params: [
          deepHexlify(await resolveProperties(userop)),
          opts.account.getEntryPoint().address,
          {
            // @ts-ignore
            type: "payg", // Replace with ERC20 context based on stackups documentation
          },
        ],
      });
      return {
        ...userop,
        ...pmResponse,
      };
    },
  },
});
```
