---
title: LightSmartContractAccount • signMessageWith6492
description: Overview of the signMessageWith6492 method on LightSmartContractAccount
---

# signMessageWith6492

`signMessageWith6492` supports signing messages for deployed smart accounts, as well as undeployed accounts (counterfactual addresses) using [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492).

## Usage

:::code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
// sign message (works for undeployed and deployed accounts)
const signedMessageWith6492 = smartAccountClient.signMessageWith6492({
  message: "test",
});
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-accounts/lightAccountClient.ts]
```

:::

## Returns

### `Promise<Hash>`

A `Promise` containing the signature of the message, additionally wrapped in EIP-6492 format if the account is undeployed.

## Parameters

### `msg: string | Uint8Array)` -- the message to sign
