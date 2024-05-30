---
title: Alchemy Signer • addPasskey
description: Learn how to use the AlchemySigner.addPasskey method
---

# addPasskey

The `addPasskey` method is used to add a passkey as an auth method to an already logged in user.

:::warning
This method throws if there is no authenticated user.
:::

## Usage

:::code-group

```ts [example.ts]
import { signer } from "./signer";

await signer.addPasskey();
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

## Returns

`Promise<string[]>` -- on success returns an array of credential ids

## Parameters

`params?: CredentialCreationOptions` -- overrides for the WebAuthn credential creation options. For more info on the `CredentialCreationOptions` interface, see [here](https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.credentialcreationoptions).
