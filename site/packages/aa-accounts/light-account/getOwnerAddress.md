---
outline: deep
head:
  - - meta
    - property: og:title
      content: LightSmartContractAccount • getOwnerAddress
  - - meta
    - name: description
      content: Overview of the getOwnerAddress method on LightSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the getOwnerAddress method on LightSmartContractAccount
---

# getOwnerAddress

`getOwnerAddress` returns the address of the on-chain owner of the account.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
// get owner
const owner = await provider.account.getOwnerAddress();
```

<<< @/snippets/provider.ts
:::

## Returns

### `Promise<Address>`

A Promise containing the address of the smart account's owner address.
