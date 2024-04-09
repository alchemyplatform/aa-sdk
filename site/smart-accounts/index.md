---
outline: deep
head:
  - - meta
    - property: og:title
      content: Choosing a Smart Account
  - - meta
    - name: description
      content: Learn about different smart account implementations to use with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - property: og:description
      content: Learn about different smart account implementations to use with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - name: twitter:title
      content: Choosing a Smart Account
  - - meta
    - name: twitter:description
      content: Learn about different smart account implementations to use with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Choosing a Smart Account

## What is a Smart Account?

A smart account is an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart account. You can use it to manage assets, execute transactions (known as `User Operations`), and more. There are many different implementations of a smart account, including our [Light Account](/smart-accounts/light-account/).

## Modular Account

[Modular Account](/smart-accounts/modular-account/) is an Enterprise-grade smart contract account designed from the ground up for ERC-4337. It is highly secure, gas optimized, and endlessly customizable with ERC-6900 plugins.

Modular Account is the first [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) account implementation, making it infinitely extensible with custom plugins. Plug and play from a selection of existing plugins, including session keys and account recovery, or write your own to customize the account for your app. We have created two pre-built plugins available today, [`MultiOwnerPlugin`](/using-smart-accounts/transfer-ownership/modular-account) and [`SessionKeyPlugin`](/using-smart-accounts/session-keys/). We're actively building new plugins such as multisig, and we look forward to what new plugins you create!

For most applications, we recommend using **Modular Account**. Suppose you have already deployed Light Account in the past. In that case, you can follow [Upgrading to a Modular Account](/smart-accounts/modular-account/upgrade-la-to-ma) guide to easily upgrade your account from Light Account to Modular Account using Account Kit and unlock an ecosystem of plugins for your smart account stack.

Modular Account has been audited by both [Spearbit](https://github.com/alchemyplatform/modular-account/blob/develop/audits/2024-01-31_spearbit_0e3fd1e.pdf) and [Quantstamp](https://github.com/alchemyplatform/modular-account/blob/develop/audits/2024-02-20-quantstamp-8ae319e.pdf). It is fully [open source](https://github.com/alchemyplatform/modular-account) and supported by a [Bug Bounty](https://hackerone.com/alchemyplatform) program.

## Light Account

Account Kit provides a default smart account called `LightAccount`.

[Light Account](/smart-accounts/light-account/) is a secure, audited, gas-optimized, ERC-4337-compatible smart account implementation. It has features like ownership transfers, [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) message signing, and batched transactions. It is also [open source](https://github.com/alchemyplatform/light-account)!

It is [deployed](/smart-accounts/light-account/#deployment-addresses) on Ethereum, Optimism, Arbitrum, Polygon, Base, and the respective testnets.

## Use your own Account

Account Kit also makes it easy to use your own smart account implementation. To learn how, see our guide on how to [use your own account](/smart-accounts/custom/using-your-own).
