---
outline: deep
head:
  - - meta
    - property: og:title
      content: Choosing a Smart Account
  - - meta
    - name: description
      content: Learn about different kinds of smart account implementations to use with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - property: og:description
      content: Learn about different kinds of smart account implementations to use with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - name: twitter:title
      content: Choosing a Smart Account
  - - meta
    - name: twitter:description
      content: Learn about different kinds of smart account implementations to use with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Choosing a Smart Account

## What's a Smart Account?

A smart account is an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart account. You can use it to manage assets, execute transactions (known as `userOperations` or `userOps`), and more. There are many different implementations of a smart account, including our [Light Account](/smart-accounts/light-account/).

## Light Account

Account Kit provides a default smart account called `LightAccount`.

[Light Account](/smart-accounts/light-account/) is a secure, audited, gas-optimized, ERC-4337 compatible smart account implementation. It comes equipped with features like owner transfers, [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) message signing, and batched transactions. It's also [open source](https://github.com/alchemyplatform/light-account)!

For most applications, we recommend using Light Account. It is [deployed](/smart-accounts/accounts/deployment-addresses) on Ethereum, Optimism, Arbitrum, Polygon, Base, and the respective testnets.

## Modular Account

We are authoring a standard for modular smart accounts called [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900). Soon we will release an ERC-6900 compatible [Modular Account](/smart-accounts/modular-account/). This will be an optional upgrade from Light Account to unlock an ecosystem of plugins for your smart account stack.

## Use your own Account

If Light Account doesn't fit your specific needs, you can always use your own smart account implementation with Account Kit. To learn how, see our guide in the [Use your own](/smart-accounts/custom/using-your-own) section.
