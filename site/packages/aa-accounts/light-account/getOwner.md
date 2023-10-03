---
outline: deep
head:
  - - meta
    - property: og:title
      content: LightSmartContractAccount • getOwner
  - - meta
    - name: description
      content: Overview of the getOwner method on LightSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the getOwner method on LightSmartContractAccount
---

# getOwner

`getOwner` returns the on-chain owner of the account.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
// get owner
const owner = provider.account.getOwner();
```

<<< @/snippets/provider.ts
:::

## Returns

### `Promise<Address>`

A Promise containing the address of the smart contract account's owner.
