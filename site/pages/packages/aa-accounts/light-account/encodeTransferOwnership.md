---
title: LightSmartContractAccount • encodeTransferOwnership
description: Overview of the encodeTransferOwnership method on LightSmartContractAccount
---

# encodeTransferOwnership

`encodeTransferOwnership` is a static class method on the `LightSmartContractAccount` which generates the call data necessary to send a `UserOperation` calling `transferOwnership` on the connected smart contract account.

## Usage

:::code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
// encode transfer ownership
const newOwner = LocalAccountSigner.mnemonicToAccountSigner(NEW_OWNER_MNEMONIC);
const encodedTransferOwnershipData =
  smartAccountClient.account.encodeTransferOwnership({ newOwner });
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-accounts/lightAccountClient.ts]
```

:::

## Returns

### `Promise<Hex>`

A `Promise` containing the encoded Hex of the`transferOwnership` function call with the given parameter

## Parameters

### `newOwner: <Address>` -- the new owner to transfer ownership to for the smart account
