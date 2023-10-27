---
outline: deep
head:
  - - meta
    - property: og:title
      content: getEntryPointAddress
  - - meta
    - name: description
      content: Overview of the getEntryPointAddress method on BaseSmartContractAccount
  - - meta
    - property: og:description
      content: Overview of the getEntryPointAddress method on BaseSmartContractAccount
---

# getEntryPointAddress

Returns the EntryPoint contract address for the account.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const entryPointAddress = await provider.getEntryPointAddress();
```

<<< @/snippets/provider.ts

:::

## Returns

### `Address`

The address of the EntryPoint contract
