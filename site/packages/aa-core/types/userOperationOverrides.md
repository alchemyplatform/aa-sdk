---
outline: deep
head:
  - - meta
    - property: og:title
      content: UserOperationOverrides
  - - meta
    - name: description
      content: Overview of the UserOperationOverrides type in aa-core types
  - - meta
    - property: og:description
      content: Overview of the UserOperationOverrides type in aa-core types
---

# UserOperationOverrides

Contains override values to be applied on the user operation reqeust to be constructed or sent. Available fields include `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit` or `paymasterAndData`.

These override values are available from each middleware of the `SmartAccountProvider`. For example, the default middlewares such as [`gasEstimator`](/packages/aa-core/provider/withGasEstimator.md) or [`feeDataGetter`](/packages/aa-core/provider/withFeeDataGetter.md) apply the overrides values to the estimated values if the override values are provided.

Other than the `paymasterAndData` field, the override fields could be either the absolute value or the percentage value. In the default middlewares, if the override value is an absolute value, it simply overrides the estimated value. If the override value is a percentage value, the estimated value is _bumped_ with the indicated percentage value. For example, if the override value is `{ percentage: 10 }` for the `maxPriorityFeePerGas` field, then 10% bump is applied to the estimated `maxPriorityFeePerGas` of the user operation.

The `paymasterAndData` only allows an absolute value override, and if the override value is provided, then the paymaster middleware is bypassed entirely. Refer to our guide [How to Handle User Operations that are Not Eligible for Gas Sponsorship](/guides/sponsoring-gas/gas-sponsorship-eligibility.md) on the example of using the `paymasterAndData` override to bypass the paymaster middleware to fallback to the user paying the gas fee instead of the gas being subsidized by the paymaster.

:::tip Note
Note that if you are using your own middleware, for example a custom `feeDataGetter` using [`withFeeDataGetter`](/packages/aa-core/provider/withFeeDataGetter.md) method on the provider, then the default `feeDataGetter` middleware is overriden. As you are opting out of using the default middleware, you are also responsible for handling the `UserOperationOverrides` appropriately.
:::

```ts
type BytesLike = Uint8Array | Hex;

export type UserOperationOverrides = Partial<{
  callGasLimit: UserOperationStruct["callGasLimit"] | Percentage;
  maxFeePerGas: UserOperationStruct["maxFeePerGas"] | Percentage;
  maxPriorityFeePerGas:
    | UserOperationStruct["maxPriorityFeePerGas"]
    | Percentage;
  preVerificationGas: UserOperationStruct["preVerificationGas"] | Percentage;
  verificationGasLimit:
    | UserOperationStruct["verificationGasLimit"]
    | Percentage;
  paymasterAndData: UserOperationStruct["paymasterAndData"];
}>;
```

## Usage

::: code-group

```ts [user-operation-override.ts]
import type { UserOperationOverrides } from "@alchemy/aa-core";
import { provider } from "./provider.ts";

// Find your Gas Manager policy id at:
//dashboard.alchemy.com/gas-manager/policy/create
const GAS_MANAGER_POLICY_ID = "YourGasManagerPolicyId";

// Link the provider with the Gas Manager. This ensures user operations
// sent with this provider get sponsorship from the Gas Manager.
provider.withAlchemyGasManager({
  policyId: GAS_MANAGER_POLICY_ID,
});

// [!code focus:16]
// Use maxFeePerGas, maxPriorityFeePerGas, and paymasterAndData override
// to manually set the tx gas fees and the paymasterAndData field
const overrides: UserOperationOverrides = {
  maxFeePerGas: 100000000n,
  maxPriorityFeePerGas: 100000000n,
  paymasterAndData: "0x",
};

const userOperationResult = await provider.sendUserOperation(
  {
    target: "0xTargetAddress",
    data: "0xCallData",
  },
  overrides
);

// Fallback to user paying the gas fee isntead of the paymaster
const txHash = await provider.waitForUserOperationTransaction({
  hash: userOperationResult.hash,
});
```

<<< @/snippets/provider.ts

:::
