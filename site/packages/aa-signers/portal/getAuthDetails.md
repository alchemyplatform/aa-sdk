---
outline: deep
head:
  - - meta
    - property: og:title
      content: PortalSigner • getAuthDetails
  - - meta
    - name: description
      content: Overview of the getAuthDetails method on PortalSigner
  - - meta
    - property: og:description
      content: Overview of the getAuthDetails method on PortalSigner
---

# getAuthDetails

`getAuthDetails` returns the details about the authenticated user, specifically all EOA addresses tied to the user's Portal vault.

This method must be called after [`authenticate`](/packages/aa-signers/portal/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createPortalSigner } from "./portal";
// [!code focus:99]
const portalSigner = await createPortalSigner();

const details = await portalSigner.getAuthDetails();
```

<<< @/snippets/portal.ts
:::

## Returns

### `Promise<PortalUserInfo>`

A Promise containing the `PortalUserInfo`, an object with the following fields:

- `id: string` -- ID of the Portal Signer.
- `address: string` -- EOA address of the Portal Signer.
- `backupStatus: string | null` -- [optional] status of wallet backup.
- `custodian: Obect` -- [optional] EOA address of the Portal Signer.
  - `id: string` -- ID of the Signer's custodian.
  - `name: string` -- Name of the Signer's custodian.
- `signingStatus: string | null` -- [optional] status of signing.

This derives from the return type of a Portal provider's `getClient()` method.
