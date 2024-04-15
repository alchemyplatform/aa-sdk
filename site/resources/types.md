---
outline: deep
head:
  - - meta
    - property: og:title
      content: Types
  - - meta
    - name: description
      content: Glossary of types in aa-sdk
  - - meta
    - property: og:description
      content: Glossary of types in aa-sdk
  - - meta
    - name: twitter:title
      content: Types
  - - meta
    - name: twitter:description
      content: Glossary of types in aa-sdk
---

# Types

## `BatchUserOperationCallData`

An array of `UserOperationCallData`, representing a sequence of `UserOperations` to be executed in batch by calling the `executeBatch` function on the `SmartContractAccount` contract. Check out our guide on [How to submit batch transactions](/using-smart-accounts/batch-user-operations) to learn more about batching multiple transactions into a single `UserOperation`.

::: details BatchUserOperationCallData
<<< @/../packages/core/src/types.ts#BatchUserOperationCallData
:::

## `BigNumberish`

A type that can be a hexadecimal string prefixed with [`Hex`](https://viem.sh/docs/glossary/types#hex), a `bigint`, or a `number`. It is used to represent values that can be converted to or operate as big integers.

::: details BigNumberish
<<< @/../packages/core/src/utils/schema.ts#BigNumberish
:::

## `BigNumberishRange`

An object type that may contain optional `min` and `max` fields, each of which accepts a `BigNumberish` value. This type is used to specify a numerical range, including both the minimum and maximum bounds.

::: details BigNumberishRange
<<< @/../packages/core/src/utils/schema.ts#BigNumberishRange
:::

## `BundlerAction`

Bundler Actions are `viem` [`Actions`](https://viem.sh/docs/actions/public/introduction) that map one-to-one with "public" [`Bundler`](./terms#bundler) RPC methods (`eth_sendUserOperation`, `eth_getUserOperationByHash`, etc.) under the [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) and [EIP-6900](https://eips.ethereum.org/EIPS/eip-6900) standards. They are used with a [`BundlerClient`](#bundlerclient). `BundlerActions` do not require any special permissions, nor do they provide "signing" capabilities to the user. Examples of `BundlerActions` include retrieving the details of a specific user operation, estimating user operation gas, etc.

::: details BundlerAction
<<< @/../packages/core/src/client/decorators/bundlerClient.ts#BundlerActions
:::

## `BundlerClient`

`BundlerClient` is a custom `viem` [`Client`](https://viem.sh/docs/clients/custom) we have built our own, where we extended viem's [`PublicClient`](https://viem.sh/docs/clients/public) with [`BundlerActions`](#bundleraction), which are `Actions` that provide custom functionalities of [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) and [EIP-6900](https://eips.ethereum.org/EIPS/eip-6900) standards. `BundlerClient` is an intermediary or connector that enables client applications to interact with the [`Bundler`](https://eips.ethereum.org/EIPS/eip-4337#definitions) that you are using. `BundlerClient`, because it extends `PublicClient`, supports [`Public Actions`](https://viem.sh/docs/actions/public/introduction) for client applications to connect, query, and interact with the blockchain (i.e., sending transactions, smart contract executions, data retrieval, etc.).

::: details BundlerClient
<<< @/../packages/core/src/client/bundlerClient.ts#BundlerClient
:::

## `ClientMiddleware`

Middleware represents different operations involved in the [`SmartAccountClient`](/packages/aa-core/smart-account-client/) pipeline for constructing a user operation given the user inputs by populating the UO with other data, including gas fees, paymaster data, etc.

::: details ClientMiddleware
<<< @/../packages/core/src/middleware/types.ts#ClientMiddleware
:::

## `ClientMiddlewareFn`

Each middleware is a function that takes in a user operation object, `UserOperationStruct`, performs its job to retrieve or compute the data, and populate different fields of the user operation to pass onto the next middleware in the pipeline before being signed and sent to the network. `ClientMiddlewareFn` is the function type that represents each middleware. In optional [`UserOperationOverrides`](#useroperationoverrides), and [`UserOperationFeeOptions`](/packages/aa-core/smart-account-client/types/userOperationFeeOptions), and returns a promise that resolves to a modified `UserOperationStruct`. This function is what you specify as your overridden middleware value for applying custom logic during the `UserOperationStruct` object to be sent to the bundler for on-chain execution.

::: details ClientMiddlewareFn
<<< @/../packages/core/src/middleware/types.ts#ClientMiddlewareFn
:::

## `Multiplier`

An object type with a required `multipler` field, which is a `number` that must be within the range of 1 to 1000.

::: details Multiplier
<<< @/../packages/core/src/utils/schema.ts#Multiplier
:::

## `SmartAccountAuthenticator`

An extension of the [`SmartAccountSigner`](#smartaccountsigner) interface, this interface contains authentication-related functions in addition to the signing methods of the `SmartAccountSigner`. It provides methods to authenticate the signer (`authenticate`) as the "authorized" signer, often as the owner, of the `SmartContractAccount`. It also has methods to retrieve authentication details (`getAuthDetails`) about the signer instance that the user is using to authenticate to one's account.

::: details SmartAccountAuthenticator
<<< @/../packages/core/src/middleware/types.ts#SmartAccountAuthenticator
:::

## `SmartAccountClient`

`SmartAccountClient` is a custom `viem` `Client`, like the [`BundlerClient`](#bundlerclient), which is an intermediary or connector that enables your client application to interact with the `SmartContractAccount`. `SmartAccountClient` is analogous to the [`WalletClient`](https://viem.sh/docs/clients/wallet). The difference is that while `WalletClient` has [`WalletActions`](https://viem.sh/docs/actions/wallet/introduction) that lets your client application interact with an [Externally-owned account (EOA)](https://ethereum.org/developers/docs/accounts) with a [wallet](#wallet), `SmartAccountClient` provides [`SmartAccountClientActions`](#smartaccountclientaction) for client applications to interact with `SmartContractAccounts`.

::: details SmartAccountClient
<<< @/../packages/core/src/client/smartAccountClient.ts#SmartAccountClient
:::

## `SmartAccountClientAction`

`SmartAccountClientActions` are `viem` [`Actions`](https://viem.sh/docs/actions/wallet/introduction) that map one-to-one with smart contract account-related or "signable" actions, such as constructing user operation requests to be sent to the [`Bundler`](./terms#bundler), signing messages or user operation requests, sending user operations to the `Bundler`, upgrading accounts to different implementation address, etc. They are used with a `SmartAccountClient`. `SmartAccountClientActions` require special permissions and provide signing capabilities for `SmartContractAccounts`.

::: details SmartAccountClientAction
<<< @/../packages/core/src/client/smartAccountClient.ts#SmartAccountClientActions
:::

## `SmartAccountSigner`

An interface representing a signer capable of signing messages and typed data. It provides methods to retrieve the signer's address (`getAddress`), sign a message (`signMessage`), and sign typed data (`signTypedData`). `SmartAccountSigner` refers to the [`Signer`](./terms#signer) instance responsible for the signing activities using its private key for smart account activities. Often, the `Signer` is referred to as the `Owner` of the account as it has the authority to use the smart account on-chain with its signatures.

::: details SmartAccountSigner
<<< @/../packages/core/src/middleware/types.ts#SmartAccountSigner
:::

## `SmartContractAccount`

As smart contract accounts are essentially the contract codes that operate on the blockchain, `SmartContractAccount` defines the interface with different functionalities for managing and interacting with the contract account. It includes different functionalities for creating, managing, and using your smart account. In addition to supporting all functionalities achieved with a basic [EOA](./terms#wallet) alone, `SmartContractAccount` can have custom capabilities such as automating processes or executing actions based on predefined conditions. Smart contract wallets allow users to customize how they manage their digital assets, offering a more tailored approach to handling funds securely.

::: details SmartContractAccount
<<< @/../packages/core/src/account/smartContractAccount.ts#SmartContractAccount
:::

## `User`

`User` is a type that defines the model for the details of a user's Embedded Account via an Alchemy Signer. It includes the user's `email`, `orgId`, `userId`, `userId`, `address` (the EOA signer address corresponding to the user credentials), and `credentialId`. You can use the [`useUser`](../react/useUser.md) react hook to look up a user.

::: details User
<<< @/../packages/alchemy/src/signer/client/types.ts#User
:::

## `UserOperationCallData`

`UserOperationCallData` is a type that represents the user's "intent" or the desired outcome representing a specific objective a user aims to accomplish. It includes `target` (the destination address), `data` (the [`Transaction calldata`](./terms#transaction-calldata)), and `value` (the amount value of ETH, or the native token to send). It acts as the input to the `sendUserOperation` method on [`SmartAccountClient`](#smartaccountclient).

::: details UserOperationCallData
<<< @/../packages/core/src/types.ts#UserOperationCallData
:::

## `UserOperationEstimateGasResponse`

An interface that defines the structure for the response received from the RPC method [`eth_estimateUserOperationGas`](https://docs.alchemy.com/reference/eth-estimateuseroperationgas). This response provides detailed information about the estimated gas usage for a `UserOperation`.

::: details UserOperationEstimateGasResponse
<<< @/../packages/core/src/types.ts#UserOperationEstimateGasResponse
:::

## `UserOperationOverrides`

Partial structure for overriding default values in a `UserOperationStruct`, such as gas limits and fees. Available fields include `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit`, `paymasterAndData`, or `nonceKey`. You can also specify a `stateOverride` to be passed into `eth_estimateUserOperationGas` during fee estimation. These override values are available from each [`ClientMiddleware`](#clientmiddleware) of the `SmartAccountClient`. Check out [`UserOperationOverrides`](/packages/aa-core/smart-account-client/types/userOperationOverrides) page to learn more.

::: details UserOperationOverrides
<<< @/../packages/core/src/types.ts#UserOperationOverrides
:::

## `UserOperationReceipt`

An interface that defines the structure for the response received from the RPC method [`eth_getUserOperationReceipt`](https://docs.alchemy.com/reference/eth-getuseroperationreceipt). It includes details like sender, nonce, gas cost, and success status of the `UserOperation`.

::: details UserOperationReceipt
<<< @/../packages/core/src/types.ts#UserOperationReceipt
:::

## `UserOperationRequest`

Interface for the request format required for a JSON-RPC request to `eth_sendUserOperation`. It includes sender, nonce, gas limits, fees, and more fields.

::: details UserOperationRequest
<<< @/../packages/core/src/types.ts#UserOperationRequest
:::

## `UserOperationResponse`

An interface that defines the structure for the response received from the RPC method [`eth_getUserOperationByHash`](https://docs.alchemy.com/reference/eth-getuseroperationbyhash), detailing the result of executing a `UserOperation`. It includes the block number, block hash, transaction hash and more information associated with the UO.

::: details UserOperationResponse
<<< @/../packages/core/src/types.ts#UserOperationResponse
:::

## `UserOperationStruct`

Interface for structuring a `UserOperation`, with fields similar to `UserOperationRequest` but used for building requests.

::: details UserOperationStruct
<<< @/../packages/core/src/types.ts#UserOperationStruct
:::
