---
outline: deep
head:
  - - meta
    - property: og:title
      content: Deploying a Smart Account
  - - meta
    - name: description
      content: Deploying a Smart Account Overview
  - - meta
    - property: og:description
      content: Deploying a Smart Account Overview
next:
  text: Integrating a Signer
  link: /smart-accounts/signers/overview
---

# Deploying a Smart Account

## What's a Smart Account?

A smart account is a smart contract controlled by an account owner or other authorized entities. You can use it to manage assets, carry out transactions (known as `userOperations` or `userOps`), and more. There are many different implementations of a Smart Account, including Alchemy's [Light Account](/smart-accounts/accounts/light-account).

## Kick Off with Light Account

The Light Account offers a straightforward, secure, and cost-effective smart account implementation. It comes equipped with features like owner transfers, [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) message signing, and batched transactions. For most applications, we recommend using the Light Account.

Here's a snippet that demonstrates how to work with the Light Account using Account Kit. This snippet sets up a Light Account and initiates a `UserOperation` from it:

<!--@include: ../../getting-started.md{56,68}-->

## Modular Account Implementation

The Alchemy team is actively developing the Modular Account Implementation, which adheres to the [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) standard. It's set to include all the features of the Light Account and additional functionalities. Additionally, because ERC-6900 is [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) compliant, the Modular Account Implementation is well-suited to the ERC-4337 ecosystem. The `LightAccount` design is forward-compatible with `ModularAccount`. Until `ModularAccount` is available, it's a good practice to use `LightAccount`.

If the Light Account doesn't fit your specific needs, you can always use your own smart account implementation with Account Kit. For detailed guidance on this, refer to the guide on [Using Your Own Account Implementation](/smart-accounts/accounts/using-your-own).

## Deployed Contract Addresses

The following tables list the deployed factory and account implementation contract addresses for `LightAccount` and `SimpleAccount` on different chains:

### Light Account

| Chain           | Factory Address                            | Account Implementation                     |
| --------------- | ------------------------------------------ | ------------------------------------------ |
| Eth Mainnet     | 0x000000893A26168158fbeaDD9335Be5bC96592E2 | 0xc1B2fC4197c9187853243E6e4eb5A4aF8879a1c0 |
| Eth Sepolia     | 0x000000893A26168158fbeaDD9335Be5bC96592E2 | 0xc1B2fC4197c9187853243E6e4eb5A4aF8879a1c0 |
| Eth Goerli      | 0x000000893A26168158fbeaDD9335Be5bC96592E2 | 0xc1B2fC4197c9187853243E6e4eb5A4aF8879a1c0 |
| Polygon Mainnet | 0x000000893A26168158fbeaDD9335Be5bC96592E2 | 0xc1B2fC4197c9187853243E6e4eb5A4aF8879a1c0 |
| Polygon Mumbai  | 0x000000893A26168158fbeaDD9335Be5bC96592E2 | 0xc1B2fC4197c9187853243E6e4eb5A4aF8879a1c0 |
| Optimism        | 0x000000893A26168158fbeaDD9335Be5bC96592E2 | 0xc1B2fC4197c9187853243E6e4eb5A4aF8879a1c0 |
| Optimism Goerli | 0x000000893A26168158fbeaDD9335Be5bC96592E2 | 0xc1B2fC4197c9187853243E6e4eb5A4aF8879a1c0 |
| Base            | 0x000000893A26168158fbeaDD9335Be5bC96592E2 | 0xc1B2fC4197c9187853243E6e4eb5A4aF8879a1c0 |
| Base Goerli     | 0x000000893A26168158fbeaDD9335Be5bC96592E2 | 0xc1B2fC4197c9187853243E6e4eb5A4aF8879a1c0 |
| Arbitrum        | 0x000000893A26168158fbeaDD9335Be5bC96592E2 | 0xc1B2fC4197c9187853243E6e4eb5A4aF8879a1c0 |
| Arbitrum Goerli | 0x000000893A26168158fbeaDD9335Be5bC96592E2 | 0xc1B2fC4197c9187853243E6e4eb5A4aF8879a1c0 |

### Simple Account

| Chain           | Factory Address                            |
| --------------- | ------------------------------------------ |
| Eth Mainnet     | 0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232 |
| Eth Sepolia     | 0x9406cc6185a346906296840746125a0e44976454 |
| Eth Goerli      | 0x9406cc6185a346906296840746125a0e44976454 |
| Polygon Mainnet | 0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232 |
| Polygon Mumbai  | 0x9406Cc6185a346906296840746125a0E44976454 |
| Optimism        | 0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232 |
| Optimism Goerli | 0x9406cc6185a346906296840746125a0e44976454 |
| Base            | 0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232 |
| Base Goerli     | 0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232 |
| Arbitrum        | 0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232 |
| Arbitrum Goerli | 0x9406cc6185a346906296840746125a0e44976454 |

## Benchmarks

Here are some benchmarks for the Light Account vs other smart account implementations:

| Account              | Creation | Native transfer | ERC20 transfer | Total Gas |
| -------------------- | -------- | --------------- | -------------- | --------- |
| Alchemy LightAccount | 279710   | 100844          | 90345          | 470899    |
| Kernel v2.1-lite     | 230968   | 101002          | 90321          | 422291    |
| Kernel v2.1          | 265215   | 106460          | 96038          | 467713    |
| Biconomy             | 270013   | 104408          | 93730          | 468151    |
| Etherspot            | 279219   | 103719          | 93324          | 476262    |
| Kernel v2.0          | 339882   | 110018          | 99622          | 549522    |
| SimpleAccount        | 383218   | 101319          | 90907          | 575444    |
