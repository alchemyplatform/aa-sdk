---
outline: deep
head:
  - - meta
    - property: og:title
      content: How to estimate gas for a user operation
  - - meta
    - name: description
      content: Follow this guide to learn how to estimate gas for a user operation with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - property: og:description
      content: Follow this guide to learn how to estimate gas for a user operation with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - name: twitter:title
      content: How to estimate gas for a user operation
  - - meta
    - name: twitter:description
      content: Follow this guide to learn how to estimate gas for a user operation with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# How to estimate gas for a user operation

Providing accurate user operation gas estimations is important to the user experience of ERC-4337. If a gas estimate is too low, a user operation may revert during simulation, or worse, revert onchain during the execution phase, leaving the user to pay for gas of a reverted operation. If gas estimation is too high, a user may be dissuaded from, or unable to, send their operation due to costs.

## User operation gas estimation using `SmartAccountClient`

[`eth_estimateUserOperationGas`](https://docs.alchemy.com/reference/eth-estimateuseroperationgas) is an RPC method that bundlers support as per the [`ERC-4337`](https://eips.ethereum.org/EIPS/eip-4337#-eth_estimateuseroperationgas) specification. It estimate the gas values for a UserOperation. Given a UserOperation, optionally without gas limit or price fields, this method returns the needed gas limits.

`SmartAccountClient` of `aa-sdk` provides a default [`gasEstimator`](/packages/aa-core/smart-account-client/middleware/index#gasEstimator) that internally includes calling `eth_estimateUserOperationGas` to the bundler in addition to applying user operation overrides or fee options for populating the user operation gas fields in a most desired manner. If you are looking to estimate gas of a user operation without building the entire user operation through the middleware pipeline, you can call the [`estimateUserOperationGas`](/packages/aa-core/smart-account-client/actions/estimateUserOperationGas) action on the `SmartAccountClient` to directly fetch network user operation gas estimates from the bundler. The action returns `UserOperationEstimateGasResponse` containing the estimated gas values.

::: tip Note 1
The actual gas estimation or fee estimation is performed by the bundler connected to the `SmartAccountClient`, so depending on the bundler you are using, the gas estimate value might be different.
:::

::: tip Note 2
Note that the `estimateUserOperationGas` action returns the bare result of gas estimates returned directly from the connected bundler without applying user operation gas overrides or client fee options that are applied from the default `gasEstimator` used when constructing the actual user operation request to send to the network.
:::

### [`UserOperationEstimateGasResponse`](/resources/types#useroperationrstimategasresponse)

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
   * EntryPoint v0.7.0 operations only.
   * The amount of gas to allocate for the paymaster validation code.
   * Note: `eth_estimateUserOperationGas` does not return paymasterPostOpGasLimit.
   */
  paymasterVerificationGasLimit: TEntryPointVersion extends "0.7.0"
    ? BigNumberish
    : never;
}
```

### Example

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";

// [!code focus:99]
const { preVerificationGas, verificationGasLimit, callGasLimit } =
  await smartAccountClient.estimateUserOperationGas({
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
