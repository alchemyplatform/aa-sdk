---
outline: deep
head:
  - - meta
    - property: og:title
      content: Modular Account • Getting started
  - - meta
    - name: description
      content: Getting started with the Modular Account in Account Kit
  - - meta
    - property: og:description
      content: Getting started with the Modular Account in Account Kit
  - - meta
    - name: twitter:title
      content: Modular Account • Getting started
  - - meta
    - name: twitter:description
      content: Getting started with the Modular Account in Account Kit
---

# Getting started with Modular Account

It's easy to get started with Modular Account! We'll show you two different ways using `@alchemy/aa-alchemy` and `@alchemy/aa-core`.

::: tip Choosing your package
The [`aa-core`](/packages/aa-core/) package is not opinionated about your RPC provider. As a result, creating a client requires more configuration. If you don't need this extra flexibility, [`aa-alchemy`](/packages/aa-alchemy/) is much easier to jump in with, as you'll see below.
:::

## With `@alchemy/aa-alchemy`

### Install packages

::: code-group

```bash [npm]
npm i @alchemy/aa-alchemy @alchemy/aa-core
```

```bash [yarn]
yarn add @alchemy/aa-alchemy @alchemy/aa-core
```

:::

### Create a client

Then you can simply do the following:

<<< @/snippets/aa-alchemy/connected-client.ts

::: tip Address calculation
For the Light Account, the address of the smart account will be calculated as a combination of [the owner and the salt](https://github.com/alchemyplatform/light-account/blob/main/src/LightAccountFactory.sol#L24-L33). You will get the same smart account address each time you supply the same `owner`, the signer that was used to create the account for the first time. You can also optionally supply `salt` if you want a different address for the same `owner` param (the default salt is `0n`).

If you want to use a signer to connect to an account whose address does not map to the contract generated address, you can supply the `accountAddress` to connect with the account of interest. In that case, the `signer` address is not used for address calculation, but only used for signing the operation.
:::

That's it! You've configured your client.

Next, if you want to replace that `signer` with a smart account signer, check out [choosing a signer](/signers/choosing-a-signer). Or, if you're ready to get onchain, go to [send user operations](/using-smart-accounts/send-user-operations).

## With `@alchemy/aa-core`

### Install packages

If you are using `@alchemy/aa-core` you'll want to also add `@alchemy/aa-accounts` to get the Smart Account factory for Modular Account.

::: code-group

```bash [npm]
npm i @alchemy/aa-core @alchemy/aa-accounts viem
```

```bash [yarn]
yarn add @alchemy/aa-core @alchemy/aa-accounts viem
```

:::

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

Next, if you want to use a different `signer` with a smart account signer, check out [choosing a signer](/signers/choosing-a-signer). Or, if you're ready to get onchain, go to [send user operations](/using-smart-accounts/send-user-operations).
