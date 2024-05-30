---
title: BundlerClient
description: Introduction to BundlerClient exported by aa-core
---

# Bundler Client

The `BundlerClient` is an extension of viem's [`PublicClient`](https://viem.sh/docs/clients/public) that adds methods for interacting with Bundler RPC methods.

## Import

```ts
import { createBundlerClient } from "@alchemy/aa-core";
// OR
import { createBundlerClientFromExisting } from "@alchemy/aa-core";
```

## Usage

Initialize a `BundlerClient` in the same way you would initalize a [`PublicClient`](https://viem.sh/docs/clients/public#parameters)

```ts
import { createBundlerClient } from "@alchemy/aa-core";
import { http } from "viem";
import { sepolia } from "@alchemy/aa-core";

export const smartAccountClient = createBundlerClient({
  transport: http("ALCHEMY_RPC_URL"),
  chain: sepolia,
});
```

If you already have a [`PublicClient`](https://viem.sh/docs/clients/public) instance, you can use `createBundlerClientFromExisting` to create a `BundlerClient` from it.

```ts
import { createBundlerClientFromExisting } from "@alchemy/aa-core";
import { http } from "viem";
import { sepolia } from "@alchemy/aa-core";

export const smartAccountClient = createBundlerClientFromExisting(publicClient);
```

## Returns

### `BundlerClient`

A new instance of a `BundlerClient`.

## Parameters

Same parameters outlined in [viem's docs](https://viem.sh/docs/clients/public#parameters)

## RPC Methods

### `eth_sendUserOperation`

Sends a user operation to the RPC provider to be included in a bundle.

#### Parameters

- `[UserOperationRequest, Address]` - The User Operation Request to be submitted and the address of the EntryPoint to be used for the operation.

#### Returns

- `Hash` - The hash of the User Operation.

### `eth_estimateUserOperationGas`

Sends a user operation to the RPC provider and returns gas estimates for the User Operation.

#### Parameters

- `[UserOperationRequest, Address]` - The User Operation Request to be submitted and the address of the EntryPoint to be used for the operation.

#### Returns

- `UserOperationEstimateGasResponse` - gas estimates for the `UserOperation` (UO).

### `eth_getUserOperationReceipt`

Given a User Operation hash, returns the User Operation Receipt.

#### Parameters

- `[Hash]` - The hash of the User Operation to get the receipt for.

#### Returns

- `UserOperationReceipt | null` - The User Operation Receipt or null if the User Operation has not been included in a block yet.

### `eth_getUserOperationByHash`

Given a User Operation hash, returns the User Operation.

#### Parameters

- `[Hash]` - The hash of the User Operation to get.

#### Returns

- `UserOperationResponse | null` - The UO if it exists or null if it does not.

### `eth_supportedEntryPoints`

Returns the entry point addresses supported by the RPC provider.

#### Parameters

- `[]` - No parameters.

#### Returns

- `Address[]` - An array of addresses that are supported by the RPC provider.
