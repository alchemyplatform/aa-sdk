---
outline: deep
head:
  - - meta
    - property: og:title
      content: estimateUserOperationGas
  - - meta
    - name: description
      content: Overview of the estimateUserOperationGas method on SmartAccountClient
  - - meta
    - property: og:description
      content: Overview of the estimateUserOperationGas method on SmartAccountClient
---

# estimateUserOperationGas

Estimate user operation gas for the user operation without building the full user operation request given the user operation calldata.

Please refer to the guide [How to estimate gas for a user operation](/using-smart-accounts/estimate-gas/estimate-user-op-gas) to learn more about estimating gas for a user operation using `SmartAccountClient`.

## Usage

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
// build single
const gasEstimate = await smartAccountClient.estimateUserOperationGas({
  uo: {
    target: TO_ADDRESS,
    data: ENCODED_DATA,
    value: VALUE, // optional
  },
});

console.log(gasEstimate);

/**
 * {
 *   preVerificationGas: BigNumberish;
 *   verificationGasLimit: BigNumberish;
 *   callGasLimit: BigNumberish;
 * }
 */
```

<<< @/snippets/aa-core/smartAccountClient.ts
:::

## Returns

### `Promise<UserOperationEstimateGasResponse<EntryPointVersion>`

The result of the estimate including the `callGasLimit`, `verificationGasLimit`, `preVerificationGas`, and additionally, `paymasterVerificationGasLimit` for EntryPointVersion `v0.7.0` user operations.

<!--@include: ../../../../snippets/aa-core/send-uo-param.md-->
