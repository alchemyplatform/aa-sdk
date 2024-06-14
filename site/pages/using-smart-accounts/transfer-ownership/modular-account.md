---
title: How to manage ownership of a Modular Account
description: Follow this guide to manage ownership of a Modular Account with
  Account Kit, a vertically integrated stack for building apps that support
  ERC-4337 and ERC-6900.
---

# How to manage ownership of a Modular Account

The Multi Owner plugin lets your smart accounts have one or more ECDSA or SCA owners. This lets your account integrate with multiple signers at once, and supports recovering your account if one signer is lost.

The Multi-Owner Plugin is able to:

- Update (add or remove) owners for an MSCA.
- Check if an address is an owner address of an MSCA.
- Show all owners of an MSCA.
- Validate signed signatures of ERC-4337 enabled user operations as well as regular transactions.

All Modular Accounts have `MultiOwnerPlugin` pre-installed upon creation, exposing following methods for account owners to update (add or remove) and read the current owners of the account:

```solidity
/// @notice Update owners of the account. Owners can update owners.
/// @param ownersToAdd The address array of owners to be added.
/// @param ownersToRemove The address array of owners to be removed.
function updateOwners(address[] memory ownersToAdd, address[] memory ownersToRemove) external;

/// @notice Get the owners of `account`.
/// @param account The account to get the owners of.
/// @return The addresses of the owners of the account.
function ownersOf(address account) external view returns (address[] memory);
```

When you connect your Modular Account to `SmartAccountClient` you can extend the client with `multiOwnerPluginActions`, which exposes a set of methods available to call the installed `MultiOwnerPlugin` with the client connected to the account.

### 1. Check if an address is one of the current owners of a Modular Account

You should first extend the `SmartAccountClient` connected to a Modular Account, which already comes with `MultiOwnerPlugin` installed upon creation, with client to `multiOwnerPluginActions` for the client to include the `MultiOwnerPlugin` actions.

:::tip[Note]
When using `createModularAccountAlchemyClient` in `@alchemy/aa-alchemy`, the `SmartAccountClient` comes automatically extended with `multiOwnerPluginActions`, `pluginManagerActions`, and `accountLoupeActions` decorators as defaults available for use.
:::

Then, you can use the `readOwners` method of the `multiOwnerPluginActions` extended smart account client to check if a given address is one of the current owners of a Modular Account.

:::code-group

```ts [example.ts]
import { smartAccountClient as modularAccountClient } from "./smartAccountClient";
import { multiOwnerPluginActions } from "@alchemy/aa-accounts";

// [!code focus:99]
// extend smart account client with multiOwnerPluginActions to call MultiOwnerPlugin methods
const pluginActionExtendedClient = modularAccountClient.extend(
  multiOwnerPluginActions
);

const ownerToCheck = "0x..."; // the address of the account to check the ownership of

// returns a boolean whether an address is an owner of account or not
const isOwner = await pluginActionExtendedClient.isOwnerOf({
  address: ownerToCheck,
});
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/connected-client.ts]
```

:::

### 2. Get all current owners of a Modular Account

You can use the `readOwners` method on the `multiOwnerPluginActions` extended smart account client to fetch all current owners of the connected Modular Account.

:::code-group

```ts [example.ts]
import { smartAccountClient as modularAccountClient } from "./smartAccountClient";
import { multiOwnerPluginActions } from "@alchemy/aa-accounts";

// [!code focus:99]
// extend smart account client with multiOwnerPluginActions to call MultiOwnerPlugin methods
const pluginActionExtendedClient = modularAccountClient.extend(
  multiOwnerPluginActions
);

// owners is an array of the addresses of the account owners
const owners = await pluginActionExtendedClient.readOwners();
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/connected-client.ts]
```

:::

### 3. Add or remove owners for a Modular Account

You can use the `updateOwners` method on the `multiOwnerPluginActions` extended smart account client to add or remove owners from the Modular Account.

:::code-group

```ts [example.ts]
import { smartAccountClient as modularAccountClient } from "./smartAccountClient";
import { multiOwnerPluginActions } from "@alchemy/aa-accounts";
import { type Address } from "viem";

// [!code focus:99]
// extend smart account client with multiOwnerPluginActions to call MultiOwnerPlugin methods
const pluginActionExtendedClient = modularAccountClient.extend(
  multiOwnerPluginActions
);

const ownersToAdd: Address[] = []; // the addresses of owners to be added
const ownersToRemove: Address[] = []; // the addresses of owners to be removed

const result = await pluginActionExtendedClient.updateOwners({
  args: [ownersToAdd, ownersToRemove],
});

const txHash = await pluginActionExtendedClient.waitForUserOperationTransaction(
  result
);
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/connected-client.ts]
```

:::
