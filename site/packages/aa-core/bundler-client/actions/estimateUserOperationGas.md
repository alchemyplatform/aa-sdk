---
outline: deep
head:
  - - meta
    - property: og:title
      content: estimateUserOperationGas
  - - meta
    - name: description
      content: Overview of the estimateUserOperationGas action available on the BundlerClient
  - - meta
    - property: og:description
      content: Overview of the estimateUserOperationGas action available on the BundlerClient
---

# estimateUserOperationGas

Calls `eth_estimateUserOperationGas` and returns the result

## Usage

::: code-group

```ts [example.ts]
import { client } from "./client";

const estimates = await client.estimateUserOperationGas(
  {
    // ... user operation
  },
  "0xEntryPointAddress"
);
```

<<< @/snippets/aa-core/bundlerClient.ts
:::

## Returns

### `Promise<UserOperationEstimateGasResponse<EntryPointVersion>`

The result of the estimate including the `callGasLimit`, `verificationGasLimit`, `preVerificationGas`, and additionally, `paymasterVerificationGasLimit` for EntryPointVersion v0.7.0 user operations.

## Parameters

### `request: UserOperationRequest<EntryPointVersion>`

The user operation to send

### `entryPoint: Address`

The address of the entry point to send the user operation to
