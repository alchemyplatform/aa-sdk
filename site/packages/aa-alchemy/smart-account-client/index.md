---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Smart Account Client
  - - meta
    - name: description
      content: Overview of the Alchemy Smart Account Client in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the Alchemy Smart Account Client in aa-alchemy
---

# Alchemy Smart Account Client

To create an `AlchemySmartAccountClient`, you must provide a set of parameters detailed below.

## Usage

::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { getDefaultEntryPointAddress } from "@alchemy/aa-core";
import { sepolia } from "@alchemy/aa-core";

// instantiates using every possible parameter, as a reference
export const provider = createAlchemySmartAccountClient({
  /// REQUIRED ///
  apiKey: "ALCHEMY_API_KEY", // replace with your Alchemy API Key
  chain: sepolia,
  /// OPTIONAL ///
  opts: {
    txMaxRetries: 10,
    txRetryIntervalMs: 2_000,
    txRetryMulitplier: 1.5,
    minPriorityFeePerBid: 100_000_000n,
    feeOpts: {
      baseFeeBufferPercent: 50n,
      maxPriorityFeeBufferPercent: 5n,
      preVerificationGasBufferPercent: 5n,
    },
  },
  // will simulate user operations before sending them to ensure they don't revert
  useSimulation: true,
  // if you want to use alchemy's gas manager
  gasManagerConfig: {
    policyId: "policy-id",
  },
});
```

:::

## Returns

### `AlchemySmartAccountClient`

A new instance of an `AlchemySmartAccountClient`.

## Parameters

### `config: AlchemyProviderConfig`

- `rpcUrl: string | undefined | never` -- a JSON-RPC URL. This is required if there is no `apiKey`.

- `apiKey: string | undefined | never` -- an Alchemy API Key. This is required if there is no `rpcUrl` or `jwt`.

- `jwt: string | undefined | never` -- an Alchemy JWT (JSON web token). This is required if there is no `apiKey`.

- `chain: Chain` -- the chain on which to create the provider.

- `useSimulation?: boolean` -- whether or not to simulate user operations before sending them to ensure they don't revert.

- `gasManagerConfig?: GasManagerConfig` -- if you want to use alchemy's gas manager.

  - `policyId: string` -- the policy id of the gas manager you want to use.

- `opts: SmartAccountProviderOpts | undefined` -- [optional] overrides on provider config variables having to do with fetching transaction receipts and fee computation.

  - `txMaxRetries: string | undefined` -- [optional] the maximum number of times to try fetching a transaction receipt before giving up (default: 5).

  - `txRetryIntervalMs: string | undefined` -- [optional] the interval in milliseconds to wait between retries while waiting for transaction receipts (default: 2_000).

  - `txRetryMulitplier: string | undefined` -- [optional] the mulitplier on interval length to wait between retries while waiting for transaction receipts (default: 1.5).

  - `feeOptions:` [`UserOperationFeeOptions`](/packages/aa-core/smart-account-client/types/userOperationFeeOptions.md) `| undefined` --[optional] user operation fee options to be used for gas estimation, set at the global level on the provider.
    If not set, default fee options for the chain are used. Available fields in `feeOptions` include `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit` where each field is of type [`UserOperationFeeOptionsField`](/packages/aa-core/smart-account-client/types/userOperationFeeOptionsField.md).

    - `maxFeePerGas`: `UserOperationFeeOptionsField`
    - `maxPriorityFeePerGas`: `UserOperationFeeOptionsField`
    - `callGasLimit`: `UserOperationFeeOptionsField`
    - `verificationGasLimit`: `UserOperationFeeOptionsField`
    - `preVerificationGas`: `UserOperationFeeOptionsField`
