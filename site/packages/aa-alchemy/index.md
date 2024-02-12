---
outline: deep
head:
  - - meta
    - property: og:title
      content: aa-alchemy
  - - meta
    - name: description
      content: aa-alchemy landing page and getting started guide
  - - meta
    - property: og:description
      content: aa-alchemy landing page and getting started guide
prev:
  text: aa-core
  link: /packages/aa-core/index
---

# `@alchemy/aa-alchemy`

This package contains the `AlchemySmartAccountClient`, an extension of the `SmartAccountClient` defined in `aa-core`. It also contains middleware for accessing the Gas Manager (an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) Paymaster) and for doing Fee Estimates according to the expectations of the [Rundler](https://github.com/alchemyplatform/rundler/tree/main) (an ERC-4337 Bundler). You may also find the util methods helpful. This repo is community maintained and we welcome contributions!

## Getting started

If you are already using the `@alchemy/aa-core` package, you can simply install this package and start using the `AlchemySmartAccountClient`. If you are not using `@alchemy/aa-core`, you can install it and follow the instructions in the ["Getting Started"](/getting-started/setup) docs to get started.

::: code-group

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
::: code-group

<<< @/snippets/aa-alchemy/base-client.ts

:::
