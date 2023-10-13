---
outline: deep
head:
  - - meta
    - property: og:title
      content: Light Account
  - - meta
    - name: description
      content: Follow this guide to use Light Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this guide to use Light Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: Light Account
  - - meta
    - name: twitter:description
      content: Follow this guide to use Light Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# Light Account

**Secure, optimized, and extendable**

## Overview

Light Account is a [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart account solution designed to address the core needs of web3, focusing on efficiency, trust, and security for your account. It turbocharges Ethereum smart accounts by reducing gas costs, and supporting [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) signatures to ensure compatibility across all decentralized applications (dApps). Additionally, Light Account offers ownership transfer capabilities, ensuring users are not tied to a single signer.

## Why Light Account

### Gas-optimized (Benchmarks)

Light Account is engineered to minimize gas costs, as demonstrated by the benchmark results below. These results highlight its efficiency in various common user flows:

| Account                                                                                                                 | Native transfer | ERC20 transfer | Creation |
| ----------------------------------------------------------------------------------------------------------------------- | --------------- | -------------- | -------- |
| Alchemy LightAccount                                                                                                    | 100844          | 90345          | 279746   |
| Kernel v2.1-lite                                                                                                        | 101002          | 90321          | 230968   |
| [SimpleAccount](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol) | 101319          | 90907          | 383218   |
| Etherspot                                                                                                               | 103719          | 93324          | 279219   |
| Biconomy                                                                                                                | 104408          | 93730          | 270013   |
| Kernel v2.1                                                                                                             | 106460          | 96038          | 265215   |
| Kernel v2.0                                                                                                             | 110018          | 99622          | 339882   |

### Secure (Audited and Open-Sourced)

Light Account has been thoroughly audited by Quantstamp, ensuring its security and reliability. You can find the audit report [here](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf). It's an open-source solution, allowing developers to inspect and validate its code.

### Modular 6900 Accounts (Coming Soon)

We've designed Light Account with the future in mind, making it forward-compatible and upgradeable for future, more optimized versions and the upcoming modular [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) account standard, ensuring you'll stay on the cutting edge of EVM accounts.

## Using Light Account

The code snippet below demonstrates how to use Light Account with Account Kit. It creates a Light Account and sends a `UserOperation` from it:

<<< @/snippets/light-account.ts

## Developer Links

- [LightAccount & Simple Account Deployment Addresses](/smart-accounts/accounts/deployment-addresses)
- [LightAccount Github Repo](https://github.com/alchemyplatform/light-account)
- [Quantstamp Audit Report](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf)
