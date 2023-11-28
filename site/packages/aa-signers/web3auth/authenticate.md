---
outline: deep
head:
  - - meta
    - property: og:title
      content: Web3AuthSigner • authenticate
  - - meta
    - name: description
      content: Overview of the authenticate method on Web3AuthSigner
  - - meta
    - property: og:description
      content: Overview of the authenticate method on Web3AuthSigner
---

# authenticate

`authenticate` is a method on the `Web3AuthSigner` which leverages the `web3auth` web modal SDK to authenticate a user.

You must call this method before accessing the other methods available on the `Web3AuthSigner`, such as signing messages or typed data or accessing user details.

## Usage

::: code-group

```ts [example.ts]
// [!code focus:99]
import { Web3AuthSigner } from "@alchemy/aa-signers";

const web3AuthSigner = new Web3AuthSigner({
  clientId: "test",
  chainConfig: {
    chainNamespace: "eip155",
  },
});

await web3AuthSigner.authenticate({
  init: async () => {
    await web3AuthSigner.inner.initModal();
  },
  connect: async () => {
    await web3AuthSigner.inner.connect();
  },
});
```

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

## Parameters

### `authParams: <Web3AuthAuthenticationParams>`

An object with the following fields:

- `init: () => Promise<void>` -- a method you can define as necessary to leverage the `web3auth` SDK for authentication. For instance, in the example above, `authenticate` uses the [`initModal`](https://web3auth.io/docs/sdk/pnp/web/modal/initialize#initmodal) method.
- `connect: () => Promise<void>` -- a method you can define as necessary to leverage the `web3auth` SDK for authentication. For instance, in the example above, `authenticate` uses the [`connect`](https://web3auth.io/docs/sdk/pnp/web/modal/usage) method.
