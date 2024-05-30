---
title: FireblocksSigner • constructor
description: Overview of the constructor method on FireblocksSigner in aa-signers
---

# constructor

To initialize a `FireblocksSigner`, you must provide a set of parameters detailed below.

## Usage

```ts [example.ts]
import { FireblocksSigner } from "@alchemy/aa-signers/fireblocks";
import { ChainId } from "@fireblocks/fireblocks-web3-provider";

// instantiates using every possible parameter, as a reference
const fireblocksSigner = new FireblocksSigner({
  apiKey: "API_KEY",
  privateKey: "PATH_TO_FILE_WITH_PRIVATE_KEY",
  chainId: ChainId.SEPOLIA,
  rpcUrl: "ALCHEMY_RPC_URL",
  vaultAccountIds: ["VAULT_ID"],
  apiBaseUrl: "FIREBLOCKS_API_URL",
  note: "note",
  pollingInterval: 1000,
  oneTimeAddressesEnabled: true,
  externalTxId: "1",
  userAgent: "test-header",
  assetId: "1",
  logTransactionStatusChanges: true,
  logRequestsAndResponses: true,
  enhancedErrorHandling: true,
  gaslessGasTankVaultId: 1,
});
```

## Returns

### `FireblocksSigner`

A new instance of a `FireblocksSigner`.

## Parameters

### `params: FireblocksProviderConfig | { inner: FireblocksWeb3Provider }`

You can either pass in a constructed `FireblocksWeb3Provider` object, or directly pass into the `FireblocksSigner` the `FireblocksProviderConfig` used to construct a `FireblocksWeb3Provider` object. These parameters are listed on the [Fireblocks repo](https://github.com/fireblocks/fireblocks-web3-provider/blob/main/src/types.ts#L48) as well.

`FireblocksProviderConfig` takes in the following parameters:

- `apiKey: string` -- a Fireblocks API Key. You can get one at the [Fireblocks Developer Dashboard](https://developers.fireblocks.com/docs/quickstart#api-user-creation).

- `privateKey: string`-- Fireblocks API private key for signing requests.

- `chainId: ChainId`-- Fireblocks API private key for signing requests. Required if `rpcUrl` is not provided.

- `rpcUrl: ChainId`-- Url to which to transport JSON-RPC requests. Required if `chainId` is not provided.

- `vaultAccountIds: number | number[] | string | string[]` -- [optional] list of Fireblocks vaults to provide for the Signer. By default, the first 20 vault accounts are dynamically loaded from the Fireblocks API.

- `apiBaseUrl` -- [optional] base Url for querying the Fireblocks API. By default, it uses the Fireblocks API production endpoint.

- `fallbackFeeLevel: FeeLevel = "LOW" | "MEDIUM" | "HIGH"` -- [optional] fallback fee for requests. Default Medium.

- `note: string` -- [optional] By default, the note is set to "Created by Fireblocks Web3 Provider."

- `pollingInterval: number` -- [optional] The interval in which the Fireblocks API is queried to check the status of transactions. Default is 1 second.

- `oneTimeAddressesEnabled: boolean` -- [optional] Flag to determine if one time addresses are enabled in your Fireblocks workspace. Default true.

- `externalTxId: (() => string) | string` -- [optional] External ID you can use to associate with transactions.

- `userAgent: string` -- [optional] Additional appended product string to the `User-Agent` header on requests.

- `assetId: string` -- [optional] custom ID for a Fireblocks asset, used with custom or private EVM chains.

- `logTransactionStatusChanges: boolean` -- [optional] Flag to determine if every transaction status change will be logged to the console. Default false.

- `logRequestsAndResponses: boolean` -- [optional] Flag to determine if every request and response processed by the provider will be logged to the console. Default false.

- `enhancedErrorHandling: boolean` -- [optional] Flag to determine verbosity of failed transaction information. Default true.

- `gaslessGasTankVaultId: number` -- [optional] If set, all transactions sent gaslessly, relayed via the provided vault ID. Default true.
