---
outline: deep
head:
  - - meta
    - property: og:title
      content: getNonce
  - - meta
    - name: description
      content: Overview of the getNonce method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the getNonce method on BaseSmartContractAccount
---

# getNonce

Returns the nonce of the account.

## Usage

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
const address = await provider.account.getNonce();
```

<<< @/snippets/smartAccountClient.ts

:::

## Returns

### `Promise<Hex>`

A promise that resolves to the current nonce of the account
