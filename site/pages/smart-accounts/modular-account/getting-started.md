---
title: Modular Account • Getting started
description: Getting started with Modular Account in Account Kit
---

# Getting started with Modular Account

It is easy to get started with Modular Account! We will show you two different ways using `@alchemy/aa-alchemy` and `@alchemy/aa-core`.

:::tip[Choosing your package]
The [`aa-core`](/packages/aa-core/) package is not opinionated about your RPC provider. As a result, creating a client requires more configuration. As you will see below, [`aa-alchemy`](/packages/aa-alchemy/) is much easier to jump in with if you do not need this extra flexibility.
:::

## With `@alchemy/aa-alchemy`

### Install packages

:::code-group

```bash [npm]
npm i @alchemy/aa-alchemy @alchemy/aa-core
```

```bash [yarn]
yarn add @alchemy/aa-alchemy @alchemy/aa-core
```

:::

### Create a client

Then you can do the following:

```ts [connected-client.ts]
// [!include ~/snippets/aa-alchemy/connected-client.ts]
```

:::tip[Address calculation]
For Modular Account, the address of the smart account will be calculated as a combination of [the owners and the salt](https://github.com/alchemyplatform/modular-account/blob/v1.0.x/src/factory/MultiOwnerModularAccountFactory.sol#L79-L82). You will get the same smart account address each time you supply the same `owners`, the signer(s) used to create the account for the first time. You can also optionally supply `salt` if you want a different address for the same `owners` param (the default salt is `0n`).

If you want to use a signer to connect to an account whose address does not map to the contract-generated address, you can supply the `accountAddress` to connect with the account of interest. In that case, the `signer` address is not used for address calculation, but only for signing the operation.
:::

## With `@alchemy/aa-core`

### Install packages

If you are using `@alchemy/aa-core`, you will also want to add `@alchemy/aa-accounts` to get the Smart Account factory for Modular Account.

:::code-group

```bash [npm]
npm i @alchemy/aa-core @alchemy/aa-accounts viem
```

```bash [yarn]
yarn add @alchemy/aa-core @alchemy/aa-accounts viem
```

:::

### Create a client

Then, you will need to create a `SmartAccountClient`

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-core/smartAccountClient.ts]
```

:::tip[Note]
Above, we provide an account to our client directly. This allows us to set the account context for all calls to the `SmartAccountClient`. You can omit it to share one `SmartAccountClient` with multiple accounts.
:::

### Add decorators

The last step is optional but greatly improves the dev experience of interfacing with Modular Accounts. `@alchemy/aa-accounts` exports several Modular Account decorators that you can extend your client with.

:::code-group

```ts
import { smartAccountClient } from "./smartAccountClient";
import {
  accountLoupeActions,
  multiOwnerPluginActions,
  pluginManagerActions,
} from "@alchemy/aa-accounts";

const decoratedClient = smartAccountClient
  // provides methods for interacting with the multi-owner plugin that is installed by default
  .extend(multiOwnerPluginActions)
  // provides methods for managing plugins
  .extend(pluginManagerActions)
  // provides methods for querying the account's state
  .extend(accountLoupeActions);
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-core/smartAccountClient.ts]
```

:::

Next, if you want to use a different `signer` with a smart account signer, check out [choosing a signer](/signers/choosing-a-signer). Otherwise, if you are ready to get on-chain, go to [send user operations](/using-smart-accounts/send-user-operations).
