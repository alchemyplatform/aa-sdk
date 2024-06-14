---
title: Web3AuthSigner • signMessage
description: Overview of the signMessage method on Web3AuthSigner
---

# signMessage

`signMessage` supports signing messages from the `Web3AuthSigner`.

This method must be called after [`authenticate`](/packages/aa-signers/web3auth/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createWeb3AuthSigner } from "./web3auth";
// [!code focus:99]
const web3AuthSigner = await createWeb3AuthSigner();

const signedMessage = await web3AuthSigner.signMessage("test");
```

```ts [web3auth.ts]
// [!include ~/snippets/signers/web3auth.ts]
```

:::

## Returns

### `Promise<Hex>`

A `Promise` containing the signature of the message.

## Parameters

### `msg: string | Uint8Array)` -- the message to sign
