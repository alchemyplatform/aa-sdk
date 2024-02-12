---
outline: deep
head:
  - - meta
    - property: og:title
      content: getAddress
  - - meta
    - name: description
      content: Overview of the getAddress method on SmartAccountClient
  - - meta
    - property: og:description
      content: Overview of the getAddress method on SmartAccountClient
---

# getAddress

Returns the address of the connected account. Throws error if there is no connected account.

## Usage

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
const address = await smartAccountClient.getAddress();
```

<<< @/snippets/aa-core/smartAccountClient.ts

:::

## Returns

### `Promise<Address>`

A Promise that resolves to the address of the connected account

## Parameters

### `account?: SmartContractAccount`

If your client was not instantiated with an account, then you will have to pass the account in to this call.
