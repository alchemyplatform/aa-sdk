---
title: LitSigner • constructor
description: Overview of the constructor method on LitSigner in aa-signers
---

# constructor

## Usage

When initializing a new instance of `LitSigner` you can choose to use an `AuthMethod (LitAuthMethod)` or `Session Signature (LitSessionSigsMap)`.
If providing an `LitAuthMethod`, the auth method will be authenticated, creating a `Session Signature`.

A `Session Signature` can be provided and will be used as the active session, and will be returned from `Authenticate` and `AuthDetails`.

```ts [example.ts]
import { LitSigner, LitAuthMethod } from "@alchemy/aa-signers";
// [!code focus:99]

new LitSigner<LitAuthMethod>({
  pkpPublicKey: "PKP_PUBLIC_KEY",
  rpcUrl: "RPC_URL",
  network: "cayenne",
  debug: false,
});
```

or

```ts [example.ts]
import { LitSigner, LitSessionSigsMap } from "@alchemy/aa-signers";

new LitSigner<LitSessionSigMap>({
  pkpPublicKey: "PKP_PUBLIC_KEY",
  rpcUrl: "RPC_URL",
  network: "cayenne",
  debug: false,
});
```

## Returns

A new instance of `LitSigner`

## Parameters

`LitConfig` takes the following arguments:

- `pkpPublicKey: string` -- PKP public key
- `rpcUrl: string` -- RPC URL for the chain you wish to connect to
- `network: string` -- [optional] The desired Lit Protocol network to connect to. Defaults to `cayenne` (pkps must be on the network specified)
- `debug: boolean` -- [optional] Enable / disable debug logging. Defaults to `false`
