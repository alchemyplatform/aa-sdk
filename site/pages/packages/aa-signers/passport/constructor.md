---
title: PassportSigner • constructor
description: Overview of the constructor method on PassportSigner in aa-signers
---

# constructor

To initialize a `PassportSigner`, you must provide a set of parameters detailed below.

## Usage

:::code-group

```ts [example1.ts]
import { PassportSigner } from "@alchemy/aa-signers/passport";
import { Passport } from "@0xpass/passport";
import { WebAuthnSigner } from "@0xpass/webauthn-signer";

const passportSigner = new PassportSigner({
  scope_id: "<scope_id>",
  signer: new WebAuthnSigner({
    rpId: "<rpId>",
    rpName: "<rpName>",
  }),
  endpoint: "https://tiramisu.0xpass.io",
});
```

```ts [example2.ts]
import { PassportSigner } from "@alchemy/aa-signers/passport";
import { Passport } from "@0xpass/passport";
import { WebAuthnSigner } from "@0xpass/webauthn-signer";

export const passport = new Passport({
  scope_id: "scope_id",
  signer: new WebauthnSigner({
    rpId: "rpId",
    rpName: "rpName",
  }),
});

const passportSigner = new PassportSigner({
  scope_id: "<scope_id>",
  signer: new WebAuthnSigner({
    rpId: "<rpId>",
    rpName: "<rpName>",
  }),
  endpoint: "https://tiramisu.0xpass.io",
});
```

:::

## Returns

### `PassportSigner`

A new instance of a `PassportSigner`.

## Parameters

### `params: PassportClientParams | { inner: PassportClient }`

You can either pass in a constructed `PassportClient` object, or directly pass into the `PassportSigner` the `PassportClientParams` used to construct a `PassportClient` object.

`PassportClientParams` takes in the following parameters:

- `scope_id: string` -- A unique identifier for the scope within which the Passport client will operate.

- `signer: SignerWithOptionalCreator` -- An object that implements the `CredentialSigner` interface for signing assertions, and optionally, a `CredentialCreator` for creating attestations.

- `endpoint: string` -- [optional] The URL pointing to the Passport node.

- `fallbackProvider: string` -- The fallback provider in case the primary provider fails.

- `enclave_public_key?: string` -- [optional] The public key of the enclave for secure communication.
