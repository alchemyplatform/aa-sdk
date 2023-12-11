---
outline: deep
head:
  - - meta
    - property: og:title
      content: LitSigner • authenticate
  - - meta
    - name: description
      content: Overview of the authenticate method on LitSigner
  - - meta
    - property: og:description
      content: Overview of the authenticate method on LitSigner
---

# authenticate

`authenticate` is a method on the `LitSigner` which leverages the `Lit Protocol sdk` to authenticate a user. Before accessing other methods on the class, this method **MUST** be called, such as signing messages or typed data or accessing user details.

## Usage

`LitSigner` allows for either an `AuthMethod` or `SessionSig`  as context to authenticate, based on the LightSigner you create:  `LitAuthMethod` or `LitSessionSigsMap` respectively. 

If using an `AuthMethod`, then the implementation will handle signing a session signature which will be used as authentication material. If using a `SessionSig`, then the implementation will use that as authentication material for the signer.

### Auth Method

::: code-group

```ts [example.ts]
import { LitSigner, type LitAuthMethod } from "@alchemy/aa-signers";

const API_KEY = "<YOUR API KEY>";
const POLYGON_MUMBAI_RPC_URL = `${polygonMumbai.rpcUrls.alchemy.http[0]}/${API_KEY}`;
const PKP_PUBLIC_KEY = "<your pkp public key>";

const AUTH_METHOD = "<your auth method>";

// for info on obtaining an auth method and minting pkp's
// see here:
const litSigner = new LitSigner<LitAuthMethod>({
  pkpPublicKey: PKP_PUBLIC_KEY,
  rpcUrl: RPC_URL,
});

await litSigner.authenticate({
  context: AUTH_METHOD,
});

let authDetails = await litSigner.getAuthDetails(); // returns a `SessionSigMap` regardless of using an auth sig or session signature
```

:::

### Session Signatures

::: code-group

```ts [example.ts]
import { LitSigner, type LitSessionSigsMap } from "@alchemy/aa-signers";

const PKP_PUBLIC_KEY = "<your pkp public key>";
const SESSION_SIGS = "<your sessionSig>";
const RPC_URL = "<your rpc url>";

// for info on obtaining an auth method and minting pkp's
// see here:
const litSigner = new LitSigner<LitSessionSigsMap>({
  pkpPublicKey: PKP_PUBLIC_KEY,
  rpcUrl: RPC_URL,
});

await litSigner.authenticate({
  context: SESSION_SIGS,
});

let authDetails = await litSigner.getAuthDetails(); // returns a `SessionSigMap` regardless of using an auth sig or session signature
```

:::
