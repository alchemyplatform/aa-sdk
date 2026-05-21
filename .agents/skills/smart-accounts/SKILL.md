---
name: smart-accounts
description: |
  Use when changing `packages/smart-accounts`, account implementations,
  modules, permissions, nonces, deferred actions, or account address helpers.
last_verified: 2026-05-06
---

# Smart Accounts

`@alchemy/smart-accounts` exposes Light Account, Multi-Owner Light Account,
Modular Account v1/v2, module helpers, permissions, and deferred actions.

## Rules

| Rule                                                        | When to read                                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [Account types](rules/account-types.md)                     | Before changing account constructors, address prediction, or static implementations. |
| [Modules and permissions](rules/modules-and-permissions.md) | Before changing module install/uninstall or permission builder code.                 |
| [Deferred actions](rules/deferred-actions.md)               | Before changing deferred action encoding, signing, or execution helpers.             |

## Evidence

- `packages/smart-accounts/src/index.ts` is the public export surface.
- The reference docs include Light Account, Modular Account v1/v2, modules,
  permissions, entity/nonce errors, and deferred action helpers.
