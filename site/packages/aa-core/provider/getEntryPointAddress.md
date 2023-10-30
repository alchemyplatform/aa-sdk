---
outline: deep
head:
  - - meta
    - property: og:title
      content: getEntryPointAddress
  - - meta
    - name: description
      content: Overview of the getEntryPointAddress method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the getEntryPointAddress method on ISmartAccountProvider
---

# getEntryPointAddress

Returns the EntryPoint contract address being used for the provider.

If the provider is connected with a `SmartContractAccount`, the EntryPoint contract of the connected account is used for the provider.

If not connected, it fallbacks to the default entry point contract for the chain, unless the optional parameter `entryPointAddress` was given during the initialization as an override.

Refer to https://docs.alchemy.com/reference/eth-supportedentrypoints for all the supported entrypoints when using Alchemy as your RPC provider.

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
