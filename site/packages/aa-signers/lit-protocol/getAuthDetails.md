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
import { createLitSignerWithAuthMethod } from "./lit";
// [!code focus:99]

const litSigner = new createLitSignerWithAuthMethod();

await litSigner.authenticate({
  context: AUTH_METHOD,
});

// returns a `SessionSigMap` regardless of using an auth sig or session signature
let authDetails = await litSigner.getAuthDetails();
```

<<< @/snippets/lit.ts
:::

## Returns

### `Promise<LitUserMetadata>`

A Promise containing the `LitUserMetadata`, a map of `string -> object` containing the following fields:

- `sig: string` -- Signed authentication message of the given network node.
- `deriviedVia: string` -- How the signature was generated.
- `address: string` -- Ethereum address of the key.
- `algo: string` -- Signing algorithim used.
- `signedMessage: string` -- `SIWE ReCap` Authentication message in the format of `SIWE ReCap`.
