---
outline: deep
head:
  - - meta
    - property: og:title
      content: MultiOwnerModularAccountClient • MultiOwnerPluginActions
  - - meta
    - name: description
      content: Overview of the MultiOwnerPluginActions on MultiOwnerModularAccountClient
  - - meta
    - property: og:description
      content: Overview of the MultiOwnerPluginActions on MultiOwnerModularAccountClient
next:
  text: Utils
---

# MultiOwnerPluginActions

`SmartAccountClient` actions used to interact with the [`MultiOwnerPlugin`](https://github.com/alchemyplatform/modular-account/blob/v1.0.x/src/plugins/owner/MultiOwnerPlugin.sol) contract for the connected `MultiOwnerModularAccount`. Used by extending the `MultiOwnerModularAccount` connected `SmartAccountClient` with the `multiOwnerPluginActions` decorator.

`MultiOwnerPlugin` allows more than one EOA or smart contract to own a modular account. All owners have equal root access to the account.
The plugin also supports [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) signature validation for both validating the signature on user operations and in exposing its own `isValidSignature` method. This only works when the owner of modular account also support ERC-1271. `MultiOwnerModularAccount` does support ERC-1271.

:::tip Note
The owner of a modular account may **not** be another modular account. This is because the owner for `MultiOwnerPlugin` cannot be an [ERC-1967](https://eips.ethereum.org/EIPS/eip-1967) proxy as it accesses a constant implementation slot not associated with the account, violating storage access rules.
:::

```typescript
export type MultiOwnerPluginActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  /* Execution actions */

  updateOwners: ({ args: [ Address[], Address[] ], /* [ ownersToAdd, ownersToRemove ] */ } &
    { overrides?: UserOperationOverrides } & /* optional user operation overrides */
    { account?: TAccount } /* optional target smart contract account override */
  }) => Promise<SendUserOperationResult>;

  /* Management actions */

  installMultiOwnerPlugin: ({
    args:[ Address[] ], /* initial owners */
    pluginAddress?: Address; /* optional plugin address overrides */
    dependencyOverrides?: FunctionReference[]; /* optional dependency overrides */
  } & { overrides?: UserOperationOverrides } & { account?: TAccount }) => Promise<SendUserOperationResult>;

  /* Read actions */

  readOwners: (
    params: { pluginAddress?: Address } & { account?: TAccount }
  ) => Promise<ReadonlyArray<Address>>;

  isOwnerOf: (
    params: {
      address: Address;
      pluginAddress?: Address;
    } & GetAccountParameter<TAccount>
  ) => Promise<boolean>;

  ...
};
```

# getInstalledPlugins

`getInstalledPlugins` is an action exported by `AccountLoupeActions` which reads and returns the installed plugin contract addresses for the connected `MultiOwnerModularAccount`.

## Usage

::: code-group

```ts [example.ts]
import { multiOwnerPluginActions } from "@alchemy/aa-accounts";
import { type Address } from "viem";

import { smartAccountClient } from "./modularAccountClient";

// extend smart account client with multiOwnerPluginActions to call MultiOwnerPlugin methods
const extendedClient = smartAccountClient.extend(multiOwnerPluginActions);

// returns addresses of all installed plugins
const installedPlugins = await extendedClient.getInstalledPlugins({});

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
