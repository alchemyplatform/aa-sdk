---
outline: deep
head:
  - - meta
    - property: og:title
      content: Public Client
  - - meta
    - name: description
      content: Overview of the Public Client exported by aa-core
  - - meta
    - property: og:description
      content: Overview of the Public Client exported by aa-core
---

# Public ERC-4337 Client

Viem exports a `PublicClient` and utilities for creating the `PublicClient`. We extend that functionality here to provide a `PublicClient` that is also typed to work with the RPC endpoints introduced in [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337).

The `PublicErc4337Client` also has a number of methods that wrap the RPC Methods below to make it easier to interact with the RPC provider.

## RPC Methods

### `eth_sendUserOperation`

Sends a user operation to the RPC provider to be included in a bundle.

#### Parameters

- `[UserOperationRequest, Address]` - The User Operation Request to be submitted and the address of the Entrypoint to be used for the operation.

#### Returns

- `Hash` - The hash of the User Operation.

### `eth_estimateUserOperationGas`

Sends a user operation to the RPC provider and returns gas estimates for the User Operation.

#### Parameters

- `[UserOperationRequest, Address]` - The User Operation Request to be submitted and the address of the Entrypoint to be used for the operation.

#### Returns

- `UserOperationEstimateGasResponse` - gas estimates for the UserOperation.

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

- `UserOperationResponse | null` - The UserOperation if it exists or null if it does not.

### `eth_supportedEntryPoints`

Returns the entry point addresses supported by the RPC provider.

#### Parameters

- `[]` - No parameters.

#### Returns

- `Address[]` - An array of addresses that are supported by the RPC provider.
