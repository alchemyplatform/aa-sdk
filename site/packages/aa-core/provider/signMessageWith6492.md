---
outline: deep
head:
  - - meta
    - property: og:title
      content: ISmartAccountProvider • signMessageWith6492
  - - meta
    - name: description
      content: Overview of the signMessageWith6492 method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the signMessageWith6492 method on ISmartAccountProvider
---

# signMessageWith6492

This method supports signing messages for deployed smart contract accounts, as well as undeployed accounts (counterfactual addresses) using [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492).

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
// sign message (works for undeployed and deployed accounts)
const signedMessageWith6492 = provider.signMessageWith6492("test");
```

<<< @/snippets/provider.ts

:::

## Returns

### `Promise<Hash>`

A Promise containing the signature of the message, additionally wrapped in EIP-6492 format if the account is undeployed

## Parameters

### `msg: string | Uint8Array)` -- the message to sign
