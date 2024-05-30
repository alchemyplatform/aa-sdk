---
title: ParticleSigner • authenticate
description: Overview of the authenticate method on ParticleSigner
---

# authenticate

`authenticate` is a method on the `ParticleSigner` which leverages the `Particle` SDK to initiate login and authenticate a user.

You must call this method before accessing the other methods available on the `ParticleSigner`, such as signing messages or typed data or accessing user details. Although, once a user has logged in through `authenticate`, this state will remain constant and `authenticate` will no longer need to be called for access to the other methods; unless the account state is disrupted, upon which `authenticate` will be required once again.

## Usage

```ts [example.ts]
// [!code focus:99]
import { ParticleSigner } from "@alchemy/aa-signers/particle";

const particleSigner = new ParticleSigner({
  projectId: process.env.REACT_APP_PROJECT_ID as string,
  clientKey: process.env.REACT_APP_CLIENT_KEY as string,
  appId: process.env.REACT_APP_APP_ID as string,
  chainName: "polygon",
  chainId: 80001,
});

await particleSigner.authenticate();
```

## Returns

### `Promise<ParticleUserInfo>`

A `Promise` containing the `ParticleUserInfo`, an object derived from Particle's [`UserInfo`](https://github.com/Particle-Network/particle-react-native/blob/main/particle-auth/src/Models/LoginInfo.ts#L83) interface.

## Parameters

### `authParams: <ParticleAuthenticationParams>`

An object with the following fields:

- `loginOptions: LoginOptions` -- an object

  - `preferredAuthType?: AuthType`-- [optional] Primary authentication type, from `email`, to `phone`, to social platforms, to `jwt`.

  - `account?: string`-- [optional] Account ID to authenticate on Particle.

  - `supportAuthTypes: string` -- [optional] Designates supported authentication types.

  - `socialLoginPrompt?: PromptType` -- [optional] One of the following types prompts if Login is social-based: `none` | `consent` | `select_account`.

  - `hideLoading: boolean` -- [optional] Flag to hide loading when authenticating.

  - `authorization: Object` -- [optional] Object with below properties. This throws a signature upon login to be used for authorization.

    - `message: string` -- [optional] Message to include with authorization.

    - `uniq: boolean`-- [optional] Flag to determine if authorization is unique.

- `login: (loginOptions: LoginOptions) => Promise<void>` -- a method that `authenticate` uses to initiate login for a user. For instance, in the example above, `authenticate` uses Particle's auth object to [login](https://docs.particle.network/developers/auth-service/sdks/web#login).
