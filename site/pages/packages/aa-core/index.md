---
title: aa-core
description: Introduction to the aa-core package
---

# `@alchemy/aa-core`

This package contains the core interfaces and components for interacting with 4337 infrastructure. The primary interfaces that it exports are the `SmartAccountClient` and `SmartContractAccount`.

The `SmartAccountClient` is an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant Provider that wraps JSON RPC methods. With this Client, you can submit User Operations to RPC providers, estimate gas, configure a Paymaster, send standard JSON RPC requests, and more. It is not opinionated about which RPC provider you are using and is configurable to work with any RPC provider. Because it implements EIP-1193, it can be used with any web3 library.

The `SmartContractAccount` interface defines how you would interact with your Smart Contract Account. Any object that extends `SmartContractAccount` may also expose additional methods that allow its use with a `SmartAccountClient` to provide ergonomic utilities for building and submitting `User Operation`s.

## Getting started

To get started, first install the package:

:::code-group

```bash [yarn]
yarn add @alchemy/aa-core
```

```bash [npm]
npm i -s @alchemy/aa-core
```

```bash [pnpm]
pnpm i @alchemy/aa-core
```

:::

Then, you can create a client like so:

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-core/smartAccountClient.ts]
```
