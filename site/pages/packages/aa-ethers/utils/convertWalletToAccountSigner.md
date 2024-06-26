---
title: Utils • convertWalletToAccountSigner
description: Overview of the convertWalletToAccountSigner method in aa-ethers
---

# Utils

`convertWalletToAccountSigner` converts your ethers.js `Wallet` object into an `SmartAccountSigner` by deriving implementations of its methods: `getAddress`, `signMessage`, and `signTypedData`.

## Usage

```ts [example.ts]
// Wallet is a subclass of Signer, and so can be used with either convertor method
const wallet = new Wallet(process.env.PRIVATE_KEY!);
const accountSigner = convertWalletToAccountSigner(wallet);
```

## Returns

### `SmartAccountSigner`

An instance of `SmartAccountSigner` with implementations derived from the inputted ethers.js `Wallet`

## Parameters

### `wallet: Wallet`

An ethers.js `Wallet` object
