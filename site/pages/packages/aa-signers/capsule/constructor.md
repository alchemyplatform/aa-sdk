---
title: CapsuleSigner • constructor
description: Overview of the constructor method on CapsuleSigner in aa-signers
---

# constructor

To initialize a `CapsuleSigner`, you must provide a set of parameters detailed below.

## Usage

```ts [example.ts]
import { CapsuleSigner } from "@alchemy/aa-signers/capsule";
import { ChainId } from "@capsule/capsule-web3-provider";

// instantiates using every possible parameter, as a reference
const capsuleSigner = new CapsuleSigner({
  env: Environment.DEVELOPMENT,
  apiKey: "CAPSULE_API_KEY",
  walletConfig: {
    chain: sepolia,
    // get your own Alchemy API key at: https://dashboard.alchemy.com/
    transport: http(`${sepolia.rpcUrls.alchemy.http[0]}/ALCHEMY_API_KEY`),
  },
});
```

## Returns

### `CapsuleSigner`

A new instance of a `CapsuleSigner`.

## Parameters

### `params: CapsuleProviderConfig | { inner: CapsuleWeb3Provider }`

You can either pass in a constructed `CapsuleWeb3Provider` object, or directly pass into the `CapsuleSigner` the `CapsuleProviderConfig` used to construct a `CapsuleWeb3Provider` object. These parameters are listed on the [Capsule docs](https://capsule-org.github.io/web-sdk/modules) as well.

`CapsuleProviderConfig` takes in the following parameters:

- `env: Environment` -- a Capsule API Key. You can get one at the [Capsule Developer Dashboard](https://developers.capsule.com/docs/quickstart#api-user-creation).

- `walletConfig: WalletClientConfig`-- Config for Viem Wallet. See type [here](https://viem.sh/docs/clients/wallet#parameters).

- `apiKey: string`-- Capsule API key for signing requests.

- `opts: ConstructorOpts | undefined`-- [optional] Object with the following properties. See type [here](https://capsule-org.github.io/web-sdk/functions/createCapsuleViemClient).

  - `useStorageOverrides: boolean` -- [optional] Flag to override storage.

  - `disableWorkers: boolean` -- [optional] Flag to disable workers.

  - `offloadMPCComputationURL: string` -- [optional] Override URL to offload MPC computation.

  - `useLocalFiles: boolean` -- [optional] Flag to use local files.

  - `localStorageGetItemOverride: (key: string) => Promise<string | null>` -- [optional] Override method for getting items from local storage.

  - `localStorageSetItemOverride: (key: string, value: string) => Promise<void>` -- [optional] Override method for setting items on local storage.

  - `sessionStorageGetItemOverride: (key: string) => Promise<string | null>` -- [optional] Override method for getting items from session storage.

  - `sessionStorageSetItemOverride: (key: string, value: string) => Promise<void>` -- [optional] Override method for setting items on session storage.

  - `sessionStorageRemoveItemOverride: (key: string) => Promise<void>` -- [optional] Override method for removing items on session storage.

  - `clearStorageOverride: () => Promise<void>` -- [optional] Override method for clearing storage.

  - `portalBackgroundColor: string` -- [optional] Color of background portal.

  - `portalPrimaryButtonColor: string` -- [optional] Color of portal primary button color.

  - `portalTextColor: string` -- [optional] Color of portal text.

  - `portalPrimaryButtonTextColor: string` -- [optional] Color of portal primary button text.

  - `useDKLSForCreation: boolean` -- [optional] Flag to use DKLS for creation.

- `viemClientOpts: ViemClientOpts` -- [optional] Object with the following properties:

  - `noAccount: boolean` -- [optional] Flag to skip creating a viem `Account` on Capsule's WalletClient, and instead have the `Account` be created and passed in separately when calling other methods on the client. Default false and recommended not to use.
