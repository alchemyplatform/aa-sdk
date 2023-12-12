---
outline: deep
head:
  - - meta
    - property: og:title
      content: LitSigner • signMessage
  - - meta
    - name: description
      content: Overview of the signMessage method on LitSigner
  - - meta
    - property: og:description
      content: Overview of the signMessage method on LitSigner
---

# signMessage

`signMessage` supports signing messages from the `MagicSigner`.

This method must be called after [`authenticate`](/packages/aa-signers/lit-protocol/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { LitSigner, type LitAuthMethod } from "@alchemy/aa-signers";
// [!code focus:99]

const API_KEY = "<YOUR API KEY>";
const POLYGON_MUMBAI_RPC_URL = `${polygonMumbai.rpcUrls.alchemy.http[0]}/${API_KEY}`;
const PKP_PUBLIC_KEY = "<your pkp public key>";

const AUTH_METHOD = "<your auth method>";

const litSigner = new LitSigner<LitAuthMethod>({
  pkpPublicKey: PKP_PUBLIC_KEY,
  rpcUrl: RPC_URL,
});

const signedMessage = await litSigner.signMessage("Hello World!");
```

:::

## Returns

### `Promise<Hex>`

A Promise containing the signature of the message.

## Parameters

### `msg: string | Uint8Array)` -- the message to sign
