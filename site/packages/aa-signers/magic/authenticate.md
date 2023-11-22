---
outline: deep
head:
  - - meta
    - property: og:title
      content: MagicSigner • authenticate
  - - meta
    - name: description
      content: Overview of the authenticate method on MagicSigner
  - - meta
    - property: og:description
      content: Overview of the authenticate method on MagicSigner
---

# authenticate

`authenticate` is a method on the `MagicSigner` which leverages the `Magic` web SDK to authenticate a user.

This method must be called before accessing the other methods available on the `MagicSigner`, such as signing messages or typed data or accessing user details.

## Usage

::: code-group

```ts [example.ts]
// [!code focus:99]
import { MagicSigner } from "@alchemy/aa-signers";

const magicSigner = new MagicSigner({ apiKey: MAGIC_API_KEY });
const authParams = {
  authenticate: async () => {
    await magicSigner.inner.wallet.connectWithUI();
  },
};

await magicSigner.authenticate(authParams);
```

:::

## Returns

### `Promise<MagicUserMetadata>`

A Promise containing the `MagicUserMetadata`, and object with the following fields:

- `issuer: string | null` -- the Decentralized ID of the user.
- `publicAddress: string | null` -- the authenticated user's public address (EOA public key).
- `email: string | null` -- email address of the authenticated user.
- `phoneNumber: string | null` -- phone number of the authenticated user.
- `isMfaEnabled: boolean` -- whether or not multi-factor authentication is enabled for the user.
- `recoveryFactors: RecoveryFactor[]` -- any recovery methods that have been enabled (ex. `[{ type: 'phone_number', value: '+99999999' }]`).

## Parameters

### `authParams: <MagicAuthParams>`

An object with the following fields:

- `authenticate: () => Promise<void>` -- a method you can define as necessary to leverage the `Magic` SDK for authentication. For instance, in the example above, `authenticate` uses the [`connectWithUI`](https://magic.link/docs/api/client-side-sdks/web#connectwithui) method.
