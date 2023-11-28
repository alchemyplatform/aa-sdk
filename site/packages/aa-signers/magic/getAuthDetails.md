---
outline: deep
head:
  - - meta
    - property: og:title
      content: MagicSigner • getAuthDetails
  - - meta
    - name: description
      content: Overview of the getAuthDetails method on MagicSigner
  - - meta
    - property: og:description
      content: Overview of the getAuthDetails method on MagicSigner
---

# getAuthDetails

`getAuthDetails` returns the details about the authenticated user, in accordance with the `Magic` web SDK's [specifications](https://magic.link/docs/api/client-side-sdks/web#getinfo).

This method must be called after [`authenticate`](/packages/aa-signers/magic/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createMagicSigner } from "./magic";
// [!code focus:99]
const magicSigner = await createMagicSigner();

const details = await magicSigner.getAuthDetails();
```

<<< @/snippets/magic.ts
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
