---
outline: deep
head:
  - - meta
    - property: og:title
      content: LocalAccountSigner
  - - meta
    - name: description
      content: Overview of the LocalAccountSigner
  - - meta
    - property: og:description
      content: Overview of the LocalAccountSigner
next:
  text: Utils
---

# LocalAccountSigner

The `LocalAccountSigner` allows you to use accounts for which you already have the private key available locally as signers on Smart Contracts. This Signer is used with `HDAccount | PrivateKeyAccount | LocalAccount` types from `viem`.

## Usage

::: code-group

```ts [private-key.ts]
import { LocalAccountSigner } from "@alchemy/aa-core";

export const signer =
  LocalAccountSigner.privateKeyToAccountSigner("0xPrivateKey");
```

```ts [mnemonic.ts]
import { LocalAccountSigner } from "@alchemy/aa-core";

export const signer = LocalAccountSigner.mnemonicToAccountSigner("mnemonic");
```

:::

## Methods

### `constructor<T extends HDAccount | PrivateKeyAccount | LocalAccount>(client: T)`

Creates a new `LocalAccountSigner` using the underlying account type to sign the messages.

### `getAddress(): Promise<Address>`

Returns the public address of the underlying Account

### `signMessage(msg: string | Hex | ByteArray): Promise<Hex>`

Signs and returns a message in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191)

### `signTypedData(params: SignTypedDataParams): Promise<Hex>`

Signs and returns a message in [EIP-712 format](https://eips.ethereum.org/EIPS/eip-712) using `eth_signTypedData_v4`

### `static mnemonicToAccountSigner(key: string): LocalAccountSigner<HDAccount>`

Converts a mnemonic phrase into a `LocalAccountSigner`

### `static privateKeyToAccountSigner(key: Hex): LocalAccountSigner<PrivateKeyAccount>`

Converts a private key hex into a `LocalAccountSigner`
