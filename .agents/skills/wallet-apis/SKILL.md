---
name: wallet-apis
description: |
  Use when changing `packages/wallet-apis`, Wallet API actions, transports,
  TypeBox schemas, viem client wiring, signer handling, or EIP-7702 behavior.
last_verified: 2026-05-06
---

# Wallet APIs

`@alchemy/wallet-apis` is the high-level Wallet API client package. It exposes
stable root APIs, an experimental subpath, and an internal subpath.

## Rules

| Rule                                                                          | When to read                                                       |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [TypeBox codecs](rules/typebox-codecs.md)                                     | Before changing Wallet API request/response validation.            |
| [Smart wallet client defaults](rules/smart-wallet-client-defaults.md)         | Before changing `createSmartWalletClient` or client state.         |
| [React Native runtime constraints](rules/react-native-runtime-constraints.md) | Before adding runtime dependencies to formatting or codec helpers. |

## Evidence

- `packages/wallet-apis/package.json` exports `.`, `./experimental`, and
  `./internal`.
- `packages/wallet-apis/src/client.ts` creates the viem client and defaults the
  account to the signer's address when omitted.
- `packages/wallet-apis/src/utils/schema.ts` wraps TypeBox encode/decode errors.
