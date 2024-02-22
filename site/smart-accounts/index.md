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

[Modular Account](/smart-accounts/modular-account/) is an ERC-4337 smart account that supports customizable features with ERC-6900 plugins. It is fully production-ready with multiple security audits and the capability to support any custom account behavior you need.

By following the [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) framework to unlock powerful features for smart accounts as plugins, Modular Account supports supercharging your accounts to provide a fully **customized** and **secure** user experience. We have created two pre-built plugins to level up your smart accounts, [`MultiOwnerPlugin`](/using-smart-accounts/transfer-ownership/modular-account) and [`SessionKeyPlugin`](/using-smart-accounts/session-keys/), and we look forward to what new plugins you create!

For most applications, we recommend using **Modular Account**. Suppose you have already deployed Light Account in the past. In that case, you can follow [Upgrading to a Modular Account](/smart-accounts/modular-account/upgrade-la-to-ma) guide to easily upgrade your account from Light Account to Modular Account using Account Kit and unlock an ecosystem of plugins for your smart account stack.

Modular Account has been audited by Spearbit and Quanstamp. You can find the audit reports [here](https://github.com/alchemyplatform/modular-account/tree/develop/audits). Modular Account is fully open source, so you can validate the [source code](https://github.com/alchemyplatform/modular-account).

<!--@include: ../resources/bbp.md-->

## Light Account

Account Kit provides a default smart account called `LightAccount`.

[Light Account](/smart-accounts/light-account/) is a secure, audited, gas-optimized, ERC-4337-compatible smart account implementation. It has features like ownership transfers, [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) message signing, and batched transactions. It is also [open](https://github.com/alchemyplatform/light-account) source](https://github.com/alchemyplatform/light-account)!

It is [deployed](/smart-accounts/light-account/#deployment-addresses) on Ethereum, Optimism, Arbitrum, Polygon, Base, and the respective testnets.

## Use your own Account

If above options do not fit your specific needs, you can always use your own smart account implementation with Account Kit. To learn how, see our guide in the [Use your own](/smart-accounts/custom/using-your-own) section.
