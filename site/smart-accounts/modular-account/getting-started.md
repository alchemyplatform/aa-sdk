---
outline: deep
head:
  - - meta
    - property: og:title
      content: Modular Account • Getting Started
  - - meta
    - name: description
      content: Getting started with the Modular Account in Account Kit
  - - meta
    - property: og:description
      content: Getting started with the Modular Account in Account Kit
  - - meta
    - name: twitter:title
      content: Modular Account • Getting Started
  - - meta
    - name: twitter:description
      content: Getting started with the Modular Account in Account Kit
---

# Getting started with Modular Account

Getting started with Modular Account is really simple, especially if you are using `@alchemy/aa-alchemy`.

## With `@alchemy/aa-alchemy`

When using `@alchemy/aa-alchemy` it is really easy to get started simply do the following:

<<< @/snippets/aa-alchemy/connected-client.ts

## With `@alchemy/aa-core`

### Install packages

If you are using `@alchemy/aa-core` you'll want to also add `@alchemy/aa-accounts` to get the Smart Account factory for Modular Account.

```bash
yarn add @alchemy/aa-core @alchemy/aa-accounts
```

### Create a client

Then you'll need to create a `SmartAccountClient`

<<< @/snippets/aa-core/smartAccountClient.ts

::: tip Note
Above, we provide an account to our client directly. This allows us to set the account context for all calls to the `SmartAccountClient`. You can choose to omit it if you want to share one `SmartAccountClient` with multiple accounts.
:::

### Add decorators

The last step is optional, but it greatly improves the dev ex of interfacing with Modular Accounts. `@alchemy/aa-accounts` exports a number of Modular Account decorators that you can extend your client with.

::: code-group

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

<<< @/snippets/aa-core/smartAccountClient.ts
:::
