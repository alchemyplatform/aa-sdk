---
title: AlchemySmartAccountClient • simulateUserOperation
description: Overview of the simulateUserOperation method on Alchemy Smart
  Account Client in aa-alchemy
---

# simulateUserOperation

`simulateUserOperation` is a method you can use to easily leverage the [`alchemy_simulateUserOperationAssetChanges`](https://docs.alchemy.com/reference/alchemy-simulateuseroperationassetchanges/?a=ak-docs) API to simulate asset changes resulting from user operation.

## Usage

:::code-group

```ts [example.ts]
import { smartAccountClient } from "./base-client.ts";
// [!code focus:99]

const uoStruct: UserOperationCallData = {
  target: "0xTARGET_ADDRESS",
  data: "0xDATA",
  value: 1n,
};

const uoSimResult = await smartAccountClient.simulateUserOperationAssetChanges({
  uo: uoStruct,
});

if (uoSimResult.error) {
  console.error(uoSimResult.error.message);
}

const uo = await smartAccountClient.sendUserOperation({ uo: uoStruct });
```

```ts [base-client.ts]
// [!include ~/snippets/aa-alchemy/connected-client.ts]
```

:::

## Returns

### `Promise<SimulateUserOperationAssetChangesResponse>`

- `changes: SimulateAssetChange[]`
  - `assetType: SimulateAssetType (NATIVE, ERC20, ERC721, ERC1155,  orSPECIAL_NFT)`
  - `changeType: SimulateChangeType (APPROVE or TRANSFER)`
  - `from: Address`
  - `to: Address`
  - `rawAmount?: string`
  - `amount?: string`
  - `contactAddress: Address`
  - `tokenId?: string`
  - `decimals: number`
  - `symbol: string`
  - `name?: string`
  - `logo?: string`
- `error: SimulateAssetChangesError`
  - `message: string`

## Parameters

### `UserOperationCallData | UserOperationCallData[]`

- `target: Address` - the target of the call (equivalent to `to` in a transaction)
- `data: Hex` - can be either `0x` or a call data string
- `value?: bigint` - optionally, set the value in wei you want to send to the target

### `overrides?:` [`UserOperationOverrides`](/resources/types#useroperationoverrides)

Optional parameter where you can specify override values for `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit` or `paymasterAndData` on the user operation request. You can also specify a `stateOverride` to be passed into `eth_estimateUserOperationGas` during gas estimation.
