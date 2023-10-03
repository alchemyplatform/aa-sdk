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
---

# `@alchemy/aa-alchemy`

This package contains `AlchemyProvider`, an implementation of `SmartAccountProvider` class defined in `aa-core`. It also contains middleware for accessing the Alchemy Gas Manager (an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) Paymaster) and for doing Fee Estimates according to the expectations of the Alchemy Rundler (an ERC-4337 Bundler). You may also find the util methods helpful. This repo is community maintained and we welcome contributions!

## Getting started

If you are already using the `@alchemy/aa-core` package, you can simply install this package and start using the `AlchemyProvider`. If you are not using `@alchemy/aa-core`, you can install it and follow the instructions in the ["Getting Started"](/getting-started) docs to get started.

::: code-group

```bash [yarn]
yarn add @alchemy/aa-alchemy
```

```bash [npm]
npm i @alchemy/aa-alchemy
```

```bash [pnpm]
pnpm i @alchemy/aa-alchemy
```

:::

Then, you can create a provider like so:
::: code-group

<<< @/snippets/provider.ts

:::
