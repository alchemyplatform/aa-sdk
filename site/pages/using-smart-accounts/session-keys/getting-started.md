---
title: Getting started with Session Keys
description: Learn how to use Alchemy's Session Key Plugin.
---

# Getting started with Session Keys

`@alchemy/aa-accounts` exports all of the definitions you need to use session keys with a Modular Account. We provide a simple `SessionKeySigner` class that generates session keys on the client and can be used as the `signer` for the Multi Owner Modular Account.
We also export the necessary decorators which can be used to extend your `SmartAccountClient` to make interacting with session keys easy.

## Usage

Let's take a look at a full example that demonstrates how to use session keys with a Modular Account.

```ts [full-example.ts]
// [!include ~/snippets/session-keys/full-example.ts]
```

## Breaking it down

### Determine where the session key is stored

Session keys can be held on the client side or on a backend agent. Client side session keys are useful for skipping confirmations, and agent side keys are useful for automations.

In the above example, we use a client-side key using the `SessionKeySigner` exported from `@alchemy/aa-accounts`.

```ts
import { SessionKeySigner } from "@alchemy/aa-accounts";

const sessionKeySigner = new SessionKeySigner();
```

If you are using backend agent controlled session keys, then the agent should generate the private key and send only the address to the client. This protects the private key by not exposing it to the user.

### Extend your client with Modular Account Decorators

The base `SmartAccountClient` and `AlchemySmartAccountClient`, only include base functionality for sending user operations. If you are using a `ModularAccount`, then you will want to extend your client with the various decorators exported by `@alchemy/aa-accounts`.

:::code-group

```ts
import { smartAccountClient } from "./smartAccountClient";
import {
  accountLoupeActions,
  multiOwnerPluginActions,
  sessionKeyPluginActions,
  pluginManagerActions,
} from "@alchemy/aa-accounts";

const extendedClient = smartAccountClient
  .extend()
  // These are the base decorators for using Modular Accounts with your client
  .extend(pluginManagerActions)
  .extend(accountLoupeActions)
  // These two decorators give you additional utilities for interacting with the
  // MultiOwnerPlugin (default ownership plugin)
  // and SessionKeyPlugin
  .extend(multiOwnerPluginActions)
  .extend(sessionKeyPluginActions);
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/base-client.ts]
```

:::

### Check if the Session Key Plugin is installed

Before you can start using session keys, you need to check whether the user’s account has the session key plugin installed. You can perform this check using the account loupe decorator, which lets you inspect the state of installed plugins on a Modular Account.

```ts
// 1. check if the plugin is installed
const extendedClient = await client
  .getInstalledPlugins({})
  // This checks using the default address for the chain, but you can always pass in your own plugin address here as an override
  .then((x) => x.includes(SessionKeyPlugin.meta.addresses[chain.id]));
```

### Install the Session Key Plugin

If the Session Key Plugin is not yet installed, you need to install it before it can be used. To simplify the workflow, it is also possible to batch the plugin installation along with creating session keys and performing other actions, which combines all of these steps into one user operation.

```ts
// 2. if the plugin is not installed, then install it and set up the session key
if (!isPluginInstalled) {
  // lets create an initial permission set for the session key giving it an eth spend limit
  // if we don't set anything here, then the key will have 0 permissions
  const initialPermissions =
    new SessionKeyPermissionsBuilder().setNativeTokenSpendLimit({
      spendLimit: 1000000n,
    });

  const { hash } = await extendedClient.installSessionKeyPlugin({
    // 1st arg is the initial set of session keys
    // 2nd arg is the tags for the session keys
    // 3rd arg is the initial set of permissions
    args: [
      [await sessionKeySigner.getAddress()],
      [zeroHash],
      [initialPermissions.encode()],
    ],
  });

  await extendedClient.waitForUserOperationTransaction({ hash });
}
```

### Construct the initial set of permissions

Session keys are powerful because of permissions that limit what actions they can take. When you add a session key, you should also specify the initial permissions that apply over the key.

See the [Supported Permissions](./supported-permissions#using-the-permissionsbuilder) page for more information on how to used the permissions builder.

Let's use the permission builder to build a set of permissions that sets a spend limit:

```ts
const initialPermissions =
  new SessionKeyPermissionsBuilder().setNativeTokenSpendLimit({
    spendLimit: 1000000n,
  });

const result = await extendedClient.updateKeyPermissions({
  args: [sessionKeyAddress, initialPermissions.encode()],
});
```

## Managing Session Keys

The Session Key Plugin allows you to:

- Add session keys, and set the key's initial permissions.
- Remove session keys.
- Update key permissions.
- Rotate session keys. This action replaces the previous session key with a new session key, while keeping the existing permissions.

### Add a Session Key

Session keys can be added either during installation, or using the `addSessionKey` function.

```ts [add-session-key.ts]
// [!include ~/snippets/session-keys/add-session-key.ts]
```

### Remove a Session Key

Session keys can be removed using the `removeSessionKey` function.

```ts [remove-session-key.ts]
// [!include ~/snippets/session-keys/remove-session-key.ts]
```

### Update a Key's permissions

Session key permissions can be edited after creation using the `updateKeyPermissions` function. Note that you should configure initial permissions when the key is added, and not rely on a second user operation to set the permissions.

```ts [update-session-key.ts]
// [!include ~/snippets/session-keys/update-session-key.ts]
```

### Rotate a Session Key

If the key is no longer available, but there exists a tag identifying a previous session key configured for your application, you may instead choose to rotate the previous key’s permissions. This can be performed using `rotateKey` .

```ts [rotate-session-key.ts]
// [!include ~/snippets/session-keys/rotate-session-key.ts]
```
