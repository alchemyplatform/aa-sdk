---
outline: deep
head:
  - - meta
    - property: og:title
      content: AlchemyProvider • constructor
  - - meta
    - name: description
      content: Overview of the constructor method on AlchemyProvider in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the constructor method on AlchemyProvider in aa-alchemy
---

# constructor

To initialize an `AlchemyProvider`, you must provide a set of parameters detailed below.

## Usage

::: code-group

```ts [example.ts]
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { getDefaultEntryPointAddress } from "@alchemy/aa-core";
import { sepolia } from "viem/chains";

// instantiates using every possible parameter, as a reference
export const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY", // replace with your Alchemy API Key
  chain: sepolia,
  entryPointAddress: getDefaultEntryPointAddress(sepolia),
  opts: {
    txMaxRetries: 10,
    txRetryIntervalMs: 2_000,
    txRetryMulitplier: 1.5,
    minPriorityFeePerBid: 100_000_000n,
  },
  feeOpts: {
    baseFeeBufferPercent: 50n,
    maxPriorityFeeBufferPercent: 5n,
    preVerificationGasBufferPercent: 5n,
  },
});
```

:::

## Returns

### `AlchemyProvider`

A new instance of an `AlchemyProvider`.

## Parameters

### `config: AlchemyProviderConfig`

- `rpcUrl: string | undefined | never` -- a JSON-RPC URL. This is required if there is no `apiKey`.

- `apiKey: string | undefined | never` -- an Alchemy API Key. This is required if there is no `rpcUrl` or `jwt`.

- `jwt: string | undefined | never` -- an Alchemy JWT (JSON web token). This is required if there is no `apiKey`.

- `chain: Chain` -- the chain on which to create the provider.

- `entryPointAddress: Address | undefined` -- [optional] the entry point contract address. If not provided, the entry point contract address for the provider is the connected account's entry point contract, or if not connected, falls back to the default entry point contract for the chain. See [getDefaultEntryPointAddress](/packages/aa-core/utils/getDefaultEntryPointAddress.html#getdefaultentrypointaddress).

- `opts: Object | undefined` -- [optional] overrides on provider config variables having to do with fetching transaction receipts and fee computation.

  - `txMaxRetries: string | undefined` -- [optional] the maximum number of times to try fetching a transaction receipt before giving up (default: 5).

  - `txRetryIntervalMs: string | undefined` -- [optional] the interval in milliseconds to wait between retries while waiting for transaction receipts (default: 2_000).

  - `txRetryMulitplier: string | undefined` -- [optional] the mulitplier on interval length to wait between retries while waiting for transaction receipts (default: 1.5).

  - `minPriorityFeePerBid: string | undefined` --[optional] used when computing the fees for a user operation (default: 100_000_000).

- `feeOpts: Object | undefined` -- [optional] overrides on provider config variables having to do with gas and fee estimation.

  - `baseFeeBufferPercent: bigint | undefined` -- [optional] a percent buffer on top of the base fee estimated (default 50%). This is only applied if the default fee estimator is used.

  - `maxPriorityFeeBufferPercent: bigint | undefined` -- [optional] a percent buffer on top of the priority fee estimated (default 5%). This is only applied if the default fee estimator is used.

  - `preVerificationGasBufferPercent: bigint | undefined` -- [optional] a percent buffer on top of the preVerificationGas estimated (default 5% on Arbitrum and Optimism, 0% elsewhere). This is only useful on Arbitrum and Optimism, where the preVerificationGas is dependent on the gas fee during the time of estimation. To improve chances of the `UserOperation` being mined, users can increase the preVerificationGas by a buffer. This buffer will always be charged, regardless of price at time of mine. This is only applied if the default gas estimator is used.
