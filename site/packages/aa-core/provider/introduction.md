---
outline: deep
head:
  - - meta
    - property: og:title
      content: Introduction to SmartAccountProvider
  - - meta
    - name: description
      content: Introduction to SmartAccountProvider
  - - meta
    - property: og:description
      content: Introduction to SmartAccountProvider
---

# Introduction to SmartAccountProvider

The `SmartAccountProvider` is an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant Provider that wraps JSON RPC methods and some Wallet Methods (signing, sendTransaction, etc). With this Provider, you can submit User Operations to RPC providers, estimate gas, configure a Paymaster, send standard JSON RPC requests, and more. It is not opinionated about which RPC provider you are using and is configurable to work with any RPC provider. Because it implements EIP-1193, it can be used with any web3 library.

## Usage

<<< @/snippets/core-provider.ts
