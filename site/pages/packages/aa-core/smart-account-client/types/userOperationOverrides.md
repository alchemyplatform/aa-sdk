---
title: UserOperationOverrides
description: Overview of the UserOperationOverrides type in aa-core types
---

# UserOperationOverrides

Contains override values to be applied on the user operation request to be constructed or sent. Available fields include `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit`, `paymasterAndData`, or `nonceKey`. You can also specify a `stateOverride` to be passed into `eth_estimateUserOperationGas` during gas estimation.

These override values are available from each middleware of the `SmartAccountClient`. For example, the default middlewares such as `gasEstimator` or `feeEstimator` apply the override values to the estimated values if the override values are provided.

Other than the `paymasterAndData` and the `nonceKey` fields, the override fields could be either the absolute or the multiplier. In default middlewares, if the override value is absolute, it simply overrides the estimated value. If the override value is a multiplier value, the estimated value is _bumped_ with the indicated multiplier value. For example, if the override value is `{ multiplier: 1.1 }` for the `maxPriorityFeePerGas` field, then a 1.1 multiplier, or a 10% increase, is applied to the estimated `maxPriorityFeePerGas` of the user operation.

The `paymasterAndData` only allows an absolute value override of value `0x` for bypassing the paymaster middleware entirely. This is useful when a user is not eligible for gas sponsorship, but is comfortable paying for the gas of the User Operation themselves. Refer to our guide [How to handle User Operations that are not eligible for gas sponsorship](/using-smart-accounts/sponsoring-gas/checking-eligibility) on the example of using the `paymasterAndData` override to bypass the paymaster middleware to fallback to the user paying the gas fee instead of the gas being subsidized by the paymaster.

Lastly, `noneKey` can be used to override the key used when calling `entryPoint.getNonce`. It is useful when you want to use parallel nonces for user operations. This is useful when you want to send multiple user operations in parallel. Note that not all bundlers fully support this feature and it could be that your bundler will still only include one user operation for your account in a bundle.

:::tip[Note]
Note that if you are using your own middleware, for example if you supply your own custom `feeEstimator`, `gasEstimator`, or `paymasterMiddleware` when creating the smart account client, then their corresponding default middlewares are overridden. As you are opting out of using the default middlewares, you are also responsible for handling the `UserOperationOverrides` appropriately for each of the middleware that you opted out of the defaults.
:::

```ts
type BytesLike = Uint8Array | Hex;

export type UserOperationOverrides = Partial<{
  callGasLimit: UserOperationStruct["callGasLimit"] | Multiplier;
  maxFeePerGas: UserOperationStruct["maxFeePerGas"] | Multiplier;
  maxPriorityFeePerGas:
    | UserOperationStruct["maxPriorityFeePerGas"]
    | Multiplier;
  preVerificationGas: UserOperationStruct["preVerificationGas"] | Multiplier;
  verificationGasLimit:
    | UserOperationStruct["verificationGasLimit"]
    | Multiplier;
  paymasterAndData: EmptyHex; // only "0x" allowed for paymasterAndData override
  nonceKey: bigint;
}>;
```

## Usage

:::code-group

```ts [user-operation-override.ts]
import type { UserOperationOverrides } from "@alchemy/aa-core";
import { smartAccountClient } from "./smartAccountClient.ts";

// [!code focus:16]
// Use maxFeePerGas, maxPriorityFeePerGas, and paymasterAndData override
// to manually set the tx gas fees and the paymasterAndData field
const overrides: UserOperationOverrides = {
  maxFeePerGas: 100000000n,
  maxPriorityFeePerGas: 100000000n,
  paymasterAndData: "0x",
};

const userOperationResult = await smartAccountClient.sendUserOperation(
  {
    target: "0xTargetAddress",
    data: "0xCallData",
  },
  overrides
);

// Fallback to user paying the gas fee instead of the paymaster
const txHash = await smartAccountClient.waitForUserOperationTransaction({
  hash: userOperationResult.hash,
});
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/gas-manager-client.ts]
```

:::
