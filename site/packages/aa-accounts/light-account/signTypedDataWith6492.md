---
outline: deep
head:
  - - meta
    - property: og:title
      content: LightSmartContractAccount
  - - meta
    - name: description
      content: Overview of the signTypedDataWith6492 method on LightSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the signTypedDataWith6492 method on LightSmartContractAccount
---

# signTypedDataWith6492

`signTypedDataWith6492` supports signing typed data for deployed smart contract accounts, as well as undeployed accounts (counterfactual addresses) using EIP-6492.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";

// sign typed data (works for undeployed and deployed accounts)
const signedTypedDataWith6492 = provider.signMessageWith6492("test");
```

<<< @/snippets/provider.ts
:::

## Returns

### `Promise<Hash>`

A Promise containing the signature of the typed data, additionally wrapped in EIP-6492 format if the account is undeployed.

## Parameters

### `params: SignTypedDataParams` -- the typed data to sign

- `provider: SmartAccountProvider & { account: LightSmartContractAccount }` -- the provider to use to send the transaction
- `newOwner: Address` -- the new owner of the account
- `waitForTxn?: boolean` -- optionally, wait for the transaction to be mined with the UO
