---
outline: deep
head:
  - - meta
    - property: og:title
      content: Modular Account Smart Contract
  - - meta
    - name: description
      content: Follow this guide to use Modular Accounts with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - property: og:description
      content: Follow this guide to use Modular Accounts with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - name: twitter:title
      content: Modular Account Smart Contract
  - - meta
    - name: twitter:description
      content: Follow this guide to use Modular Accounts with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Modular Account

## Overview

Modular Account is an ERC-4337 smart account that supports customizable feature with ERC-6900 plugins. It’s fully production-ready with multiple security audits, two prebuilt plugins in `MultiOwnerPlugin` and `SessionKeyPlugin`, and the capability to support any custom account behavior you need.

## Why Modular Account?

### Make the most of Account Abstraction

Smart accounts unlocks lots of customizable ways to improve the wallet experience, but it requires writing this behavior into the smart contract for the account, which is difficult and security-critical. Modular Account uses the [ERC-6900](https://eips.ethereum.org/EIPS/eip-6900) framework to simplify creating powerful features for smart accounts. We’ve created two plugins to level up your smart accounts, and look forward to what new plugins you create!

### Multi Owner Plugin

The Multi Owner plugin lets your smart accounts have one or more ECDSA or SCA owners. This lets you account integrate with multiple signers at once, and supports recovering your account if one signer is lost.

Read more about Multi Owner Plugin and how to get started with Modular Account [here]()!

### Session Key Plugin

The Session Key plugin lets your smart account add additional signers to your account with specific permissions.
Session keys can be customized and configured to:

- Contract Restrictions: restrict to only interact with specific contracts and/or a subset of their methods
- Spending Limits: spend up to a set amount of ERC-20 tokens or native token amount
- Time Period: expire after certain time periods

Session keys let you streamline interactions by reducing confirmation steps, or automate actions on behalf of the account. And these features are kept secure through the permission system, which protects the account from malicious use of the session key.

Read more about installing and using the Session Key plugin [here]()!

### Full compatibility

Modular Account also supports the same baseline set of account abstraction features as Light Account: sponsoring gas, batching transactions, rotating owners, and checking ERC-1271 signatures.

### Build your own Plugin

Have an idea for more account features? Modular Account supports ERC-6900 for installing additional plugins to the account, letting you fully customize the account logic.

Check out the plugin development guide [here]() if you’re interested!

### Secure, audited, open source

Modular Account has been audited by Spearbit and Quanstamp. You can find the audit reports [here](). Modular Account is fully open source so you can validate the [source code]().
