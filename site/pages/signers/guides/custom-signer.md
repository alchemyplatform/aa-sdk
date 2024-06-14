---
outline: deep
title: How to use your own Account Signer
description: Follow this guide to use any Signer you want with Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# How to use your own Account Signer

Account Kit is designed to be flexible and allow you to use any Signer you want. Depending on your usecase, you can either:

1. Implement [`SmartAccountSigner`](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/signer/types.ts#L34) (exported in `aa-core`).
2. If your Signer is an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant provider, you can leverage `viem`'s `WalletClient` and the [`WalletClientSigner`](/packages/aa-core/signers/wallet-client) (exported in `aa-core`).

## 1. Implementing `SmartAccountAuthenticator` or `SmartAccountSigner`

Smart accounts in Account Kit expect an implementation of `SmartAccountSigner` to work in Account Kit. We also include a `SmartAccountAuthenticator` interface that extends `SmartAccountSigner` and wraps any SDKs you may wish to use as part of the implementation of your own Signer.

```ts [types.ts]
// [!include ~/../aa-sdk/core/src/signer/types.ts]
```

## 2. Using `WalletClientSigner`

Viem allows you to create a `WalletClient`, which can be used to wrap local or JSON RPC based wallets. You can see the complete docs for leveraging the `WalletClient` [here](https://viem.sh/docs/clients/wallet).

We support a `SmartAccountSigner` implementation called `WalletClientSigner` that makes it really easy to use a viem `WalletClient` as a signer on your Smart Contract Account. If your Signer is [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant, it is really easy to use with `WalletClient`. Let's take a look at a simple example:

```ts [wallet-client-signer.ts]
// [!include ~/snippets/signers/wallet-client-signer.ts]
```
