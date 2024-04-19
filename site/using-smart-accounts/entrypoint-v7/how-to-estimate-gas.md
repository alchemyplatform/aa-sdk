---
outline: deep
head:
  - - meta
    - property: og:title
      content: How to estimate gas for Entrypoint v0.7 user operations
  - - meta
    - name: description
      content: Follow this guide to learn how to estimate gas for Entrypoint v0.7 user operations with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - property: og:description
      content: Follow this guide to learn how to estimate gas for Entrypoint v0.7 user operations with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - name: twitter:title
      content: How to estimate gas for Entrypoint v0.7 user operations
  - - meta
    - name: twitter:description
      content: Follow this guide to learn how to estimate gas for Entrypoint v0.7 user operations with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# How to estimate gas for Entrypoint v0.7 user operations

For ERC-4337 Bundlers, one of the most challenging component to get correct is user operation gas estimation. Providing accurate user operation gas estimations is important to the user experience of ERC-4337. If a gas estimate is too low, a user operation may revert during simulation, or worse, revert onchain during the execution phase, leaving the user to pay for gas of a reverted operation. If gas estimation is too high, a user may be dissuaded from, or unable to, send their operation due to costs.

## User Operation Gas Estimation

[`eth_estimateUserOperationGas`](https://docs.alchemy.com/reference/eth-estimateuseroperationgas) is an RPC method that bundlers must support as per the [`ERC-4337`](https://eips.ethereum.org/EIPS/eip-4337#-eth_estimateuseroperationgas) specification.

### Definition

Estimate the gas values for a UserOperation. Given a UserOperation optionally without gas limit or price fields, return the needed gas limits.

### Parameters

A yet to be signed `UserOperation` type data with optional parameters for gas limits (and prices).

### Return

#### [`UserOperationEstimateGasResponse`](/resources/types#useroperationrstimategasresponse)

```ts
export interface UserOperationEstimateGasResponse<
  TEntryPointVersion extends EntryPointVersion
> {
  /* Gas overhead of this UserOperation */
  preVerificationGas: BigNumberish;
  /* Actual gas used by the validation of this UserOperation */
  verificationGasLimit: BigNumberish;
  /* Value used by inner account execution */
  callGasLimit: BigNumberish;
  /*
   * Entrypoint v0.7.0 operations only.
   * The amount of gas to allocate for the paymaster validation code.
   * Note: `eth_estimateUserOperationGas` does not return paymasterPostOpGasLimit.
   */
  paymasterVerificationGasLimit: TEntryPointVersion extends "0.7.0"
    ? BigNumberish
    : never;
}
```

## Entrypoint v0.7 Change

We want to ensure that the validation phase runs before the execution phase during gas estimation. The execution phase may rely on state set during the validation phase (i.e. a USDC paymaster transfer and and an execution phase that uses USDC) and thus it’s most accurate to estimate directly after.

Entrypoint v0.7 brings such improvement by introducing the additional [`StateOverride`] parameter when estimating the user operation gas, which enables the Entrypoint to inform if the execution reverted or not during [`simulateHandleOp`]. The bundler could then run the binary search off-chain without the proxy contract and state overrides. However, this binary search will be inefficient as it will be running the validation phase during each iteration.

This leads us to taking the binary search done by the proxy contract in attempt 3 above and adding its functionality directly to the entry point contract (pseudocode):

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
// the hash returned here is the hash of the User Operation
const { hash } = await smartAccountClient.sendUserOperation({
  uo: [
    {
      target: "0x...",
      data: "0xcallDataTransacation1",
    },
    {
      target: "0x...",
      data: "0xcallDataTransacation2",
    },
  ],
});
```

<<< @/snippets/aa-alchemy/connected-client.ts [smartAccountClient.ts]

:::

## Batching using [`sendTransactions`](/packages/aa-core/smart-account-client/actions/sendTransactions.md)

The `SmartAccountClient` supports sending UOs and waiting for them to be mined in a transaction via the `sendTransaction` and `sendTransactions` methods. The latter allows for batching in the same way `sendUserOperation`:

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
// the hash returned here is the hash of the mined Tx that includes the UserOperation
const hash = await smartAccountClient.sendTransactions({
  requests: [
    {
      to: "0x...",
      data: "0xcallDataTransacation1",
    },
    {
      to: "0x...",
      data: "0xcallDataTransacation2",
    },
  ],
});
```

<<< @/snippets/aa-alchemy/connected-client.ts [smartAccountClient.ts]

:::
