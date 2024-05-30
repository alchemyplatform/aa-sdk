---
title: WalletClientSigner
description: Overview of the WalletClientSigner
---

# WalletClientSigner

The `WalletClientSigner` is useful if you want to convert a `viem` `WalletClient` to a `SmartAccountSigner` which can be used as a signer to use to connect to Smart Contract Accounts

## Usage

:::code-group
<<< @/snippets/signers/wallet-client-signer.ts
:::

## Methods

### `constructor(client: WalletClient)`

Creates a new `WalletClient` using the `WalletClient` to sign messages

### `getAddress(): Promise<Address>`

Returns the public address of the underlying Wallet

### `signMessage(msg: string | Hex | ByteArray): Promise<Hex>`

Signs and returns a message in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191)

### `signTypedData(params: SignTypedDataParams): Promise<Hex>`

Signs and returns a message in [EIP-712 format](https://eips.ethereum.org/EIPS/eip-712) using `eth_signTypedData_v4`
