---
outline: deep
head:
  - - meta
    - property: og:title
      content: LightAccount Smart Contract
  - - meta
    - name: description
      content: Follow this guide to use LightAccount with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this guide to use LightAccount with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: LightAccount
  - - meta
    - name: twitter:description
      content: Follow this guide to use LightAccount with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# LightAccount

**Secure, optimized, and extendable**

## Overview

LightAccount is an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart account. We started with the Ethereum Foundation’s canonical [SimpleAccount](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol) and added key improvements. It's fully production-ready with a security [audit](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf), gas optimizations, and [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) signature support. Additionally, LightAccount support ownership transfer to ensure you and your user don't get locked into a particular signer.

## Why LightAccount

### Gas-optimized

LightAccount is engineered to minimize gas costs, as measured by the following benchmarks for common operations like native token transfers, ERC20 transfers, and account creation.

#### Benchmarks

| Account                                                                                                                 | Native transfer | ERC20 transfer | Creation |
| ----------------------------------------------------------------------------------------------------------------------- | --------------- | -------------- | -------- |
| Alchemy LightAccount                                                                                                    | 100844          | 90345          | 279746   |
| Kernel v2.1-lite                                                                                                        | 101002          | 90321          | 230968   |
| [SimpleAccount](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol) | 101319          | 90907          | 383218   |
| Etherspot                                                                                                               | 103719          | 93324          | 279219   |
| Biconomy                                                                                                                | 104408          | 93730          | 270013   |
| Kernel v2.1                                                                                                             | 106460          | 96038          | 265215   |
| Kernel v2.0                                                                                                             | 110018          | 99622          | 339882   |

### Secure, Audited, Open Source

LightAccount has been audited by Quantstamp. You can find the audit report [here](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf). LightAccount is is also fully open source so you can validate the [source code](https://github.com/alchemyplatform/light-account).

### Modular 6900 Accounts (Coming Soon)

We're pioneering the future of modular smart accounts with [EIP-6900](https://www.alchemy.com/blog/account-abstraction-erc-6900). We're developing a [Modular Account](./modular-account.md) to support EIP-6900 coming soon. LightAccount is designed with that future in mind. It is forward-compatible with EIP-6900 so you can upgrade it to 6900-compatible account once the Modular Account is ready.

## Using LightAccount

The code snippet below demonstrates how to use LightAccount with Account Kit. It creates a LightAccount and sends a `UserOperation` from it:

<<< @/snippets/light-account.ts

## Developer Links

- [LightAccount & Simple Account Deployment Addresses](/smart-accounts/accounts/deployment-addresses)
- [LightAccount Github Repo](https://github.com/alchemyplatform/light-account)
- [Quantstamp Audit Report](https://github.com/alchemyplatform/light-account/blob/main/Quantstamp-Audit.pdf)
