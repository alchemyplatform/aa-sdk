---
outline: deep
head:
  - - meta
    - property: og:title
      content: aa-ethers
  - - meta
    - name: description
      content: aa-ethers landing page and getting started guide
  - - meta
    - property: og:description
      content: aa-ethers landing page and getting started guide
---

# `@alchemy/aa-ethers`

This package contains `EthersProviderAdapter` and `AccountSigner`, respective extensions of the `JsonRpcProvider` and `Signer` classes defined in `ethers.js` external library. If you currently rely `ethers.js` for web3 development, you can use these `ethers.js`-compatible `JsonRpcProvider` and `Signer` to integrate Account Abstraction into your dApp. You may also find the util methods helpful. This repo is community maintained and we welcome contributions!

## Getting started

If you are already using the `@alchemy/aa-core` package, you can simply install this package and start using the `EthersProviderAdapter` and `AccountSigner`. If you are not using `@alchemy/aa-core`, you can install it and follow the instructions in the ["Getting Started"](/getting-started) docs to get started.

::: code-group

```bash [yarn]
yarn add @alchemy/aa-ethers
```

```bash [npm]
npm i @alchemy/aa-ethers
```

```bash [pnpm]
pnpm i @alchemy/aa-ethers
```

:::

You can create a provider and connect it to a signer account like so:
::: code-group

<<< @/snippets/ethers-signer.ts
<<< @/snippets/ethers-provider.ts

:::
