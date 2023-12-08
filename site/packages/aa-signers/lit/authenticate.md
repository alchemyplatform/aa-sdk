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
In this example we will be using the `Lit Auth Client` to get a `Auth Method` for use in the `LitSigner` instance as authentication material. The implementations allows for either a `SessionSig` or `AuthMethod` to be used. If using an `AuthMethod` then the implementation will handle signing a session signature which will be used at the `AuthDetials`. If a `SessionSig` is given then the implementation will use that as authetnication material for the signer.

### Auth Method
::: code-group
```ts [example.ts]
import { LitSigner, type AuthMethod, type SessionSigsMap } from '@alchemy/aa-signers';

const PKP_PUBLIC_KEY = "<your pkp public key>";
const AUTH_METHOD = "<your auth method>";
const RPC_URL = "<your rpc url>";

// for info on obtaining an auth method and minting pkp's
// see here: 
const litSigner = new LitSigner<AuthMethod>({
    pkpPublicKey: PKP_PUBLIC_KEY,
    rpcUrl: RPC_URL    
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
import { LitSigner, AuthMethod } from '@alchemy/aa-signers';

const PKP_PUBLIC_KEY = "<your pkp public key>";
const SESSION_SIGS = "<your sessionSig>";
const RPC_URL = "<your rpc url>";

// for info on obtaining an auth method and minting pkp's
// see here: 
const litSigner = new LitSigner<SessionSigsMap>({
    pkpPublicKey: PKP_PUBLIC_KEY,
    rpcUrl: RPC_URL    
});

await litSigner.authenticate({
    context: SESSION_SIGS,
});

let authDetails = await litSigner.getAuthDetails(); // returns a `SessionSigMap` regardless of using an auth sig or session signature

```
:::