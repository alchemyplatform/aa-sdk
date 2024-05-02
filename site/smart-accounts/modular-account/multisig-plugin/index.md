---
outline: deep
head:
  - - meta
    - property: og:title
      content: Multisig Plugin Smart Contract
  - - meta
    - name: description
      content: Follow this guide to use the Multisig Plugin on Modular Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - property: og:description
      content: Follow this guide to use the Multisig Plugin on Modular Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - name: twitter:title
      content: Multisig Plugin Smart Contract
  - - meta
    - name: twitter:description
      content: Follow this guide to use the Multisig Plugin on Modular Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Multisig Plugin

## Overview

The Multisig plugin adds `k of n` threshold signature scheme to your Modular Account, similar to [Gnosis Safe](https://safe.global/) accounts. This is a powerful security layer that is recommended for accounts that require additional security and redundancy beyond a single signer.

The `n` signers can be any combination of ECDSA or SCA signers. A threshold of `k` signatures will be required to execute any user operation on the smart account.

## Secure, audited, open source

The Multisig Plugin has been audited by Quantstamp. You can find the audit reports [here](https://github.com/alchemyplatform/multisig-plugin/blob/develop/audits).

It is also fully open source so you can validate the [source code](https://github.com/alchemyplatform/multisig-plugin).

Now, let's [get started](./getting-started.md) with the multisig plugin!

<!--@include: ../../resources/bbp.md-->
