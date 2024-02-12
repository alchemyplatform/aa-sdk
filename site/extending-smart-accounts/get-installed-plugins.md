---
outline: deep
head:
  - - meta
    - property: og:title2
      content: Extending Smart Accounts • Get Installed Plugins of a Modular Account
  - - meta
    - name: description
      content: Follow this guide to get installed plugins of a Modular Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - property: og:description
      content: Follow this guide to get installed plugins of a Modular Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - name: twitter:title
      content: How to Manage Ownership of a Modular Account
  - - meta
    - name: twitter:description
      content: Follow this guide to get installed plugins of a Modular Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
next:
  text: Alchemy Enhanced Apis
---

# How to get the installed plugins of a Modular Account

[ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) Modular Accounts implements Plugin inspection interface [`IAccountLoupe.sol`](https://eips.ethereum.org/EIPS/eip-6900#iaccountloupesol) to support visibility in plugin configuration on-chain. This contract interface defines the method `getInstalledPlugins()` that clients can use to fetch the currently installed plugins on a Modular Account.

```solidity
/// @notice Get an array of all installed plugins.
/// @return The addresses of all installed plugins.
function getInstalledPlugins() external view returns (address[] memory);
```

Account Kit provides a streamlined experience of interacting with Modular Account AccoutLoupe interface easily by providing `accountLoupeActions` defined in `@alchemy/aa-accounts` package. When you connect your Modular Account to `SmartAccountClient` you can extend the client with `accountLoupeActions`, which exposes a set of methods available to call the account `AccountLoupe` with the client connected to the account.

### Get installed plugins of a Modular Account

You should first extends the `SmartAcountClient` connected to a Modular Account, which has `AccountLoupe` implemented, with client to `accountLoupeActions` for the client to include the `AccountLoupe` actions.

Then, you can use the `getInstalledPlugins` method of the `accountLoupeActions` extended smart account client to get the list of installed plugin addresses for the connected Modular Account.

::: code-group

```ts [example.ts]
import { smartAccountClient as modularAccountClient } from "./smartAccountClient";
import { accountLoupeActions } from "@alchemy/aa-accounts";

// [!code focus:99]
// extend smart account client with accountLoupeActions to call AccountLoupe methods
const accountLoupeActionsExtendedClient =
  modularAccountClient.extend(accountLoupeActions);

// returns addresses of all installed plugins
const installedPlugins =
  await accountLoupeActionsExtendedClient.getInstalledPlugins();
```

<<< @/snippets/aa-alchemy/connected-client.ts [smartAccountClient.ts]

:::

By checking if a certain plugin address exists in the list of installed plugin addresses of a Modular Account, you can check whether a particular plugin is installed or not on a Modular Account.
