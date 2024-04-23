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

Calls `eth_estimateUserOperationGas` and returns the result.

## Usage

::: code-group

```ts [example.ts]
import { client } from "./client";

const estimates = await client.estimateUserOperationGas(
  {
    // ... user operation request with account dummySignature,
    // initCode, encoded user operation call data, sender address, etc.
  },
  "0xEntryPointAddress"
);
```

<<< @/snippets/aa-core/bundlerClient.ts
:::

## Returns

### `Promise<UserOperationEstimateGasResponse<EntryPointVersion>`

The result of the estimate including the `callGasLimit`, `verificationGasLimit`, `preVerificationGas`, and additionally, `paymasterVerificationGasLimit` for EntryPointVersion `v0.7.0` user operations.

## Parameters

### `request: UserOperationRequest<EntryPointVersion>`

The user operation to estimate the gas for sending the user oepration.

### `entryPoint: Address`

The address of the entry point to send the user operation to

### `stateOverride?: StateOverride`

A type defining state overrides for [`eth_call`](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-eth#eth-call) method. An optional address-to-state mapping, where each entry specifies some state to be ephemerally overridden prior to executing the call.
State overrides allow you to customize the network state for the purpose of the simulation, so this feature is useful when you need to estimate gas for user operation scenarios under conditions that aren’t currently present on the live network.
