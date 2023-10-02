---
outline: deep
head:
  - - meta
    - property: og:title
      content: getAddress
  - - meta
    - name: description
      content: Overview of the getAddress method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the getAddress method on ISmartAccountProvider
---

# getAddress

Returns the address of the connected account. Throws error if there is no connected account.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const address = await provider.getAddress();
```

<<< @/snippets/provider.ts

:::

## Returns

### `Promise<Address>`

A Promise that resolves to the address of the connected account
