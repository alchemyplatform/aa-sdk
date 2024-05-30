---
title: TurnkeySigner • constructor
description: Overview of the constructor method on TurnkeySigner in aa-signers
---

# constructor

To initialize a `TurnkeySigner`, you must provide a set of parameters detailed below.

## Usage

```ts [example.ts]
import { TurnkeySigner } from "@alchemy/aa-signers/turnkey";
import { WebauthnStamper } from "@turnkey/webauthn-stamper";

// instantiates using the API Key stamper
const turnkeySigner = new TurnkeySigner({
  apiUrl: "api.turnkey.com",
  stamper: new WebauthnStamper({
    rpId: "your.app.xyz",
  }),
});
```

## Returns

### `TurnkeySigner`

A new instance of a `TurnkeySigner`.

## Parameters

### `params: TurnkeyClientParams | { inner: TurnkeyClient }`

You can either pass in a constructed `TurnkeyClient` object, or directly pass into the `TurnkeySigner` the `TurnkeyClientParams` used to construct a `TurnkeyClient` object.

`TurnkeyClientParams` takes in the following parameters:

- `apiUrl: string` -- a URL pointing to the Turnkey public API. You can use https://api.turnkey.com.

- `stamper: TStamper` -- a Turnkey stamper to sign requests. Every request to Turnkey must be signed using a [stamper](https://docs.turnkey.com/category/api-design). Turnkey supports multiple stampers including [`@turnkey/webauthn-stamper`](https://github.com/tkhq/sdk/tree/main/packages/webauthn-stamper) to sign requests with Passkeys or WebAuthn devices, [`@turnkey/iframe-stamper`](https://github.com/tkhq/sdk/tree/main/packages/iframe-stamper) with Email, and [`@turnkey/api-key-stamper`](https://github.com/tkhq/sdk/tree/main/packages/api-key-stamper) with API keys.
