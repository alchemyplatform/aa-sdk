---
outline: deep
head:
  - - meta
    - property: og:title
      content: LightSmartContractAccount • encodeTransferOwnership
  - - meta
    - name: description
      content: Overview of the encodeTransferOwnership method on LightSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the encodeTransferOwnership method on LightSmartContractAccount
---

# encodeTransferOwnership

`encodeTransferOwnership` is a static class method on the `LightSmartContractAccount` which generates the call data necessary to send a userOperation calling `transferOwnership` on the connected smart contract account.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
// encode transfer pownership
const newOwner = LocalAccountSigner.mnemonicToAccountSigner(NEW_OWNER_MNEMONIC);
const encodedTransferOwnershipData =
  LightSmartContractAccount.encodeTransferOwnership(newOwner);
```

<<< @/snippets/provider.ts
:::

## Returns

### `Promise<Hex>`

A Promise containing the encoded Hex of the`transferOwnership` function call with the given parameter

## Parameters

### `newOwner: <Address>` -- the new owner to transfer ownership to for the smart contract account
