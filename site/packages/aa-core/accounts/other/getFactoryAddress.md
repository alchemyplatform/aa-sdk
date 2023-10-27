---
outline: deep
head:
  - - meta
    - property: og:title
      content: getFactoryAddress
  - - meta
    - name: description
      content: Overview of the getFactoryAddress method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the getFactoryAddress method on BaseSmartContractAccount
---

# getFactoryAddress

Returns the account factory address for the account.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const factoryAddress = await provider.getFactoryAddress();
```

<<< @/snippets/provider.ts

:::

## Returns

### `Address`

The address of the account factory contract
