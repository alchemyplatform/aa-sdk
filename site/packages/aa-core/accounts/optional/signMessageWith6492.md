---
outline: deep
head:
  - - meta
    - property: og:title
      content: signMessageWith6492
  - - meta
    - name: description
      content: Overview of the signMessageWith6492 method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the signMessageWith6492 method on BaseSmartContractAccount
---

# signMessageWith6492

This method wraps the result of `signMessage` as per [EIP-6492](https://eips.ethereum.org/EIPS/eip-6492) for signing the message for deployed smart accounts, as well as undeployed accounts (counterfactual addresses).

**Note**: This method is already implemented on `BaseSmartContractAccount`, so any class that extends and implements `BaseSmartContractAccount` may call this method.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const signedMsgWrappedWith6492 = await provider.signMessageWith6492("msg");
```

<<< @/snippets/provider.ts

:::

## Returns

### `Promise<Hex>`

A promise containing the signature of the message, additionally wrapped in EIP-6492 format if the account is undeployed

## Parameters

### `msg: string | Uint8Array | Hex`

The message to sign
