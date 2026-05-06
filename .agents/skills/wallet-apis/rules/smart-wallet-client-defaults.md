# Smart Wallet Client Defaults

Preserve `createSmartWalletClient`'s default EIP-7702 account behavior.

## Why

When `account` is omitted, `createSmartWalletClient` uses the signer's address.
The TSDoc states this lets callers use `prepareCalls` or `sendCalls` directly
without first calling `requestAccount`.

## Good

- Keep `account ?? signer address` behavior unless the API contract changes.
- Preserve `policyId` plus `policyIds` merging into the client's `policyIds`
  state.
- Keep the returned viem client extended with internal state, owner, and
  `smartWalletActions`.

## Bad

Requiring `requestAccount` before every `prepareCalls` or `sendCalls` call when
the signer address should be enough for the EIP-7702 path.

## Exceptions

If a change intentionally removes or redefines the EIP-7702 default, update
TSDoc, docs, tests, and release notes because this is consumer-visible.
