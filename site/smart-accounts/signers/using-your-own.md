---
outline: deep
head:
  - - meta
    - property: og:title
      content: Using Your Own Signer
  - - meta
    - name: description
      content: How to use any Signer with Account Kit
  - - meta
    - property: og:description
      content: How to use any Signer with Account Kit
---

# Using Your Own Signer

Account Kit is designed to be flexible and allow you to use any signer you want. You have two options. You can either:

1. If your signer is an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compliant provider, you can leverage `viem`'s `WalletClient` and the `WalletClientSigner` exported in `aa-core`
2. Implement `SmartAccountSigner` (exported in `aa-core`)

## Using `WalletClientSigner`

Viem allows you to create `WalletClient`s which can be used to wrap local or JSON RPC based wallets. You can see the complete docs for leveraging the `WalletClient` [here](https://viem.sh/docs/clients/wallet.html).

We support a `SmartAccountSigner` implementation called `WalletClientSigner` that makes it really easy to use a viem `WalletClient` as an owner on your Smart Contract Account. If your signer is EIP-1193 compliant, it's really easy to use with `WalletClient`. Let's take a look at a simple example:

<<< @/snippets/wallet-client-signer.ts

## Implementing `SmartAccountSigner`

The `SmartAccountSigner` interface is really straighforward:

<<< @/../packages/core/src/signer/types.ts
