---
outline: deep
head:
  - - meta
    - property: og:title
      content: Migration Guide
  - - meta
    - name: description
      content: How to update from EntryPoint v0.6 to v0.7.
  - - meta
    - property: og:description
      content: How to update from EntryPoint v0.6 to v0.7.
  - - meta
    - name: twitter:title
      content: Migration Guide
  - - meta
    - name: twitter:description
      content: How to update from EntryPoint v0.6 to v0.7.
prev:
  text: "Migrating to v3.x.x"
  link: "migration-guides/migrating-to-v3"
next:
  text: "Using Alchemy Signer"
  link: "/signers/alchemy-signer/introduction"
---

# EntryPoint v0.7 Update Guide

## EntryPoint v0.7: A Milestone in Account Abstraction

[Version 0.7](https://github.com/eth-infinitism/account-abstraction/releases/tag/v0.7.0), the latest advancement, brings significant updates and optimizations driven by community feedback and evolving needs:

- Optimized Gas Management: Making transactions more cost-effective.
- Advanced Security: Introducing stringent security measures for better account and transaction protection.
- Enhanced Developer Tools: Offering improved resources for creating AA-enabled dApps.

## What’s New in EntryPoint v0.7

EntryPoint v0.7 introduces several key features and improvements to streamline Account Abstraction further:

- **Optimized Data Structures**: Refining transactional data structures for enhanced performance and reduced gas costs.
- **Simulation Functions and Deployment Overhaul**: Version 0.7 removes on-chain simulation functions, directing them off-chain for bundlers, optimizing contract efficiency.
- **`delegateAndRevert()` Helper**: This addition aids networks without state overrides, ensuring reliable validation and gas estimation.
- **`ERC-165` `supportsInterface`**: Enhancing interoperability.
- **Token Paymaster Template**: Illustrating how to implement paymasters that can sponsor transaction fees.
- **Penalty for Unused Gas**: Introducing a charge on unused gas limits to encourage efficient gas usage.
- **Streamlined Post-Operation Calls**: Simplifying the transaction process by removing redundant postOp calls.
- **Gas Limit Specifications**: Providing clearer guidelines for gas estimation and enhancing security.
- **Structural Adjustments**: Separating off-chain and on-chain UserOperation representations for better efficiency and clarity.

With upgrade made for `aa-sdk` version `v3.8.4`, `aa-sdk` now supports both EntryPoint `v0.6.0` and the latest `v0.7.0` contract for compatible smart accounts.

Below are the steps to update your project from using EntryPoint `v0.6.0` to `v0.7.0` of the `aa-sdk`.

::: tip Note
This migration guide assumes you are already on `aa-sdk` version `^3.x.x`. If you are looking to upgrade from the older versions of `aa-sdk`, you can follow the [Migration Guide](./migrating-to-v3.md) to first upgrade `aa-sdk` version to `^3.x.x`.
:::

Upgrading to the latest version `v3.8.4` of `aa-sdk` does **not** involve breaking changes if you continue to stay on using EntryPoint v0.6.0 for your smart accounts. If you are looking to update to using EntryPoint `v0.7.0`, you can simply do so by specifying in the optional entrypoint version parameter to the version `0.7.0` when instantiating your `SmartContractAccount`. For the initial launch of EntryPoint v0.7 support in `aa-sdk`, the default EntryPoint version will remain as `v0.6.0`, but note that this default version value will be changed to the latest version in the future versions of `aa-sdk`.

### Account Support

Because [EntryPoint](https://eips.ethereum.org/EIPS/eip-4337#definitions) is a singleton contract, where there is only one implementation and one instance exists on each chain, you first need to make sure the smart account and the bundler you are using is updated with a certain EntryPoint version.

From version `^3.8.4`, `aa-sdk` lets you easily configure which EntryPoint version compatible Smart Account to use. `aa-sdk` supports 4 types of accounts natively, and the below table details which EntryPoints each account is valid for.

| Account                       | EntryPoint v0.7 | EntryPoint v0.6 |
| :---------------------------- | :-------------- | :-------------- |
| SimpleAccount                 | ✅              | ✅              |
| LightAccount v1 (_< v.2.0.0_) | ❌              | ✅              |
| LightAccount v2 (_>= v2.0.0_) | ✅              | ❌              |
| MultiOwnerLightAccount        | ✅              | ❌              |
| MultiOwnerModularAccount      | ❌              | ✅              |
| MultisigModularAccount        | ❌              | ✅              |

### `SmartContractAccount`: optional `entryPoint` parameter for [`toSmartContractAccount`](/packages/aa-core/accounts/)

The only change that needs to be made to update to using EntryPoint v.7 is to specify the optional `entryPoint` parameter of the [`ToSmartContractAccountParams`](/resources/types#ToSmartContractAccountParams) used for the [`toSmartContractAccount`](/packages/aa-core/accounts/) function when instantiating a `SmartContractAccount`. Based on the `entryPoint` parameter, which is of type [`EntryPointDef`](/resources/types#EntryPointDef) of the specific `EntryPointVersion`, the output `SmartContractAccount` will be strongly-typed with the structure compatible to perform the desired `EntryPointVersion` user operations. Using `SimpleAccount` as an example, you will have to make the following changes:

```ts
import { createSimpleAccount } from "@alchemy/aa-core";
import { getEntryPoint, LocalAccountSigner, type Hex } from "@alchemy/aa-core";
import { sepolia } from "@alchemy/aa-core";

const chain = sepolia;

const account = await createSimpleAccount({
  transport: http("RPC_URL"),
  signer,
  chain,
  entryPoint: getEntryPoint(chain, { version: "0.7.0" }), // [!code ++]
});
```

### [`BundlerClient`](/resources/types#BundlerClient)

The `BundlerClient` will be compatible with both EntryPoint v0.6 and v0.7 operations, and the connected bundler is expected to determine the comaptible `EntryPoint` contract version based on the `entryPointAddress` parameter through the bundler RPC requests.

### [`SmartAccountClient`](/resources/types#SmartAccountClient): `EntryPointVersion` inferred from the connected Smart Account

As mentioned above, `Clients` support multiple `EntryPoint` contract versions depending on the `entryPointAddress` used when calling the RPC methods. As `SmartAccountClient` is an extension to `BundlerClient`, it is compatible with both `EntryPoint` version v0.6 and v0.7. When the `Account` is connected to the `Client` to perform [`SmartAccountClientActions`](/resources/types#smartaccountclientaction) on the connected `Account`, then the `SmartAccountClient` will be strongly-typed with the `EntryPointVersion` type inferred from the Account.

#### Using EntryPoint v0.7 Smart Account with `SmartAccountClient`

```ts
import {
  createBundlerClient,
  createSmartAccountClientFromExisting,
  createSimpleAccount,
  getEntryPoint,
  LocalAccountSigner,
  type Hex,
} from "@alchemy/aa-core";
import { sepolia } from "@alchemy/aa-core";
import { http, custom } from "viem";

const chain = sepolia;

const client = createBundlerClient({
  chain,
  transport: http("JSON_RPC_URL"),
});

// [!code focus:99]
const account_v7 = await createSimpleAccount({
  signer,
  transport: custom(client),
  chain,
  entryPoint: getEntryPoint(chain, { version: "0.7.0" }), // required for EntryPoint v0.7 [!code ++]
});

const smartAccountClient = createSmartAccountClientFromExisting({
  client,
});

const uoStruct_v7: UserOperationStruct<"0.7.0"> =
  await smartAccountClient.buildUserOperation({
    uo: {
      target: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      data: "0x",
      value: 10n,
    },
    account: account_v7,
  });

// uoStruct_v7: UserOperationStruct<"0.7.0"> = {
//   sender: string;
//   nonce: BigNumberish;
//   initCode: BytesLike | "0x";  [!code --]
//   factory?: string;  [!code ++]
//   factoryData?: BytesLike;  [!code ++]
//   callData: BytesLike;
//   callGasLimit?: BigNumberish;
//   verificationGasLimit?: BigNumberish;
//   preVerificationGas?: BigNumberish;
//   maxFeePerGas?: BigNumberish;
//   maxPriorityFeePerGas?: BigNumberish;
//   paymasterAndData: BytesLike | "0x";  [!code --]
//   paymaster?: string;  [!code ++]
//   paymasterVerificationGasLimit?: BigNumberish;  [!code ++]
//   paymasterPostOpGasLimit?: BigNumberish;  [!code ++]
//   paymasterData?: BytesLike;  [!code ++]
//   signature: BytesLike;
// }
```

### [`UserOperationOverrides`](/resources/types#useroperationoverrides)

Similar to the updated `UserOperation` type from `EntryPoint` v0.6 to v0.7, `UserOperationOverrides` types are different from the two version operations.

#### `paymasterAndData` field replaced with `paymaster` address and the `paymasterData` separated in addition to the 2 added `paymaster` operation gas limit fields

```ts
export type UserOperationOverrides<'0.7.0'> = {
  ...
  paymasterAndData?: EmptyHex;  // [!code --]
  paymaster?: string;  // [!code ++]
  paymasterData?: EmptyHex;  // [!code ++]
  paymasterVerificationGasLimit?: BigNumberish | Multiplier;  // [!code ++]
  paymasterPostOpGasLimit?: BigNumberish | Multiplier;  // [!code ++]
}
```

::: tip Note
Note that per [`ERC-4337`](https://eips.ethereum.org/EIPS/eip-4337#parameters), paymaster fields (`paymaster`, `paymasterData`, `paymasterValidationGasLimit`, `paymasterPostOpGasLimit`) either all exist, or none in the final `UserOperation` request sent to the connected Bundler.
:::

#### `stateOverride` field added to `UserOperationOverrides` for validating and estimating gas for transactions

The state overrides during transaction calls (e.g., [`eth_call`](https://docs.alchemy.com/reference/eth-call) and [`eth_estimateGas`](https://docs.alchemy.com/reference/eth-estimategas)) allow for more flexible testing and gas estimation. However, not all networks support this feature. For networks lacking state overrides, `EntryPoint` v0.7 introduced the `delegateAndRevert()` function to be used as a workaround. It aids in validating and estimating gas for transactions by simulating conditions without permanently changing the on-chain state.

Although some bundlers, such as Alchemy [`rundler`](https://github.com/alchemyplatform/rundler), does support the `stateOverride` feature for user operation gas estimation for both EntryPoint v0.6 and v0.7 user operations, until Entrypoint v0.6, the [`eth_estimateUserOperationGas`](https://eips.ethereum.org/EIPS/eip-4337#-eth_estimateuseroperationgas) RPC method did not include the optional `stateOverride` parameter per specification. From EntryPoint v0.7, however, `stateOverride` has been added to officially added as an optional parameter to the gas estimation method, thanks to the removal of network requirement to support state override feature.

With such update, `aa-sdk` accepts `stateOverride` value as part of the [`UserOperationOverrides`](/resources/types#useroperationoverrides) to be used during the gas estimation.

```ts
export type UserOperationOverrides<'0.6.0' | '0.7.0'> = {
  ...
  stateOverride?: StateOverride;  // [!code ++]
  ...
};
```

### [`UserOperationEstimateGasResponse`](/resources/types#useroperationrstimategasresponse)

Entrypoint v0.7 update includes the addition of `paymasterVerificationGasLimit`, the value used for paymaster verification, to the response of [`eth_estimateUserOperationGas`](https://eips.ethereum.org/EIPS/eip-4337#-eth_estimateuseroperationgas) RPC method. Accordingly, the `UserOperationEstimateGasResponse` for Entrypoint v0.7 user operation contains the added `paymasterVerificationGasLimit` value computed by the bundler if the user operation contains the `paymaster` field in the user operation request sent for gas estimation.

Note that `paymasterPostOpGasLimit`, the value used for paymaster `postOp` execution, is not included in the response per Entrypoint v0.7 specification, and the value of this field depends on the specific paymaster that is being used for the user operation.

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
