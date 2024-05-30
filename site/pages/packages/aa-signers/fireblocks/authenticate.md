---
title: FireblocksSigner • authenticate
description: Overview of the authenticate method on FireblocksSigner
---

# authenticate

`authenticate` is a method on the `FireblocksSigner` which leverages the `Fireblocks` SDK to authenticate a user.

You must call this method before accessing the other methods available on the `FireblocksSigner`, such as signing messages or typed data or accessing user details.

## Usage

```ts [example.ts]
// [!code focus:99]
import { FireblocksSigner } from "@alchemy/aa-signers/fireblocks";
import { ChainId } from "@fireblocks/fireblocks-web3-provider";

const fireblocksSigner = new FireblocksSigner({
  privateKey: process.env.FIREBLOCKS_API_PRIVATE_KEY_PATH,
  apiKey: process.env.FIREBLOCKS_API_KEY,
  chainId: ChainId.SEPOLIA,
});

await fireblocksSigner.authenticate();
```

## Returns

### `Promise<FireblocksUserInfo>`

A `Promise` containing the `FireblocksUserInfo`, an object with the following fields:

- `addresses: Address[]` -- all EOA addresses accessible via the Signer.
