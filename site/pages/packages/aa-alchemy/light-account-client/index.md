---
title: createLightAccountAlchemyClient
description: Overview of the createLightAccountAlchemyClient factory in aa-alchemy
---

# createLightAccountAlchemyClient

`createLightAccountAlchemyClient` is a factory that improves the developer experience of connecting a Light Account to an `AlchemySmartAccountClient` via an optional dependency on the [`@alchemy/aa-accounts`](https://github.com/alchemyplatform/aa-sdk/tree/development/packages/accounts) package. You can use this to directly instantiate an `AlchemySmartAccountClient` already connected to a Light Account in one line of code.

## Usage

```ts [lightAccountClient.ts]
// [!include ~/snippets/aa-alchemy/light-account-client.ts]
```

## Returns

### `Promise<AlchemySmartAccountClient>`

A `Promise` containing a new `AlchemySmartAccountClient` connected to a Light Account.

## Parameters

### `config: AlchemyLightAccountClientConfig`

- `rpcUrl: string | undefined | never` -- a JSON-RPC URL. This is required if there is no `apiKey`.

- `apiKey: string | undefined | never` -- an Alchemy API Key. This is required if there is no `rpcUrl` or `jwt`.

- `jwt: string | undefined | never` -- an Alchemy JWT (JSON web token). This is required if there is no `apiKey`.

- `useSimulation: boolean` -- [optional] -- whether or not to simulate User Operations before sending them to ensure they don't revert

- `gasManagerConfig: AlchemyGasManagerConfig` -- [optional] if you want to use Alchemy's gas manager to sponsor gas.

  - `policyId: string` -- the policy id of the gas manager you want to use.
  - `gasEstimationOptions: AlchemyGasEstimationOptions` -- [optional] optional option configurable for the gas estimation portion of the Alchemy gas manager
  - `paymasterAddress: Address` -- [optional] paymaster address to use for the gas estimation. If not provided, the default paymaster address for the chain will be used.
  - `dummyData: Hex` -- [optional] dummy paymaster data to use for the gas estimation. If not provided, the default dummy data string will be used.

- `...accountParams`: CreateLightAccountParams -- additional parameters to pass to the [`createLightAccount`](/packages/aa-accounts/light-account/#createlightaccount).

- `...clientParams` -- [optional] additional parameters to pass to the [`SmartAccountClient`](/packages/aa-core/smart-account-client/) constructor.
