---
outline: deep
head:
  - - meta
    - property: og:title
      content: MultiOwnerModularAccountClient • AccountLoupeActions
  - - meta
    - name: description
      content: Overview of the AccountLoupeActions on MultiOwnerModularAccountClient
  - - meta
    - property: og:description
      content: Overview of the AccountLoupeActions on MultiOwnerModularAccountClient
next:
  text: Utils
---

# AccountLoupeActions

`SmartAccountClient` actions used to interact with the [`AccountLoupe`](https://eips.ethereum.org/EIPS/eip-6900#iaccountloupesol) contract interface for the connected account. Used by extending the `MultiOwnerModularAccount` connected `SmartAccountClient` with the `accountLoupeActions` decorator.

Among methods available on `AccountLoupeActions`, this doc will only cover one of them, `getInstalledPlugins()`, which clients would use to read the installed plugin addresses for the connected `MultiOwnerModularAccount`. Other methods relate to the plugin contract `Hooks`, which you can learn more about from the [EIP-6900](https://eips.ethereum.org/EIPS/eip-6900#terms) specificiation.

::: details AccountLoupeActions
<<< @/../packages/accounts/src/light-account/account.ts
:::

# getInstalledPlugins

`getInstalledPlugins` is an action exported by `AccountLoupeActions` which reads and returns the installed plugin contract addresses for the connected `MultiOwnerModularAccount`.

## Usage

::: code-group

```ts [example.ts]
import { IPluginAbi, accountLoupeActions } from "@alchemy/aa-accounts";
import { type Address } from "viem";

import { smartAccountClient } from "./modularAccountClient";

// extend smart account client with accountLoupeActions to call AccountLoupe methods
const accountLoupeActionsExtendedClient =
  smartAccountClient.extend(accountLoupeActions);

// returns addresses of all installed plugins
const installedPlugins =
  await accountLoupeActionsExtendedClient.getInstalledPlugins({});

if (installedPlugins.length === 0) {
  console.log("account has no plugins installed.");
} else {
  const pluginAddress: Address = installedPlugins[0] as Address;
  // read plugin metadata of a plugin
  const metadata = await accountLoupeActionsExtendedClient.readContract({
    address: pluginAddress,
    abi: IPluginAbi,
    functionName: "pluginMetadata",
  });

  console.log(JSON.stringify(metadata, null, 2));
  // {
  //   name: 'MultiOwnerPlugin',
  //   version: '1.0.0',
  // }
}
```

<<< @/snippets/aa-accounts/modularAccountClient.ts
:::

## Returns

### `Promise<ReadonlyArray<Address>>`

A Promise containing the installed plugin contract addresses for the connected `MultiOwnerModularAccount`.

## Parameters

- `account?: MultiOwnerModularAccount` -- optionally, pass the account if your client is not connected to it
