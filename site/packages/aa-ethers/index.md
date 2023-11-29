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
prev:
  text: aa-signers
  link: /packages/aa-signers/index
next:
  text: EthersProviderAdapter
---

# `@alchemy/aa-ethers`

This package contains `EthersProviderAdapter` and `AccountSigner`, respective extensions of the [`JsonRpcProvider`](https://docs.ethers.org/v5/api/providers/jsonrpc-provider/) and [`Signer`](https://docs.ethers.org/v5/api/signer/) classes defined in [`ethers.js`](https://docs.ethers.org/v5/) external library.

If you currently rely `ethers.js` for web3 development, you can use these `ethers.js`-compatible `JsonRpcProvider` and `Signer` to integrate Account Abstraction into your dApp. You may also find the [`util`](./utils/introduction.md) methods helpful.

This repo is community maintained and we welcome contributions!

## Getting started

If you are already using the `@alchemy/aa-core` package, you can simply install this package and start using the `EthersProviderAdapter` and `AccountSigner`. If you are not using `@alchemy/aa-core`, you can install it and follow the instructions in the ["Getting Started"](/overview/getting-started) docs to get started.

::: code-group

```bash [yarn]
yarn add @alchemy/aa-ethers
```

```bash [npm]
npm i -s @alchemy/aa-ethers
```

```bash [pnpm]
pnpm i @alchemy/aa-ethers
```

:::

You can create a provider and connect it to a Signer account like so:
::: code-group

<<< @/snippets/ethers-signer.ts
<<< @/snippets/ethers-provider.ts

:::
