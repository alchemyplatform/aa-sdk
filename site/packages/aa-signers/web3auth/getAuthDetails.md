---
outline: deep
head:
  - - meta
    - property: og:title
      content: Web3AuthSigner • getAuthDetails
  - - meta
    - name: description
      content: Overview of the getAuthDetails method on Web3AuthSigner
  - - meta
    - property: og:description
      content: Overview of the getAuthDetails method on Web3AuthSigner
---

# getAuthDetails

`getAuthDetails` returns the details about the authenticated user, in accordance with the `Web3AuthSigner` web SDK's [specifications](https://web3auth.io/docs/sdk/pnp/web/modal/usage#getuserinfo).

This method must be called after [`authenticate`](/packages/aa-signers/web3auth/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

::: code-group

```ts [example.ts]
import { createWeb3AuthSigner } from "./web3auth";
// [!code focus:99]
const web3AuthSigner = await createWeb3AuthSigner();

const details = await web3AuthSigner.getAuthDetails();
```

<<< @/snippets/web3auth.ts
:::

## Returns

### `Promise<Web3AuthUserInfo>`

A Promise containing the `Web3AuthUserInfo`, an object with the following fields:

- `verifier: string` -- details of the verifier (verifier type, ie. torus, metamask, openlogin etc.).
- `verifierId: string` -- id of the verifier.
- `typeOfLogin: LOGIN_PROVIDER_TYPE` -- the type of login done by the user (like google, facebook, twitter, github, etc.).
- `email: string` -- [optional] the decentralized ID of the user.
- `name: string` -- [optional] the name of the authenticated user.
- `profileImage: string` -- [optional] the profile image of the connected user
- `aggregateVerifier: string` -- [optional] the details of the aggregate verifier.
- `dappShare: string` -- [optional] if you are using a Custom Verifier, you can get a dapp share after successful login to replace device share.
- `idToken: string` -- [optional] the id of the token issued by Web3Auth.
- `oAuthIdToken: string` -- [optional] the id of the token issued by the OAuth provider.
- `oAuthAccessToken: string` -- [optional] the access token issued by the OAuth provider.
- `isMfaEnabled: boolean` -- [optional] whether or not multi-factor authentication is enabled for the user.
- `touchIDPreference: string` -- [optional]
- `isMfaEnabled: boolean` -- [optional] whether or not multi-factor authentication is enabled for the user.
