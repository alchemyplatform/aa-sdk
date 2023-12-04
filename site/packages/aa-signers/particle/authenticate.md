---
outline: deep
head:
  - - meta
    - property: og:title
      content: ParticleSigner • authenticate
  - - meta
    - name: description
      content: Overview of the authenticate method on ParticleSigner
  - - meta
    - property: og:description
      content: Overview of the authenticate method on ParticleSigner
---

# authenticate

`authenticate` is a method on the `ParticleSigner` which leverages the `Particle` SDK to authenticate a user.

You must call this method before accessing the other methods available on the `ParticleSigner`, such as signing messages or typed data or accessing user details.

## Usage

::: code-group

```ts [example.ts]
// [!code focus:99]
import { ParticleSigner } from "@alchemy/aa-signers";

const particleSigner = new ParticleSigner({
  projectId: process.env.REACT_APP_PROJECT_ID as string,
  clientKey: process.env.REACT_APP_CLIENT_KEY as string,
  appId: process.env.REACT_APP_APP_ID as string,
  chainName: "polygon",
  chainId: 80001,
});

await particleSigner.authenticate();
```

:::

## Returns

### `Promise<ParticleUserInfo>`

A Promise containing the `ParticleUserInfo`, an object derived from Particle's [`UserInfo`](https://github.com/Particle-Network/particle-react-native/blob/main/particle-auth/src/Models/LoginInfo.ts#L83) interface.

## Parameters

### `authParams: <ParticleAuthenticationParams>`

An object with the following fields:

- `loginOptions: LoginOptions` -- an object

  - `preferredAuthType?: AuthType`-- [optional] Primary authentication type, from `email`, to `phone`, to social platforms, to `jwt`.

  - `account?: string`-- [optional] Account ID to authenticate on Particle.

  - `supportAuthTypes: string` -- [optional] Designates supported authentication types.

  - `socialLoginPrompt?: PromptType` -- [optional] One of the following types prompts if Login is social-based: `none` | `consent` | `select_account`.

  - `hideLoading: boolean` -- [optional] Flag to hide loading when authenticating.

  - `authorization: Object` -- [optional] Object with below properties

    - `message: string` -- [optional] Message to include with authorization.

    - `uniq: boolean`-- [optional] Flag to determine if authorization is unique.

- `login: (loginOptions: LoginOptions) => Promise<void>` -- a method you can define as necessary to leverage the `web3auth` SDK for authentication. For instance, in the example above, `authenticate` uses the [`initModal`](https://web3auth.io/docs/sdk/pnp/web/modal/initialize#initmodal) method.
