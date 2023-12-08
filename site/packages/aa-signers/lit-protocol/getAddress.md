---
outline: deep
head:
  - - meta
    - property: og:title
      content: LitSigner • getAddress
  - - meta
    - name: description
      content: Overview of the getAddress method on LitSigner
  - - meta
    - property: og:description
      content: Overview of the getAddress method on LitSigner
---

# getAddress

`getAddress` returns the EOA address of the Signer.

This method must be called after [`authenticate`](/packages/aa-signers/lit/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

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

const address = await litSigner.getAddress();
```

:::

## Returns

### `Promise<Address>`

A Promise containing the address of the Signer.
