---
title: LightSmartContractAccount • getOwnerAddress
description: Overview of the getOwnerAddress method on LightSmartContractAccount
---

# getOwnerAddress

`getOwnerAddress` returns the address of the on-chain owner of the account.

## Usage

:::code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
// get on-chain account owner address
const ownerAddress = await smartAccountClient.account.getOwnerAddress();
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-accounts/lightAccountClient.ts]
```

:::

## Returns

### `Promise<Address>`

A `Promise` containing the address of the smart account's owner address.
