---
outline: deep
head:
  - - meta
    - property: og:title
      content: aa-core
  - - meta
    - name: description
      content: Overview of the aa-core package
  - - meta
    - property: og:description
      content: Overview of the aa-core package
---

# `@alchemy/aa-core`

This package contains the core interfaces and components for interacting with 4337 infrastructure. The primary interfaces that it exports are the `SmartAccountProvider` and `BaseSmartContractAccount`.

The `SmartAccountProvider` is an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant Provider that wraps JSON RPC methods and some Wallet Methods (signing, sendTransaction, etc). With this Provider, you can submit User Operations to RPC providers, estimate gas, configure a Paymaster, send standard JSON RPC requests, and more. It is not opinionated about which RPC provider you are using and is configurable to work with any RPC provider. Because it implements EIP-1193, it can be used with any web3 library.

The `BaseSmartContractAccount` interface defines how you would interact with your Smart Contract Account. Any class that extends `BaseSmartContractAccount` may also expose additional methods that allow its connecting `SmartAccountProvider` to provide ergonic utilities for building and submitting User Operations.

## Getting Started

To get started, first install the package:

::: code-group

```bash [yarn]
yarn add @alchemy/aa-core
```

```bash [npm]
npm i @alchemy/aa-core
```

```bash [pnpm]
pnpm i @alchemy/aa-core
```

:::

Then, you can create a provider like so:
::: code-group
<<< @/snippets/core-provider.ts
:::
