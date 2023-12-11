---
outline: deep
head:
  - - meta
    - property: og:title
      content: PortalSigner • authenticate
  - - meta
    - name: description
      content: Overview of the authenticate method on PortalSigner
  - - meta
    - property: og:description
      content: Overview of the authenticate method on PortalSigner
---

# authenticate

`authenticate` is a method on the `PortalSigner` which leverages the `Portal` SDK to authenticate a user.

You must call this method before accessing the other methods available on the `PortalSigner`, such as signing messages or typed data or accessing user details.

## Usage

::: code-group

```ts [example.ts]
// [!code focus:99]
import { PortalSigner } from "@alchemy/aa-signers";

const portalSigner = new PortalSigner({
  autoApprove: true,
  gatewayConfig: `${sepolia.rpcUrls.alchemy.http}/${process.env.ALCHEMY_API_KEY}`,
  chainId: sepolia.id,
});

await portalSigner.authenticate();
```

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
