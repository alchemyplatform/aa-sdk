---
title: Light Account • Getting started
description: Getting started with Light Account in Account Kit
---

# Getting started with Light Account

It is easy to get started with Light Account! We will show you how to create and send user operations for both `LightAccount` and `MultiOwnerLightAccount` using `@alchemy/aa-alchemy`.

### Install packages

:::code-group

```bash [npm]
npm i @alchemy/aa-alchemy @alchemy/aa-core
```

```bash [yarn]
yarn add @alchemy/aa-alchemy @alchemy/aa-core
```

:::

### Create a client and send a user operation

The code snippets below demonstrate how to use `LightAccount` and `MultiOwnerLightAccount` with Account Kit. They create the account and send a `UserOperation` from it.

:::code-group

```ts [light-account.ts]
// [!include ~/snippets/aa-alchemy/light-account.ts]
```

```ts [multi-owner-light-account.ts]
// [!include ~/snippets/aa-alchemy/multi-owner-light-account.ts]
```

:::

:::tip[Address calculation]
For `LightAccount`, the address of the smart account will be calculated as a combination of the version, [the owner, and the salt](https://github.com/alchemyplatform/light-account/blob/v2.0.0/src/LightAccountFactory.sol#L24-L33). You will get the same smart account address each time you supply the same `version` and `owner`. Alternatively, you can supply `salt` if you want a different address for the same `version` and `owner` params (the default salt is `0n`). For `MultiOwnerLightAccount`, the same pattern follows, except that it takes an array of owner addresses instead of a single owner address.

If you want to use a signer to connect to an account whose address does not map to the contract-generated address, you can supply the `accountAddress` to connect with the account of interest. In that case, the `signer` address is not used for address calculation, but only used for signing the operation.

Reference: https://eips.ethereum.org/EIPS/eip-4337#first-time-account-creation
:::
