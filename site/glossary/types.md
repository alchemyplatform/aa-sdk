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

## **`UserOperationCallData`**

A type that specifies the necessary data for making a `UserOperation` (UO) call, which includes the target address, the call data, and the value. It acts as the fundamental input for invoking the `sendUserOperation` function in the [aa-sdk](https://github.com/alchemyplatform/aa-sdk/tree/main), simplifying the user experience by only requiring these three inputs to send a UO. The SDK handles the complexities of gas and fee estimation, paymaster data, and signature generation.

[See Type ↗](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/types.ts#L25)

## **`BatchUserOperationCallData`**

An array of **`UserOperationCallData`**, representing multiple `UserOperation` executions in a batch.

[See Type ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/types.ts#L36)

## **`UserOperationOverrides`**

Partial structure for overriding default values in a `UserOperation`, such as gas limits and fees.

[See Type ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/types.ts#L46)

## `UserOperationRequest`

Interface for the request format required for a JSON-RPC request to `eth_sendUserOperation`. It includes sender, nonce, gas limits, fees, and more fields.

[See Interface ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/types.ts#L60)

## `UserOperationEstimateGasResponse`

An interface that defines the structure for the response received from the RPC method [`eth_estimateUserOperationGas`](https://docs.alchemy.com/reference/eth-estimateuseroperationgas). This response provides detailed information about the estimated gas usage for a `UserOperation`.

[See Interface ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/types.ts#L85)

## `UserOperationResponse`

An interface that defines the structure for the response received from the RPC method [`eth_getUserOperationByHash`](https://docs.alchemy.com/reference/eth-getuseroperationbyhash), detailing the result of executing a `UserOperation`. It includes the block number, block hash, transaction hash and more information associated with the UO.

[See Interface ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/types.ts#L94)

## `UserOperationReceipt`

An interface that defines the structure for the response received from the RPC method [`eth_getUserOperationReceipt`](https://docs.alchemy.com/reference/eth-getuseroperationreceipt). It includes details like sender, nonce, gas cost and success status of the `UserOperation`.

[See Interface ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/types.ts#L107)

## `UserOperationReceiptObject`

Interface representing the `TransactionReceipt` object for the bundle in which the `UserOperation` was included.

[See Interface ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/types.ts#L132)

## `UserOperationReceiptLog`

Interface defining the `log` structure for `UserOperationReceiptObject`'s logs.

[See Interface ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/types.ts#L164)

## `UserOperationStruct`

Interface for structuring a `UserOperation`, with fields similar to `UserOperationRequest` but used for building requests.

[See Interface ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/types.ts#L187)

## `ISmartContractAccount`

Interface defining methods for managing and interacting with a smart account. It includes functionalities for obtaining the smart account’s initialization code, signing messages and operations, encoding transaction calls, retrieving account details like nonce and addresses, and handling ownership aspects of the smart account.

[See Interface ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/account/types.ts#L23)

## **`SupportedTransports`**

Type representing the various transport protocols supported by the package. This includes standard `Transport` as well as specialized types like [`FallbackTransport`](https://viem.sh/docs/clients/transports/fallback.html) and [`HttpTransport`](https://viem.sh/docs/clients/transports/http.html) which are imported from `Viem`.

[See Type ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/client/types.ts#L19)

## `PublicErc4337Client`

A client type that extends from the [`Viem` client](https://viem.sh/docs/clients/public.html). It integrates custom actions specific to [ERC-4337](https://accountkit.alchemy.com/glossary/terms.html#erc-4337). The `PublicErc4337Client` is used within the [Alchemy Provider](https://github.com/alchemyplatform/aa-sdk/blob/b0f8dd538728f8a7dd4447da8c88a50179d61f95/packages/alchemy/src/provider/base.ts#L26) as a JSON-RPC transport, supporting standard EVM RPC methods as well as facilitating communication and operations specific to ERC-4337, such as sending `UserOperations` (UOs), estimating gas, and fetching operation receipts and responses.

[See Type ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/client/types.ts#L98)

## `AccountMiddlewareFn`

A function type used as middleware in processing `UserOperations` (UOs). It takes a `UserOperationStruct` (potentially deferred), optional `UserOperationOverrides`, and `UserOperationFeeOptions`, and returns a promise that resolves to a modified `UserOperationStruct`. This function is important for applying custom logic or modifications to UOs before they are executed.

[See Type ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/provider/types.ts#L56)

## `AccountMiddlewareOverrideFn`

A specialized middleware function type that allows for more granular control over the `UserOperation` (UO) struct. It takes a `UserOperationStruct`, optional `UserOperationOverrides`, and `UserOperationFeeOptions`, and returns a promise. The return type is a combination of required and optional fields of `UserOperationStruct`, specified by the generic parameters `Req` and `Opt`. This function is designed to provide specific modifications or overrides to parts of the UO struct.

[See Type ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/provider/types.ts#L62)

## `ISmartAccountProvider`

An interface that defines a [provider](https://accountkit.alchemy.com/glossary/terms.html#provider) for smart accounts. It includes properties and methods for interacting with smart accounts and `UserOperations` (UOs), such as sending UOs, building UO structures, signing messages, and managing middleware.

[See Interface ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/provider/types.ts#L100)

## `SmartAccountSigner`

An interface representing a signer capable of signing messages and typed data. It provides methods to retrieve the signer's address (`getAddress`), sign a message (`signMessage`), and sign typed data (`signTypedData`).

[See Interface ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/signer/types.ts#L34)

## `SmartAccountAuthenticator`

An extension of the `SmartAccountSigner` interface, this interface includes additional functionalities for authentication. It provides methods to authenticate the signer (`authenticate`) and to retrieve authentication details (`getAuthDetails`).

[See Interface ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/signer/types.ts#L15)

## `RequestGasAndPaymasterAndDataOverrides`

A type representing a partial set of override options for `UserOperation` (UO) requests, specifically related to gas and paymaster data. It allows for optional customization of various gas-related parameters like `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, and `verificationGasLimit`. This type is particularly useful for dynamically adjusting gas settings in UO requests.

[See Interface ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/alchemy/src/middleware/types/index.ts)

## `BigNumberish`

A type that can be a hexadecimal string prefixed with `0x`, a `bigint`, or a `number`. It is used to represent values that can be converted to or operate as big integers.

[See Type ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/types.ts#L22)

## `BigNumberishRange`

An object type that may contain optional `min` and `max` fields, each of which accepts a `BigNumberish` value. This type is used to specify a numerical range, including both the minimum and maximum bounds.

[See Type ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/types.ts#L23)

## `Percentage`

An object type with a required `percentage` field, which is a `number` that must be within the range of 1 to 1000.

[See Type ↗️](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/types.ts#L20)
