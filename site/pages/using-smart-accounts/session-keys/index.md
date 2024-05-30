---
title: Introduction to using Session Keys
description: Learn about Alchemy's ERC-6900 Compatible Session Key Plugin.
---

# Session Key Plugin overview

The Session Key plugin lets your smart account add additional signers to your Modular Account with specific permissions.

## Why Session Keys?

### Skip duplicate confirmations

Session keys unlock a simplified authentication process by allowing users to interact with apps without needing to confirm each action using their primary key. Instead, users create a session key with permissions specific to the app, then the app can use that key for future actions. This speeds up the user interaction and provides a smoother experience.

### Automate actions

With the ability to delegate specific permissions to session keys, users can automate actions within predefined limits. Session keys can be used to streamline processes like recurring payments, contract interactions, or any activity that benefits from automation.

### Enhance security with permissions

By using session keys, the exposure of the main private key is minimized. Even if a session key is compromised, the attacker would not gain access to the user's main account and funds. This layered approach to security helps in mitigating risks associated with key management.

## Supported permissions

The session key plugin supports the following types of permissions for each key:

### Time range

Supports a start time and an end time for each key.

### Access control lists

Supports either an allowlist or a denylist for addresses. Optionally, access control lists may also specify specific functions on contracts to allow or deny.

### ERC-20 spending Limits

Supports limiting how much of a specific ERC-20 token a key may spend. This may be a total for the key, or refreshing on an interval (e.g. 100 USDC per week).

### Native token spending limits

Supports limiting how much of the native token, e.g. ETH or MATIC, a key may spend. This may be a total for the key, or refreshing on an interval (e.g. 1 ETH per week).

### Gas spending limits

Supports limiting how much of the native token (e.g. ETH or MATIC) a session key can spend on gas. This may be a total for the key, or refreshing on an interval (e.g. 1 ETH per week).

Alternatively, you can also require that a session key uses a specific paymaster address, instead of spending the account’s native token for gas.

Note that the gas limit is tracked in terms of native token units (wei), not in units of gas. The gas usage of a user operation is considered to be the maximum gas a user operation can spend, i.e. `total gas limit * maxFeePerGas`. This can overestimate when compared to the actual gas cost of each user operation.
