---
outline: deep
head:
  - - meta
    - property: og:title
      content: estimateUserOperationGas
  - - meta
    - name: description
      content: Overview of the estimateUserOperationGas action available on the PublicErc4337Client
  - - meta
    - property: og:description
      content: Overview of the estimateUserOperationGas action available on the PublicErc4337Client
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

<<< @/snippets/client.ts
:::

## Returns

### `Promise<UserOperationEstimateGasResponse>`

The result of the estimate including the `callGasLimit`, `verificationGasLimit`, `preVerificationGas`.

## Parameters

### `request: UserOperationRequest`

The user operation to send

### `entryPointAddress: Address`

The address of the entry point to send the user operation to
