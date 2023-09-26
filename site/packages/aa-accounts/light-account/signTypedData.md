---
outline: deep
head:
  - - meta
    - property: og:title
      content: LightSmartContractAccount
  - - meta
    - name: description
      content: Overview of the signTypedData method on LightSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the signTypedData method on LightSmartContractAccount
---

# signTypedData

`signTypedData` supports signing typed data from the smart contract account's owner address.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";

// sign typed data
const signedTypedData = provider.signTypedData("test");
```

<<< @/snippets/provider.ts
:::

## Returns

### `Promise<Hash>`

A Promise containing the signature of the typed data.

## Parameters

### `params: SignTypedDataParams` -- the typed data to sign
