---
outline: deep
head:
  - - meta
    - property: og:title
      content: getAddress
  - - meta
    - name: description
      content: Overview of the getAddress method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the getAddress method on BaseSmartContractAccount
---

# getAddress

Returns the address of the account.

## Usage

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
const address = await provider.account.getAddress();
```

<<< @/snippets/smartAccountClient.ts

:::

## Returns

### `Promise<Hex>`

A promise that resolves to the address of the account
