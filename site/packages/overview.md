---
outline: deep
head:
  - - meta
    - property: og:title
      content: Package Overview
  - - meta
    - name: description
      content: Overview of the packges available in the Account Kit SDK
  - - meta
    - property: og:description
      content: Overview of the packges available in the Account Kit SDK
---

# Package Overview

The Alchemy Account Kit SDK is comprised of a number of smaller packages that developers can leverage to interact with [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) infrastructure. For almost all cases, `aa-core` is sufficient with the subsequent packages offering various utilities for interacting with specific Account Abstraction Infrastructure or Smart Accounts.

## [`aa-core`](/packages/aa-core/)

This package contains the core interfaces and components for interacting with 4337 infrastructure. The primary interfaces that it exports are the `SmartAccountProvider` and `BaseSmartContractAccount`.

The `SmartAccountProvider` is an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant Provider that wraps JSON RPC methods and some Wallet Methods (signing, sendTransaction, etc). With this Provider, you can submit User Operations to RPC providers, estimate gas, configure a Paymaster and more. It is not opinionated about which RPC provider you are using and is configurable to work with any RPC provider. Because it implements EIP-1193, it can be used with any web3 library.

The `BaseSmartContractAccount` interface is used to define how you would interact with your Smart Contract Account. The methods exposed and implemented by a class the implements `BaseSmartContractAccount` allow the `SmartAccountProvider` to provide ergonic utilities for building and submitting User Operations.

For more details on all the utilities exported by `aa-core` see the [aa-core documentation](/packages/aa-core/).

## [`aa-alchemy`](/packages/aa-alchemy/)

This package builds on `aa-core` by exporting an `AlchemyProvider` which extends `SmartAccountProvider` and adds some additional utilities for interacting with Alchemy's RPCs and Alchemy's `rundler`. The Provider also exports utilities for leveraging Alchemy's Gas Manager.

**If you are using Alchemy's RPCs you have to use this package.** This is due to the specifics around how Alchemy's bundler does gas estimation. Not using this package and it's provider can result in incorrect gas estimations and failed transactions.

For more details on all the utilities exported by `aa-alchemy` see the [aa-alchemy documentation](/packages/aa-alchemy/).

## [`aa-accounts`](/packages/aa-accounts/)

This packages provides various implementations of `BaseSmartContractAccount` for interacting with different Smart Accounts. This package is not required to use `aa-core` or `aa-alchemy`. If you want to use your own Smart Account implementation, you can do so by following the guide ["Using Your Own Account"](/smart-accounts/accounts/using-your-own).

If you'd like to use a Smart Account that is not supported by this package, you can implement `BaseSmartContractAccount` yourself and use it with `aa-core` or `aa-alchemy`

For details on contributing your own Smart Account implementation, see the [aa-accounts contribution guide](/packages/aa-accounts/contributing).

To see all of the Smart Accounts that are supported by this package, see the [aa-accounts documentation](/packages/aa-accounts/).

## [`aa-ethers`](/packages/aa-ethers/)

This package provides an adapter that allows you to convert a `SmartAccountProvider` or `AlchemyProvider` into an ethers `JsonRpcProvider` and `Signer`. These are primarily for convenience if your codebase expects a `JsonRpcProvider` or `Signer` in places and you want to use `aa-core` or `aa-alchemy` with minimal lift.

It is not required to use `aa-ethers` even if you are using `ethers` as your web3 library. Because the `SmartAccountProvider` is an EIP-1193 compliant provider, you can always wrap it in an ethers [`Web3Provider`](https://docs.ethers.org/v5/api/providers/other/#Web3Provider) and use it as a `Signer` or `JsonRpcProvider`.
