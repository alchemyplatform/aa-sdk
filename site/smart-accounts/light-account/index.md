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

Light Account is an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart account. We started with the Ethereum Foundation’s canonical [SimpleAccount](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol) and added key improvements. It is fully production-ready with a security [audit](https://github.com/alchemyplatform/light-account/blob/develop/audits/2024-01-09_quantstamp_aa8196b.pdf), gas optimizations, and [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) signature support. Additionally, Light Account supports ownership transfer to ensure you and your user don't get locked into a particular Signer.

Light Account also comes in a variant which supports multiple simultaneous owners rather than a single one. For details, see [Multi-Owner Light Account](/smart-accounts/multi-owner-light-account/).

## Getting started

The code snippet below demonstrates how to use Light Account with Account Kit. It creates a Light Account and sends a `UserOperation` from it:
::: code-group

<<< @/snippets/aa-alchemy/light-account.ts [aa-alchemy]

::: code-group

## Choosing a version

Light Account comes in versions v1.1.0 and v2.0.0, which make use of the v0.6 and v0.7 entry points respectively. For more information about the differences between entry points, see the [EntryPoint v0.7 Upgrade Guide](/using-smart-accounts/entry-point-v7.html).

For backwards compatibility, Light Account defaults to version v1.1.0, but we recommend v2.0.0 for new dapps because of the advantages that come with entry point v0.7. However, once a version is chosen and the light account is created, the version must remain consistent in order for the light account client to work with the existing light account.

::: tip Address calculation
For the Light Account, the address of the smart account will be calculated as a combination of the version, [the owner, and the salt](https://github.com/alchemyplatform/light-account/blob/v2.0.0/src/LightAccountFactory.sol#L24-L33). You will get the same smart account address each time you supply the same `version` and `owner`. Alternatively, you can supply `salt` if you want a different address for the same `version` and `owner` params (the default salt is `0n`).

If you want to use a signer to connect to an account whose address does not map to the contract-generated address, you can supply the `accountAddress` to connect with the account of interest. In that case, the `signer` address is not used for address calculation, but only used for signing the operation.

Reference: https://eips.ethereum.org/EIPS/eip-4337#first-time-account-creation
:::

## [Deployment addresses](https://github.com/alchemyplatform/light-account/tree/v2.0.0/deployments)

The following table lists the deployed factory and account implementation contract addresses for `LightAccount` on different chains:

### v2.0.0

| Chain            | Factory Address                            | Account Implementation                     |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| Eth Mainnet      | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |
| Eth Sepolia      | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |
| Polygon Mainnet  | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |
| Polygon Amoy     | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |
| Optimism         | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |
| Optimism Sepolia | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |
| Arbitrum         | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |
| Arbitrum Sepolia | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |
| Base             | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |
| Base Sepolia     | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |
| Zora Mainnet     | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |
| Zora Sepolia     | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |
| Fraxtal Mainnet  | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |
| Fraxtal Sepolia  | 0x0000000000400CdFef5E2714E63d8040b700BC24 | 0x8E8e658E22B12ada97B402fF0b044D6A325013C7 |

### v1.1.0

| Chain            | Factory Address                            | Account Implementation                     |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| Eth Mainnet      | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Eth Sepolia      | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Polygon Mainnet  | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Polygon Amoy     | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Optimism         | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Optimism Sepolia | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Arbitrum         | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Arbitrum Sepolia | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Base             | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Base Sepolia     | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Zora Mainnet     | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Zora Sepolia     | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Fraxtal Mainnet  | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |
| Fraxtal Sepolia  | 0x00004EC70002a32400f8ae005A26081065620D20 | 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba |

## Developer links

- [Light Account deployment addresses](/smart-accounts/light-account/#deployment-addresses)
- [Light Account Github repo](https://github.com/alchemyplatform/light-account)
- [Quantstamp audit report](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf)
