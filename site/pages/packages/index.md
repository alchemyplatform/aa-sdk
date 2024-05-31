---
title: Packages Overview
description: Explore the benefits and tradeoffs of four different packages that
  can be used with Account Kit namely aa-core, aa-alchemy, aa-accounts,
  aa-signers, and aa-ethers.
---

# Package overview

Account Kit consists of a number of SDK packages that you can leverage to interact with [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) infrastructure.

For almost all cases, `aa-core` is sufficient with the subsequent packages offering various utilities for interacting with specific Account Abstraction infrastructure or smart accounts. However, we offer additional packages to augment your developer experience with custom Alchemy infrastructure (`aa-alchemy`), custom smart account (`aa-accounts`) and signer solutions (`aa-signers`), and an ethers.js-compatible solution (`aa-ethers`).

## [`aa-core`](/packages/aa-core/)

This package contains the core interfaces and components for interacting with 4337 infrastructure. The primary interfaces that it exports are the `SmartAccountClient` and `SmartContractAccount`.

The `SmartAccountClient` is an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant Provider that wraps JSON RPC methods. With this Provider, you can submit User Operations to RPC providers, estimate gas, configure a Paymaster and more. It is not opinionated about which RPC provider you are using and is configurable to work with any RPC provider. Because it implements EIP-1193, it can be used with any web3 library.

The `SmartContractAccount` interface is used to define how you would interact with your Smart Contract Account. The methods exposed and implemented by a class the implements `BaseSmartContractAccount` allow the `SmartAccountClient` to provide ergonomic utilities for building and submitting User Operations.

For more details on all the utilities exported by `aa-core` see the [aa-core documentation](/packages/aa-core/).

## [`aa-alchemy`](/packages/aa-alchemy/)

This package builds on `aa-core` by exporting an `AlchemySmartAccountClient` which extends `SmartAccountClient` and adds some additional utilities for interacting with our APIs and `Rundler`. The Client also exports utilities for leveraging our Gas Manager.

**If you are using our Bundler (`Rundler`) and Gas Manager you have to use this package.** This is due to the specifics around how our bundler does gas estimation. Not using this package and its client can result in incorrect gas estimations and failed transactions.

For more details on all the utilities exported by `aa-alchemy` see the [aa-alchemy documentation](/packages/aa-alchemy/).

## [`aa-accounts`](/packages/aa-accounts/)

This packages provides various implementations of `SmartContractAccount` for interacting with different smart accounts. This package is not required to use `aa-core` or `aa-alchemy`. If you want to use your own smart account implementation, you can do so by following the guide ["Using your own Account"](/smart-accounts/custom/using-your-own).

If you would like to use a smart account that is not supported by this package, you can implement `SmartContractAccount` yourself and use it with `aa-core` or `aa-alchemy`

For details on contributing your own smart account implementation, see the [aa-accounts contribution guide](/packages/aa-accounts/contributing).

To see all of the smart accounts that are supported by this package, see the [aa-accounts documentation](/packages/aa-accounts/).

## [`aa-signers`](/packages/aa-signers/)

This packages provides various implementations of `SmartAccountSigner` and `SmartAccountAuthenticator` for integrating different Signers of your smart account. This package is not required to use `aa-core` or `aa-alchemy`. If you want to use your own Signer implementation, you can do so by following the guide ["Using your own Signer"](/signers/guides/custom-signer).

If you would like to use a signer that is not supported by this package, you can implement a `SmartAccountSigner` or `SmartAccountAuthenticator` yourself and use it with `aa-core` or `aa-alchemy`.

For details on contributing your own Signer implementation, see the [aa-signers contribution guide](/packages/aa-signers/contributing).

To see all of the Signers that are supported by this package, see the [aa-signers documentation](/packages/aa-signers/).

## [`aa-ethers`](/packages/aa-ethers/)

This package provides an adapter that allows you to convert a `SmartAccountClient` or `AlchemySmartAccountClient` into an ethers `JsonRpcProvider` and `Signer`. These are primarily for convenience if your codebase expects a `JsonRpcProvider` or `Signer` in places and you want to use `aa-core` or `aa-alchemy` with minimal lift.

It is not required to use `aa-ethers` even if you are using `ethers` as your web3 library. Because the `SmartAccountClient` is an EIP-1193 compliant provider, you can always wrap it in an ethers [`Web3Provider`](https://docs.ethers.org/v5/api/providers/other/#Web3Provider) and use it as a `Signer` or `JsonRpcProvider`.
