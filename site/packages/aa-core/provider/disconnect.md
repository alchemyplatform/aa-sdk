---
outline: deep
head:
  - - meta
    - property: og:title
      content: disconnect
  - - meta
    - name: description
      content: Overview of the disconnect method on ISmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the disconnect method on ISmartAccountProvider
---

# disconnect

Allows for disconnecting the account from the provider so that the provider can connect to another account instance.

This function emits `disconnect` and `accountsChanged` events to notify listeners about the connection.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
await provider.disconnect();
```

<<< @/snippets/provider.ts
:::

## Returns

### `ISmartAccountProvider`

The provider with the account disconnected
