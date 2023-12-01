---
outline: deep
head:
  - - meta
    - property: og:title
      content: AlchemyProvider • createLightAccountAlchemyProvider
  - - meta
    - name: description
      content: Overview of the createLightAccountAlchemyProvider factory in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the createLightAccountAlchemyProvider factory in aa-alchemy
---

# createLightAccountAlchemyProvider

`createLightAccountAlchemyProvider` is a factory that improves the developer experience of connecting a Light Account to an `AlchemyProvider` via an optional dependency on the [`@alchemy/aa-accounts`](https://github.com/alchemyplatform/aa-sdk/tree/development/packages/accounts) package. You can use this to directly instantiate an `AlchemyProvider` already connected to a Light Account in one line of code.

## Usage

::: code-group

<<< @/snippets/light-account-alchemy-provider.ts
:::

## Returns

### `Promise<AlchemyProvider & { account: LightSmartContractAccount }>`

A Promise containing a new `AlchemyProvider` connected to a Light Account.

## Parameters

### `config: AlchemyProviderConfig`

- `rpcUrl: string | undefined | never` -- a JSON-RPC URL. This is required if there is no `apiKey`.

- `apiKey: string | undefined | never` -- an Alchemy API Key. This is required if there is no `rpcUrl` or `jwt`.

- `jwt: string | undefined | never` -- an Alchemy JWT (JSON web token). This is required if there is no `apiKey`.

- `chain: Chain` -- the chain on which to create the provider.

- `owner: SmartAccountSigner` -- the owner EOA address responsible for signing user operations on behalf of the smart account.

- `entryPointAddress: Address | undefined` -- [optional] the entry point contract address. If not provided, the entry point contract address for the provider is the connected account's entry point contract, or if not connected, falls back to the default entry point contract for the chain. See [getDefaultEntryPointAddress](/packages/aa-core/utils/getDefaultEntryPointAddress.html#getdefaultentrypointaddress).

- `opts: SmartAccountProviderOpts | undefined` -- [optional] overrides on provider config variables having to do with fetching transaction receipts and fee computation.

  - `txMaxRetries: string | undefined` -- [optional] the maximum number of times to try fetching a transaction receipt before giving up (default: 5).

  - `txRetryIntervalMs: string | undefined` -- [optional] the interval in milliseconds to wait between retries while waiting for transaction receipts (default: 2_000).

  - `txRetryMulitplier: string | undefined` -- [optional] the mulitplier on interval length to wait between retries while waiting for transaction receipts (default: 1.5).

  - `feeOptions:` [`UserOperationFeeOptions`](/packages/aa-core/types/userOperationFeeOptions.md) `| undefined` --[optional] user operation fee options to be used for gas estimation, set at the global level on the provider.
    If not set, default fee options for the chain are used. Available fields in `feeOptions` include `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit` where each field is of type [`UserOperationFeeOptionsField`](/packages/aa-core/types/userOperationFeeOptionsField.md).

    - `maxFeePerGas`: `UserOperationFeeOptionsField`
    - `maxPriorityFeePerGas`: `UserOperationFeeOptionsField`
    - `callGasLimit`: `UserOperationFeeOptionsField`
    - `verificationGasLimit`: `UserOperationFeeOptionsField`
    - `preVerificationGas`: `UserOperationFeeOptionsField`

- `factoryAddress: Address | undefined` -- [optional] the factory address for the smart account implementation, which is required for creating the account if not already deployed. Defaults to the [getDefaultLightAccountFactoryAddress](/packages/aa-accounts/utils/getDefaultLightAccountFactoryAddress.md)

- `initCode: Hex | undefined` -- [optional] the initCode for deploying the smart account with which the provider will connect.

- `accountAddress: Address | undefined` -- [optional] [optional] a smart account address override that this object will manage instead of generating its own.
