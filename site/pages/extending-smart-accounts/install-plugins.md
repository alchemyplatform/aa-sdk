---
title: Extending Smart Accounts • Installing & uninstalling plugins on a Modular
  Account
description: Follow this guide to install and uninstall plugins on a Modular
  Account with Account Kit, a vertically integrated stack for building apps that
  support ERC-4337 and ERC-6900.
---

# How to install and uninstall plugins on a Modular Account

[ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) Modular Accounts implements Plugin manager interface [`IPluginManager.sol`](https://eips.ethereum.org/EIPS/eip-6900#ipluginmanagersol) to support installing and uninstalling plugins on a Modular Account. This contract interface defines the method `installPlugin()` and `uninstallPlugin()` that clients can use to install or uninstall plugins on a Modular Account.

Account Kit provides a streamlined experience of interacting with the Modular Account AccoutLoupe interface easily by providing `pluginManagerActions` defined in `@alchemy/aa-accounts` package. When you connect your Modular Account to `SmartAccountClient` you can extend the client with `pluginManagerActions`, which exposes a set of methods available to call the account `AccountLoupe` with the client connected to the account.

There are two ways to install plugins. The first method is to use the `pluginManagerActions`'s generic `installPlugin` method, but this method requires the [`PluginGenConfig`](https://github.com/alchemyplatform/aa-sdk/blob/a9a11ec23b1084fa43edaa3cb933ff36318ca573/packages/accounts/plugindefs/types.ts) configure the correct plugin dependencies and function references for the plugin.

Account Kit provides a more robust, easier way to install plugins with `pluginActions`. Each plugin comes with the its own `pluginActions` that includes already configured install method, named `install<PluginName>`, for installing any plugin of interest. For example, `MultiOwnerPlugin` has `multiOwnerPluginActions` that includes `installMultiOwnerPlugin()` method, and `SessionKeyPlugin` has `sessionKeyPluginActions` that includes `installSessionKeyPlugin()` method, all exported from the `@alchemy/aa-accounts` package.

This guide will use the `SessionKeyPlugin` as an example to show how you can install `SessionKeyPlugin` easily using the `SmartAccountClient` extended with `sessionKeyPluginActions`.

### 1. Installing the Session Key Plugin

You should first extend the `SmartAccountClient` connected to a Modular Account with `sessionKeyPluginActions`.

Then, you can use the `installSessionKeyPlugin()` method exposed on `sessionKeyPluginActions` extended smart account client to install the session key plugin for the connected account.

:::tip[Note]
When using `createModularAccountAlchemyClient` in `@alchemy/aa-alchemy`, the `SmartAccountClient` comes automatically extended with `multiOwnerPluginActions`, `pluginManagerActions`, and `accountLoupeActions` decorators as defaults available for use.
:::

:::code-group

```ts [example.ts]
import { smartAccountClient as modularAccountClient } from "./smartAccountClient";
import { sessionKeyPluginActions } from "@alchemy/aa-accounts";

// [!code focus:99]
// extend smart account client with sessionKeyPluginActions to call SessionKeyPlugin methods
const sessionKeyExtendedClient = modularAccountClient.extend(
  sessionKeyExtendedClient
);

const { hash } = await sessionKeyExtendedClient.installSessionKeyPlugin({
  // 1st arg is the initial set of session keys
  // 2nd arg is the tags for the session keys
  // 3rd arg is the initial set of permissions
  args: [[], [], []],
});

await client.waitForUserOperationTransaction({ hash });
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/connected-client.ts]
```

:::

Refer to the [Session Key](/using-smart-accounts/session-keys/) section to learn more about using the `SessionKeyPlugin`.

### 2. Uninstalling the Session Key Plugin

On the other hand, uninstalling plugins usually does not involve configuring contract dependencies or function references. You can use the `pluginManagerActions`'s generic `uninstallPlugin` method to uninstall a particular plugin of interest.
First, extend the `SmartAccountClient` connected to a Modular Account with `pluginManagerActions`.

Then, you can use the `uninstallPlugin()` method exposed on `pluginManagerActions` extended smart account client to uninstall the session key plugin for the connected account.

:::code-group

```ts [example.ts]
import {
  chain,
  smartAccountClient as modularAccountClient,
} from "./smartAccountClient";
import { pluginManagerActions, SessionKeyPlugin } from "@alchemy/aa-accounts";

// [!code focus:99]
// extend smart account client with pluginManagerActions to call PluginManager action methods
const pluginManagerExtendedClient =
  modularAccountClient.extend(pluginManagerActions);

const { hash } = await pluginManagerExtendedClient.uninstallPlugin({
  pluginAddress: SessionKeyPlugin.meta.addresses[chain.id],
});

await client.waitForUserOperationTransaction({ hash });
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/connected-client.ts]
```

:::
