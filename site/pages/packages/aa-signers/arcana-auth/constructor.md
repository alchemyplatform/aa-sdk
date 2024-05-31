---
title: ArcanaAuthSigner • constructor
description: Overview of the constructor method on ArcanaAuthSigner in aa-signers
---

# constructor

To initialize `ArcanaAuthSigner`, you must provide a set of parameters detailed below.

## Usage

```ts [example.ts]
import { ArcanaAuthSigner } from "@alchemy/aa-signers";

// instantiates using every possible parameter, as a reference
const newArcanaAuthSigner = new ArcanaAuthSigner({
  clientId: "ARCANA_AUTH_CLIENT_ID", //Register app through dashboard and get clientId
  params: { //See `AuthProvider` constructor params
    network: 'testnet' | 'mainnet' | `NetworkConfig`
    alwaysVisible: boolean  // Wallet displayed always in the app or only when a transaction needs review
    chainConfig: `ChainConfigInput`
    redirectUrl: string // After authentication, window where the control returns
    theme: 'light' | 'dark'
    position: 'left' | 'right'  // Wallet displayed on LHS or RHS in the app context
    setWindowProvider: `boolean`  // default is false
    connectOptions: ConnectOptions
  },
});
```

For details, see [`AuthProvider ConstructorParams`](https://authsdk-ref-guide.netlify.app/interfaces/constructorparams).

## Returns

### `ArcanaAuthSigner`

A new instance of an `ArcanaAuthSigner`.

## Parameters

### `params: { clientId: string, params: ConstructorParams } | { inner: AuthProvider }`

You can either pass in a constructed `AuthProvider` object, or directly pass into the `ArcanaAuthSigner` the `clientId` and the `AuthProvider` [`ConstructorParams`](https://authsdk-ref-guide.netlify.app/interfaces/constructorparams) used to construct an `AuthProvider` object. These parameters are listed on the [Arcana Auth SDK Reference Guide](https://authsdk-ref-guide.netlify.app/interfaces/constructorparams). You can refer to tutorials and the sample code for usage details in the [Arcana Docs](https://docs.arcana.network/tutorials/code-samples/web/) as well.

`ArcanaAuthSigner` takes in the following parameters:

- `inner`: an `AuthProvider` object
  or
- `clientId: string` -- a unique app id assigned after app registration via the [Arcana Developer Dashboard](https://dashboard.arcana.network/).

- `params: ConstructorParams` -- [optional] these are used to customize the Arcana Auth SDK usage.

See [`ConstructorParams`](https://authsdk-ref-guide.netlify.app/interfaces/constructorparams) for details.
