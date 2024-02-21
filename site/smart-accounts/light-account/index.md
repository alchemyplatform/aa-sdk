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

## Getting started

The code snippet below demonstrates how to use Light Account with Account Kit. It creates a Light Account and sends a `UserOperation` from it:
::: code-group

<<< @/snippets/aa-alchemy/light-account.ts [aa-alchemy]

<<< @/snippets/aa-accounts/lightAccountClient.ts [aa-accounts]

::: code-group

::: tip Address calculation
For the Light Account, the address of the smart account will be calculated as a combination of [the owner and the salt](https://github.com/alchemyplatform/light-account/blob/main/src/LightAccountFactory.sol#L24-L33). You will get the same smart account address each time you supply the same `owner`, the signer that was used to create the account for the first time. You can also optionally supply `salt` if you want a different address for the same `owner` param (the default salt is `0n`).

If you want to use a signer to connect to an account whose address does not map to the contract generated address, you can supply the `accountAddress` to connect with the account of interest. In that case, the `signer` address is not used for address calculation, but only used for signing the operation.
:::

## [Deployment addresses](https://github.com/alchemyplatform/light-account/blob/v1.1.0/Deployments.md)

The following tables list the deployed factory and account implementation contract addresses for `LightAccount` on different chains:

| Chain            | Factory Address                            | Account Implementation                     |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| Eth Mainnet      | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Eth Sepolia      | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Polygon Mainnet  | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Polygon Mumbai   | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Optimism         | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Optimism Sepolia | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Arbitrum         | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Arbitrum Sepolia | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Base             | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Base Sepolia     | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |

## Developer links

- [Light Account deployment addresses](/smart-accounts/light-account/#deployment-addresses)
- [Light Account Github repo](https://github.com/alchemyplatform/light-account)
- [Quantstamp audit report](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf)
