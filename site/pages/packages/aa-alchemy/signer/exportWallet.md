---
title: Alchemy Signer • exportWallet
description: Learn how to use the AlchemySigner.exportWallet method
---

# exportWallet

The `exportWallet` method is used to export the user's private key or seed phrase.

If the user is authenticated with an Email, this will return a seed phrase
If the user is authenticated with a Passkey, this will return a private key

:::warning
This method throws if there is no authenticated user.
:::

## Usage

:::code-group

```ts [example.ts]
import { signer } from "./signer";

await signer.exportWallet({
  iframeContainerId: "my-export-wallet-container",
});
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

## Returns

`Promise<boolean>` -- returns a boolean indicating the success of the export

## Parameters

`params: ExportWalletParams`

- `iframeContainerId: string` -- the id of the container to render the export wallet iframe in
- `iframeElementId?: string` -- the id given to the iframe element that will be injected into the DOM
