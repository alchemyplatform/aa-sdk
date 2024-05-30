---
title: LitSigner • authenticate
description: Overview of the authenticate method on LitSigner
---

# authenticate

`authenticate` is a method on the `LitSigner` which leverages the Lit Protocol SDK to authenticate a user. Before accessing other methods on the class, such as signing messages or typed data or accessing user details, this method **MUST** be called.

## Usage

`LitSigner` allows for either an `AuthMethod` or `SessionSig` as context to authenticate, based on the LightSigner you create: `LitAuthMethod` or `LitSessionSigsMap` respectively.

If using an `AuthMethod`, then the implementation will handle signing a session signature which will be used as authentication material. If using a `SessionSig`, then the implementation will use that as authentication material for the signer.

For the `LitSigner` a generic type `C` is defined on the type to be either `AuthMethod` or `SessionSig`.

Where an `AuthMethod` or a `Session Signatures` maybe be provided as `context` for the `authentication`.

If a `Session Signature` is given then the session will be respected as long as it is valid for the given `pkpPublicKey` that was used to initialize the `LitSigner`.

### Auth Method

```ts [example.ts]
import {
  LitSigner,
  type LitAuthMethod,
} from "@alchemy/aa-signers/lit-protocol";
// [!code focus:99]

const API_KEY = "<YOUR API KEY>";
const POLYGON_MUMBAI_RPC_URL = `${polygonMumbai.rpcUrls.alchemy.http[0]}/${API_KEY}`;
const PKP_PUBLIC_KEY = "<your pkp public key>";

const AUTH_METHOD = "<your auth method>";

// for info on obtaining an auth method and minting pkp's
// see here:
const litSigner = new LitSigner<LitAuthMethod>({
  pkpPublicKey: PKP_PUBLIC_KEY,
  rpcUrl: RPC_URL,
});

// returns a `LitSessionSigsMap` instance if the authentication was successful
const authDetails = await litSigner.authenticate({
  context: AUTH_METHOD,
});
```

### Session Signatures

```ts [example.ts]
import {
  LitSigner,
  type LitSessionSigsMap,
} from "@alchemy/aa-signers/lit-protocol";
// [!code focus:99]

const PKP_PUBLIC_KEY = "<your pkp public key>";
const SESSION_SIGS = "<your sessionSig>";
const RPC_URL = "<your rpc url>";

// for info on obtaining an auth method and minting pkp's
// see here:
const litSigner = new LitSigner<LitSessionSigsMap>({
  pkpPublicKey: PKP_PUBLIC_KEY,
  rpcUrl: RPC_URL,
});

// returns a `SessionSigMap` regardless of using an auth sig or session signature
const authDetails = await litSigner.authenticate({
  context: SESSION_SIGS,
});
```

## Returns

### `Promise<LitUserMetadata>`

A `Promise` containing the `LitUserMetadata`, a map of `string -> object` containing the following fields:

- `sig: string` -- Signed authentication message of the given network node.
- `derivedVia: string` -- How the signature was generated.
- `address: string` -- Ethereum address of the key.
- `algo: string` -- Signing algorithm used.
- `signedMessage: string` -- `SIWE ReCap` Authentication message in the format of `SIWE ReCap`.
