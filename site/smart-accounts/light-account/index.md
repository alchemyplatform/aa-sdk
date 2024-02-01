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

Light Account is an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart account. We started with the Ethereum Foundation’s canonical [SimpleAccount](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol) and added key improvements. It's fully production-ready with a security [audit](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf), gas optimizations, and [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) signature support. Additionally, Light Account supports ownership transfer to ensure you and your user don't get locked into a particular Signer.

## Getting Started

The code snippet below demonstrates how to use Light Account with Account Kit. It creates a Light Account and sends a `UserOperation` from it:
::: code-group

<<< @/snippets/aa-alchemy/light-account.ts [aa-alchemy]

<<< @/snippets/aa-core/smartAccountClient.ts [aa-core]

::: code-group

## [Deployment Addresses](https://github.com/alchemyplatform/light-account/blob/v1.1.0/Deployments.md)

The following tables list the deployed factory and account implementation contract addresses for `LightAccount` on different chains:

| Chain            | Factory Address                            | Account Implementation                     |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| Eth Mainnet      | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Eth Sepolia      | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Eth Goerli       | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Polygon Mainnet  | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Polygon Mumbai   | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Optimism         | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Optimism Goerli  | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Base             | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Base Goerli      | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Arbitrum         | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Arbitrum Goerli  | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Arbitrum Sepolia | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |

## Developer Links

- [Light Account & Simple Account Deployment Addresses](/smart-accounts/accounts/deployment-addresses)
- [Light Account Github Repo](https://github.com/alchemyplatform/light-account)
- [Quantstamp Audit Report](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf)
