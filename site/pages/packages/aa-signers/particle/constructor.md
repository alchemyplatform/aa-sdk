---
title: ParticleSigner • constructor
description: Overview of the constructor method on ParticleSigner in aa-signers
---

# constructor

To initialize a `ParticleSigner`, you must provide a set of parameters detailed below.

## Usage

```ts [example.ts]
import { ParticleSigner } from "@alchemy/aa-signers/particle";

// instantiates using every possible parameter, as a reference
const particle = new ParticleNetwork({
  projectId: "PROJECT_ID",
  clientKey: "CLIENT_KEY",
  appId: "APP_ID",
  chainName: "Ethereum",
  chainId: 1,
  securityAccount: {
    promptSettingWhenSign: true,
    promptMasterPasswordSettingWhenLogin: true,
  },
  preload: true,
  wallet: {
    displayWalletEntry: true,
    preload: true,
    supportChains: [{ id: 1, name: "Ethereum" }],
    uiMode: "auto",
    customStyle: {
      supportAddToken: true,
      supportChains: [{ id: 1, name: "Ethereum" }],
      displayTokenAddresses: [],
      displayNFTContractAddresses: [],
      priorityTokenAddresses: [],
      priorityNFTContractAddresses: [],
      fiatCoin: "USD",
      evmSupportWalletConnect: true,
      supportUIModeSwitch: true,
      supportLanguageSwitch: true,
    },
  },
});
```

## Returns

### `ParticleSigner`

A new instance of a `ParticleSigner`.

## Parameters

### `params: Config | { inner: ParticleNetwork; provider?: ParticleProvider }`

You can either pass in a constructed `ParticleNetwork` object, or directly pass into the `ParticleSigner` the `Config` used to construct a `ParticleNetwork` object. These parameters are listed on the [ParticleNetwork docs](https://developers.particle.network/reference/auth-web) as well.

`Config` takes in the following parameters:

- `projectId: string` -- a Particle project ID. You can get one at the [Particle Developer Dashboard](https://dashboard.particle.network/#/login).

- `clientKey: string`-- Particle client key. You can get this at the [Particle Developer Dashboard](https://dashboard.particle.network/#/login).

- `appId: string`-- ID of Particle app. You can get this at the [Particle Developer Dashboard](https://dashboard.particle.network/#/login).

- `chainName: string` -- [optional] name of chain on which to use the Particle Signer.

- `chainId: number` -- [optional] ID of chain on which to use the Particle Signer.

- `securityAccount: Object`-- [optional] object with the below flags

  - `promptSettingWhenSign: SettingOption | boolean` -- [optional] Flag to prompt settings to the user when signing using the Particle Signer. Modular to different levels of appearance frequency.

  - `promptMasterPasswordSettingWhenLogin: SettingOption | boolean` -- [optional] Flag to prompt master password setting to the user when logging in using the Particle Signer. Modular to different levels of appearance frequency.

- `preload: boolean` -- [optional] Flag to pre-load the Particle Signer.

- `wallet: WalletEntryOption` -- [optional] object with the below fields

  - `displayWalletEntry: boolean` -- [optional] Flag to display whether or not the circular wallet modal will be included on the web page after logging in.

  - `preload: boolean` -- [optional] Flag to preload the wallet information.

  - `defaultWalletEntryPosition: WalletEntryPosition` -- [optional] - Enum Setting to determine position of wallet entry on screen. Only applicable if `displayWalletEntry` is true.

  - `supportChains: Chain[]` -- [optional] List of supported chains

  - `uiMode: 'dark' | 'light' | 'auto'` -- [optional] Mode of UI.

  - `customStyle: WalletCustomStyle` -- [optional] Object defining the custom styling for the wallet. Typing shown in Particle's [Github repo here](https://github.com/Particle-Network/particle-web-demo/blob/master/packages/web-demo/src/types/customStyle.ts#L4).
