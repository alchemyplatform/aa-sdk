---
outline: deep
head:
  - - meta
    - property: og:title
      content: isConnected
  - - meta
    - name: description
      content: Overview of the isConnected method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the isConnected method on ISmartAccountProvider
---

# isConnected

Returns the boolean flag indicating if the account is connected.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
const isConnected = await provider.isConnected();
```

<<< @/snippets/provider.ts

:::

## Returns

### `boolean`

The boolean flag indicating if the account is connected
