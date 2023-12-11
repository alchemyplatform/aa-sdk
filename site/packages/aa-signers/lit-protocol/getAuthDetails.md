---
outline: deep
head:
  - - meta
    - property: og:title
      content: LitSigner • getAuthDetails
  - - meta
    - name: description
      content: Overview of the getAuthDetails method on LitSigner
  - - meta
    - property: og:description
      content: Overview of the getAuthDetails method on LitSigner
---

# getAuthDetails

`getAuthDetails` returns the details about the authenticated user as `LitUserMetadata`, which is a `SessionSigsMap`: the authentication result when successful.

This method must be called after [`authenticate`](/packages/aa-signers/lit-protocol/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
// [!code focus:99]
import { LitSigner, type LitAuthMethod } from "@alchemy/aa-signers";

const AUTH_METHOD = "<your auth method>";

const API_KEY = "<YOUR API KEY>";
const POLYGON_MUMBAI_RPC_URL = `${polygonMumbai.rpcUrls.alchemy.http[0]}/${API_KEY}`;
const PKP_PUBLIC_KEY = "<your pkp public key>";

const litSigner = new LitSigner<LitAuthMethod>({
  pkpPublicKey: PKP_PUBLIC_KEY,
  rpcUrl: RPC_URL,
});

await litSigner.authenticate({
  context: AUTH_METHOD,
});

// returns a `SessionSigMap` regardless of using an auth sig or session signature
let authDetails = await litSigner.getAuthDetails();
```

:::

## Returns

### `Promise<LitUserMetadata>`

A Promise containing the `LitUserMetadata`, a map of `string -> object` containing the following fields:

- `sig: string` -- Signed authentication message of the given network node.
- `deriviedVia: string` -- How the signature was generated.
- `address: string` -- Ethereum address of the key.
- `algo: string` -- Signing algorithim used.
- `signedMessage: string` -- `SIWE ReCap` Authentication message in the format of `SIWE ReCap`.
