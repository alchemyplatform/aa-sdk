---
outline: deep
head:
  - - meta
    - property: og:title
      content: Light Account
  - - meta
    - name: description
      content: What is Light Account?
  - - meta
    - property: og:description
      content: What is Light Account?
  - - meta
    - name: twitter:title
      content: Light Account
  - - meta
    - name: twitter:description
      content: What is Light Account?
---

# Light Account

## Overview

Light Account is a collection of lightweight [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart accounts. We started with the Ethereum Foundation's canonical [SimpleAccount](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol) and added key improvements. It is fully production-ready [multiple](https://github.com/alchemyplatform/light-account/blob/develop/audits/2024-01-09_quantstamp_aa8196b.pdf) [audits](https://github.com/alchemyplatform/light-account/blob/develop/audits/2024-04-26_quantstamp_93f46a2.pdf), gas optimizations, and [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) signature support. Additionally, Light Account supports ownership transfers to ensure you and your users don't get locked into a particular signer.

## Light Account variants

Light Account has two variants catered to particular use cases. Both variants inherit the characteristics and features listed above.

### `LightAccount`

This is the default variant of Light Account that supports a single ECDSA or SCA owner. It is slightly more gas efficient than `MultiOwnerLightAccount`, and can be useful when you want to maximally optimize for gas spend or ensure that only one signer has access to the account at any given time.

`LightAccount` comes in versions v1.1.0 and v2.0.0, which make use of the v0.6 and v0.7 entry points respectively. For more information about the differences between entry points, see the [EntryPoint v0.7 Upgrade Guide](/using-smart-accounts/entry-point-v7.html).

For backwards compatibility, `LightAccount` defaults to version v1.1.0, but we recommend v2.0.0 for new dapps because of the advantages that come with entry point v0.7. However, once a version is chosen and the Light Account is created, the version must remain consistent in order for the Light Account client to work with the existing Light Account.

### `MultiOwnerLightAccount`

Multi-Owner Light Account is a variant of Light Account that supports multiple ECDSA or SCA owners at once rather than a single one. Each owner has full control over the account, including the ability to add or remove other owners. This lets your account integrate with multiple signers at once, and supports recovering your account if one signer is lost.

Multi-Owner Light Account uses v0.7 of the entry point. For details about entry point versions, see the [EntryPoint v0.7 Upgrade Guide](/using-smart-accounts/entry-point-v7.html).

## Developer links

- [Light Account deployment addresses](/smart-accounts/light-account/deployments)
- [Light Account Github repo](https://github.com/alchemyplatform/light-account)
- [Quantstamp audit report](https://github.com/alchemyplatform/light-account/blob/develop/audits/2024-04-26_quantstamp_93f46a2.pdf)
