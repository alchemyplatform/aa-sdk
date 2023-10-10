---
outline: deep
head:
  - - meta
    - property: og:title
      content: isAccountDeployed
  - - meta
    - name: description
      content: Overview of the isAccountDeployed method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the isAccountDeployed method on BaseSmartContractAccount
---

# isAccountDeployed

Returns a boolean flag indicating whether the account has been deployed or not.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const isAccountDeployed = await provider.account.isAccountDeployed();
```

<<< @/snippets/provider.ts

:::

## Returns

### `Promise<boolean>`

A promise that resolves the boolean flag indicating whether the account has been deployed or not
