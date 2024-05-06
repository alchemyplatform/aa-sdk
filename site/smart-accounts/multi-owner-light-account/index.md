---
outline: deep
head:
  - - meta
    - property: og:title
      content: Multi-Owner Light Account
  - - meta
    - name: description
      content: What is Multi-Owner Light Account?
  - - meta
    - property: og:description
      content: What is Multi-Owner Light Account?
  - - meta
    - name: twitter:title
      content: Multi-Owner Light Account
  - - meta
    - name: twitter:description
      content: What is Multi-Owner Light Account?
---

# Multi-Owner Light Account

## Overview

Multi-Owner Light Account is a variant of [Light Account](/smart-accounts/light-account/) that supports multiple ECDSA or SCA owners at once rather than a single one. Each owner has full control over the account, including the ability to add or remove other owners. This lets your account integrate with multiple signers at once, and supports recovering your account if one signer is lost.

Like Light Account, Multi-Owner Light account is an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart account. It is fully production-ready with a security [audit](https://github.com/alchemyplatform/light-account/blob/develop/audits/2024-01-09_quantstamp_aa8196b.pdf), gas optimizations, and [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) signature support.

Multi-Owner Light Account uses v0.7 of the entry point. For details about entry point versions, see the [EntryPoint v0.7 Upgrade Guide](/using-smart-accounts/entry-point-v7.html).

## Getting started

The code snippet below demonstrates how to use Multi-Owner Light Account with Account Kit. It creates an account and sends a `UserOperation` from it:
::: code-group

<<< @/snippets/aa-alchemy/multi-owner-light-account.ts [aa-alchemy]

::: code-group

::: tip Address calculation
For the Multi-Owner Light Account, the address of the smart account will be calculated as a combination of [the initial owners and the salt](https://github.com/alchemyplatform/light-account/blob/main/src/LightAccountFactory.sol#L24-L33). You will get the same smart account address each time you supply the same `signer` and `owners`. Alternatively, you can supply `salt` if you want a different address for the same `signer` and `owner` params (the default salt is `0n`).

If you want to use a signer to connect to an account whose address does not map to the contract-generated address, you can supply the `accountAddress` to connect with the account of interest. In that case, the `signer` and `owners` params are not used for address calculation, and the `signer` param is only used for signing the operation.

Reference: https://eips.ethereum.org/EIPS/eip-4337#first-time-account-creation
:::

## [Deployment addresses](https://github.com/alchemyplatform/light-account/tree/v2.0.0/deployments)

The following table lists the deployed factory and account implementation contract addresses for `MultiOwnerLightAccount` on different chains:

| Chain            | Factory Address                            | Account Implementation                     |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| Eth Mainnet      | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Eth Sepolia      | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Polygon Mainnet  | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Polygon Mumbai   | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Polygon Amoy     | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Optimism         | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Optimism Sepolia | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Arbitrum         | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Arbitrum Sepolia | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Base             | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Base Sepolia     | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Zora Mainnet     | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Zora Sepolia     | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Fraxtal Mainnet  | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |
| Fraxtal Sepolia  | 0x000000000019d2Ee9F2729A65AfE20bb0020AefC | 0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D |

## Developer links

- [Light Account deployment addresses](/smart-accounts/light-account/#deployment-addresses)
- [Light Account Github repo](https://github.com/alchemyplatform/light-account)
- [Quantstamp audit report](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf)
