---
title: How to manage ownership of a Multi-Owner Light Account
description: Follow this guide to manage ownership of a Multi-Owner Light
  Account with Account Kit, a vertically integrated stack for building apps that
  support ERC-4337 and ERC-6900.
---

# How to manage ownership of `MultiOwnerLightAccount`

A `MultiOwnerLightAccount` has one or more ECDSA or SCA owners. This lets your account integrate with multiple signers at once, and supports recovering your account if one signer is lost.

The `MultiOwnerLightAccount` is able to:

- Update (add or remove) owners for an account.
- Show all owners of an account.
- Validate signed signatures of ERC-4337 enabled user operations as well as regular transactions.

When you connect your `MultiOwnerLightAccount` to `SmartAccountClient` you can extend the client with `multiOwnerLightAccountClientActions`, which exposes a set of methods available to call the `MultiOwnerLightAccount` with the client connected to the account.

:::tip[Note]
When using `createMultiOwnerLightAccountAlchemyClient` in `@alchemy/aa-alchemy`, the `SmartAccountClient` comes automatically extended with `multiOwnerLightAccountClientActions` as defaults available for use.
:::

### 1. Get all current owners of a `MultiOwnerLightAccount`

You can use the `getOwnerAddresses` method on the `MultiOwnerLightAccount` object, which can be accessed from a connected client.

:::code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";

const owners = await lightAccountClient.account.getOwnerAddresses();
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/multi-owner-light-account-client.ts]
```

:::

### 2. Add or remove owners for a `MultiOwnerLightAccount`

You can use the `updateOwners` method on the `multiOwnerLightAccountClientActions` extended smart account client to add or remove owners from the `MultiOwnerLightAccount`.

:::code-group

```ts [example.ts]
import { lightAccountClient } from "./smartAccountClient";
import { multiOwnerPluginActions } from "@alchemy/aa-accounts";
import { type Address } from "viem";

const ownersToAdd: Address[] = []; // the addresses of owners to be added
const ownersToRemove: Address[] = []; // the addresses of owners to be removed

const opHash = await lightAccountClient.updateOwners({
  ownersToAdd,
  ownersToRemove,
});

const txHash = await lightAccountClient.waitForUserOperationTransaction({
  hash: opHash,
});
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/multi-owner-light-account-client.ts]
```

:::
