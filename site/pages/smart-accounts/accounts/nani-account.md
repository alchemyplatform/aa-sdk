---
title: Nani Account Smart Contract
description: Follow this guide to use Nani Account with Account Kit, a
  vertically integrated stack for building apps that support ERC-4337 and
  ERC-6900.
---

# Nani Account

## Overview

Nani Account is an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart account. It is built on the Ethereum Foundation’s canonical [SimpleAccount](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol) and extended to support modular plugins or "validators" using a custom nonce-storage method. It is built on the Solady audited smart contract library, and you can find the audit report [here](https://github.com/Vectorized/solady/pull/639).

## Why Nani Account

### Gas-optimized

Nani Account is the [the most gas-optimized smart account](https://github.com/zerodevapp/aa-benchmark/commit/4b8e548ef6b004069cff599347a2afb9ac837e54) in production, using cutting-edge efficiency techniques (like calldata compression and fallback token receipts) with low-level assembly code to drastically reduce the cost of verifying and executing account operations.

### Fully-featured

Nani Account supports nested [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) contract signatures, calldata compression for greater performance on L2, and a minimal ERC1967 UUPS (upgradeability) path. Nani Account also permits ownership transfers so that users don't get locked into a particular `Signer`.

#### Benchmarks

|                  | Creation | Native transfer | ERC20 transfer | Total  |
| ---------------- | -------- | --------------- | -------------- | ------ |
| SimpleAccount    | 383218   | 101319          | 90907          | 575444 |
| Biconomy         | 270013   | 104408          | 93730          | 468151 |
| Etherspot        | 279219   | 103719          | 93324          | 476262 |
| Light Account    | 279746   | 100844          | 90345          | 470935 |
| Kernel v2.0      | 339882   | 110018          | 99622          | 549522 |
| Kernel v2.1      | 265215   | 106460          | 96038          | 467713 |
| Kernel v2.1-lite | 230968   | 101002          | 90321          | 422291 |
| Nani Account     | 211982   | 99965           | 89346          | 401293 |

### Secure, Audited, Open Source

Nani Account is built on the foundation of the [Solady library](https://github.com/Vectorized/solady), an audited and performant codebase for efficient smart contracts. Nani Account is also fully open source so you can validate the [source code](https://github.com/NaniDAO/accounts).

### Modular

Nani Account supports validator plugins that allow users to add custom logic and authorization flows on Day 1, such as timelocking certain assets or actions, adding multiple signers to their account, as well as planning future transactions on automated schedules. These modular features rely on Nani Accounts' custom nonce-storage system, which improves the visibility and discoverability of plugins and related actions by using the ERC-4337 entry point's own accounting logic. When a user wants to enable or remove a plugin, they simply update their accounts' storage without requiring a delegatecall or full upgrade.

## Using Nani Account

The code snippet below demonstrates how to use Nani Account with Account Kit. It creates a Nani Account and sends a `UserOperation` from it:

<<< @/snippets/nani-account.ts

## Developer Links

- [Nani Account Deployment Addresses](https://github.com/NaniDAO/accounts#deployments)
- [Nani Account Github Repo](https://github.com/NaniDAO/accounts)
