---
title: Choosing a Smart Account
description: Learn about different smart account implementations to use with
  Account Kit, a vertically integrated stack for building apps that support
  ERC-4337 and ERC-6900.
---

# Choosing a Smart Account

## What is a Smart Account?

A smart account is an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart account. You can use it to manage assets, execute transactions (known as `UserOperation`s), and more. There are many different implementations of a smart account, including [Modular Account](/smart-accounts/modular-account/) and [Light Account](/smart-accounts/light-account/).

## Modular Account

[Modular Account](/smart-accounts/modular-account/) is an enterprise-grade smart contract account designed from the ground up for ERC-4337. It is highly secure, gas optimized, and endlessly customizable with ERC-6900 plugins. With our pre-built plugins, it supports multiple owners (1-of-n), multisig thresholds (m-of-n), and session keys with scoped permissions.

Modular Account is the first [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) account implementation, making it infinitely extensible with custom plugins. Plug and play from a selection of existing plugins, including session keys and multisig, or write your own to customize the account for your app. We have created three pre-built plugins available today: [`MultiOwnerPlugin`](/using-smart-accounts/transfer-ownership/modular-account), [`SessionKeyPlugin`](/using-smart-accounts/session-keys/), and [`MultisigPlugin`](/smart-accounts/modular-account/multisig-plugin/). We're actively building new plugins and look forward to what new plugins you create!

For most applications, we recommend using **Modular Account**. Suppose you have already deployed Light Account in the past. In that case, you can follow [Upgrading to a Modular Account](/smart-accounts/modular-account/upgrade-la-to-ma) guide to easily upgrade your account from Light Account to Modular Account using Account Kit and unlock an ecosystem of plugins for your smart account stack.

Modular Account has been audited by both [Spearbit](https://github.com/alchemyplatform/modular-account/blob/develop/audits/2024-01-31_spearbit_0e3fd1e.pdf) and [Quantstamp](https://github.com/alchemyplatform/modular-account/blob/develop/audits/2024-02-19_quantstamp_0e3fd1e.pdf). It is fully [open source](https://github.com/alchemyplatform/modular-account) and supported by a [Bug Bounty](https://hackerone.com/alchemyplatform) program. It is [deployed](/smart-accounts/modular-account/deployments) on multiple networks and their respective testnets.

## Light Account

[Light Account](/smart-accounts/light-account/) is a collection of lightweight, production-ready [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart accounts. It builds on top of Ethereum Foundation's canonical [SimpleAccount](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol) to add key improvements such as ownership transfers, multiple owners, ERC-1271 signature support, and gas optimizations.

It is fully [open source](https://github.com/alchemyplatform/light-account) and has been audited [multiple](https://github.com/alchemyplatform/light-account/blob/develop/audits/2024-01-09_quantstamp_aa8196b.pdf) [times](https://github.com/alchemyplatform/light-account/blob/develop/audits/2024-04-26_quantstamp_93f46a2.pdf) by Quantstamp. It is [deployed](/smart-accounts/light-account/deployments) on multiple networks and their respective testnets.

## Use your own Account

Account Kit also makes it easy to use your own smart account implementation. To learn how, see our guide on how to [use your own account](/smart-accounts/custom/using-your-own).
