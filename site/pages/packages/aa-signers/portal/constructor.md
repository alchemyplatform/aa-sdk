---
title: PortalSigner • constructor
description: Overview of the constructor method on PortalSigner in aa-signers
---

# constructor

To initialize a `PortalSigner`, you must provide a set of parameters detailed below.

## Usage

```ts [example.ts]
import { PortalSigner } from "@alchemy/aa-signers/portal";
import { ChainId } from "@portal/portal-web3-provider";

// instantiates using every possible parameter, as a reference
const portalSigner = new PortalSigner({
  // Required options
  gatewayConfig: GatewayLike

  // Optional options
  apiKey?: string
  authToken?: string
  authUrl?: string
  autoApprove?: boolean
  chainId?: number
  gdrive?: GDriveConfig
  host?: string
  keychain?: KeychainAdapter
  mpcVersion?: string
  featureFlags?: FeatureFlags
});
```

## Returns

### `PortalSigner`

A new instance of a `PortalSigner`.

## Parameters

### `params: PortalProviderConfig | { inner: PortalWeb3Provider }`

You can either pass in a constructed `PortalWeb3Provider` object, or directly pass into the `PortalSigner` the `PortalProviderConfig` used to construct a `PortalWeb3Provider` object. These parameters are listed on the [Portal repo](https://github.com/portal/portal-web3-provider/blob/main/src/types.ts#L48) as well.

`PortalProviderConfig` takes in the following parameters:

- `gatewayConfig: { [key: number]: string } | string` -- a Config for the Portal Signer, typically an Alchemy RPC URL.

- `apiKey: string` -- [optional] A Portal API Key. You can get one at the [Portal Dashboard](https://docs.portalhq.io/).

- `authToken: string` -- [optional] A Portal auth token.

- `authUrl: string` -- [optional] A Portal auth URL.

- `autoApprove: boolean` -- [optional] Flag to auto-approve signatures.

- `chainId: number` -- [optional] A chain ID.

- `gdrive: { clientId: string }` -- [optional] An ID of a google drive config the Portal Signer can use.

- `host: string` -- [optional] A host URL.

- `keychain: KeychainAdapter` -- [optional] An object containing metadata for the Portal Signer's keychain.

- `mpcVersion: string` -- [optional] The version of MPC the Portal Signer should use.

- `featureFlags: { optimized: boolean }` -- [optional] An object with feature flags on the Portal Signer. Defaults false for optimization (beta).
