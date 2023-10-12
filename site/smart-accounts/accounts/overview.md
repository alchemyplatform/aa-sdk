---
outline: deep
head:
  - - meta
    - property: og:title
      content: Integrating a Smart Account
  - - meta
    - name: description
      content: Integrating a Smart Account Overview
  - - meta
    - property: og:description
      content: Integrating a Smart Account Overview
next:
  text: Integrating a Signer
  link: /smart-accounts/signers/overview
prev:
  text: Package Overview
  link: /package-overview
---

# Integrating a Smart Account

## What's a Smart Account?

A smart account is an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart contract account. You can use it to manage assets, execute transactions (known as `userOperations` or `userOps`), and more. There are many different implementations of a smart account, including our [Light Account](/smart-accounts/accounts/light-account).

## Light Account

Account Kit provides a default smart account called `LightAccount`.

[Light Account](/smart-accounts/accounts/light-account) is a secure, audited, gas-optimized, ERC-4337 compatible smart account implementation. It comes equipped with features like owner transfers, [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) message signing, and batched transactions. It's also [open source](https://github.com/alchemyplatform/light-account)!

For most applications, we recommend using the Light Account. It is [deployed](/smart-accounts/accounts/deployment-addresses) on Ethereum, Optimism, Arbitrum, Polygon, Base, and the respective testnets.

Here's a snippet that demonstrates how to work with the Light Account using Account Kit. This snippet sets up a Light Account and initiates a `UserOperation` from it:

<!--@include: ../../getting-started.md{56,68}-->

## Modular Account (coming soon)

We authoring a standard for modular smart accounts called [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900). Soon we will release an ERC-6900 compatible [Modular Account](/smart-accounts/accounts/modular-account). This will be an optional upgrade from Light Account to unlock an ecosystem of plugins for your smart account stack.

## Use Your Own Account

If Light Account doesn't fit your specific needs, you can always use your own smart account implementation with Account Kit. To learn how, see the guide on [Using Your Own Account Implementation](/smart-accounts/accounts/using-your-own).
