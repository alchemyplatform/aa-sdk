---
outline: deep
title: aa-alchemy
description: aa-alchemy landing page and getting started guide
---

# `@alchemy/aa-alchemy`

This package contains the `AlchemySmartAccountClient`, an extension of the `SmartAccountClient` defined in `aa-core`. It also contains middleware for accessing the Gas Manager (an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) Paymaster) and for doing Fee Estimates according to the expectations of the [Rundler](https://github.com/alchemyplatform/rundler/tree/main) (an ERC-4337 Bundler). You may also find the util methods helpful. This repo is community maintained and we welcome contributions!

## Getting started

If you are already using the `@alchemy/aa-core` package, you can simply install this package and start using the `AlchemySmartAccountClient`. If you are not using `@alchemy/aa-core`, you can install it and follow the instructions in the ["Getting started"](/getting-started/introduction) docs to get started.

:::code-group

```bash [yarn]
yarn add @alchemy/aa-alchemy
```

```bash [npm]
npm i -s @alchemy/aa-alchemy
```

```bash [pnpm]
pnpm i @alchemy/aa-alchemy
```

:::

Then, you can create a client like so:

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/base-client.ts]
```
